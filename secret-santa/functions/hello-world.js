// npm install node-emoji
const emoji = require('node-emoji');
const { getRecords, addParticipant, updateName } = require('../assets/airtable');

exports.handler = async function (context, event, callback) {
  console.log("START OF FUNCTION")

  const twiml = new Twilio.twiml.MessagingResponse();
  const body = event.Body || event.body;
  const from = event.From || event.from;
  console.log("body:", body, "from:", from);

  let records = [];
  try {
    records = await getRecords(context);
  } catch (err) {
    console.error('Error fetching records from Airtable', err);
    return callback(err);
  }

  const targetRecord = records.find(record => record.get('Phone Number') === from);

  if (targetRecord && !targetRecord.get('Name')) {
    twiml.message(`Thanks ${body}! ${emoji.get('christmas_tree')}`);
    twiml.message(`Text this number at any time to send a message to your Secret Santa ${emoji.get('gift')}`);

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

  if (body.toUpperCase() === "SANTA") {
    twiml.message(`${emoji.get('gift')} Welcome to Secret Santa! ${emoji.get('santa')} `);
    twiml.message(`Reply with your name to get added to the list ${emoji.get('sparkles')}`);
    try {
      await addParticipant(context, from);
    } catch (err) {
      console.error('Error adding participant', err);
      return callback(err);
    }
  } else {
    twiml.message(`You're supposed to say 'SANTA' ${emoji.get('confused')}`);
  }

  callback(null, twiml);
};
