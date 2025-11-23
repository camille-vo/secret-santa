// npm install node-emoji
const emoji = require('node-emoji');

exports.handler = async function (context, event, callback) {
  const { getRecords, addParticipant, updateName } = require(Runtime.getAssets()['/airtable.js'].path);
  const { assignGiftees, validateGiftees, broadcastMatches } = require(Runtime.getAssets()['/helpers.js'].path);

  const twiml = new Twilio.twiml.MessagingResponse();
  const body = (event.Body || event.body).trim();
  const from = event.From || event.from;
  // twiml.from = "8883820737";

  let records = [];
  try {
    records = await getRecords(context);
  } catch (err) {
    console.error('Error fetching records from Airtable', err);
    return callback(err);
  }

  const targetRecord = records.find(record => record.get('Phone Number') === from);


  if (body.toUpperCase() === "SANTA" && !targetRecord) {
    twiml.message(`${emoji.get('gift')} Welcome to Secret Santa! ${emoji.get('santa')} `);
    twiml.message(`Reply with your name to get added to the list ${emoji.get('sparkles')}`);
    try {
      await addParticipant(context, from);
    } catch (err) {
      console.error('Error adding participant', err);
      return callback(err);
    }
  }
  else if (body.toUpperCase() === "LIST") {
    records.forEach(record => {
      const name = record.get('Name') || 'NO NAME ADDED';
      const phone = record.get('Phone Number');
      twiml.message(`Name: ${name}, Phone: ${phone}`);
    });
  } else if (body.toUpperCase() === "MATCH") {
    try {
      await assignGiftees(context, records);
    } catch (err) {
      console.error('Error assigning giftees', err);
      return callback(err);
    }
    const updatedRecords = await getRecords(context);
    const errors = validateGiftees(updatedRecords);
    if (!errors.isValid && errors.errors.length > 0) {
      errors.errors.forEach(error => twiml.message(`Error: ${error}`));
    } else {
      twiml.message(`All giftees assigned successfully! ${emoji.get('tada')}`);
    }
    callback(null, twiml);
    return;
  } else if (body.toUpperCase() === "BROADCAST") {
    // Broadcast match messages to all participants
    const result = await broadcastMatches(context, records, emoji);
    twiml.message(`Successfully sent ${result.successCount} messages, failed to send ${result.failureCount} messages.`);
    callback(null, twiml);
    return;
  } else if (body.toUpperCase() === "REVEAL") {
    records.filter(record => record.fields.Name).forEach(record => {
      const name = record.get('Name');
      const gifteeId = record.get('Giftee');
      const gifteeRecord = records.find(r => r.id === gifteeId);
      const gifteeName = gifteeRecord ? gifteeRecord.get('Name') : 'Unknown';
      twiml.message(`${name} is buying gifts for ${gifteeName}`);
    })
  } else if (targetRecord && !targetRecord.get('Name')) {
    twiml.message(`Thanks ${body}! ${emoji.get('christmas_tree')}`);
    twiml.message(`After assignments are made, text this number at any time to send a message to your Secret Santa ${emoji.get('gift')}`);

    try {
      await updateName(context, targetRecord.id, body);
    } catch (err) {
      console.error('Error updating name in Airtable', err);
      return callback(err);
    }

    callback(null, twiml);
    return;
  } else if (targetRecord) {
    twiml.message(`Hi ${targetRecord.get('Name')}! You're already registered. ${emoji.get('smile')}`);
    callback(null, twiml);
    return;
  }
  else {
    twiml.message(`You're supposed to say 'SANTA' ${emoji.get('confused')}`);
  }

  callback(null, twiml);
};
