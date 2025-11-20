// npm install node-emoji
const emoji = require('node-emoji');
// const airtable = require('airtable');
var Airtable = require('airtable');


exports.handler = async function (context, event, callback) {
  console.log("START OF FUNCTION")

  const twiml = new Twilio.twiml.MessagingResponse();
  const body = event.Body || event.body;
  const from = event.From || event.from;
  console.log("body:", body, "from:", from);
  var base = new Airtable({ apiKey: context.AIRTABLE_TOKEN }).base('appqdIjIRquGZOwP0');

  const records = await base('tbl0ftTRWwv63mgaH').select({
    view: 'Grid view'
  }).firstPage();

  const phoneNumbers = records.map(record => record.get('Phone Number'));

  console.log(phoneNumbers);

  if (phoneNumbers.includes(from)) {
    twiml.message(`Thanks ${body}, you are now on the list! ${emoji.get('christmas_tree')}`);
    twiml.message(`Text this number at any time to send a message to your Secret Santa. ${emoji.get('gift')}`);

    callback(null, twiml);
    return;
  }

  if (body.toUpperCase() === "SANTA") {
    // const message = twiml.message();
    twiml.message(`${emoji.get('gift')} Welcome to Secret Santa! ${emoji.get('santa')} `);
    // message.media('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZndxNGlvdXB1dDBzcng1bG1jeXMzaG52YzN0bWFrcTQ2MmZkbmN4eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/FHqFssDjhXWF6mbTXB/giphy.gif')
    twiml.message(`Reply with your name to get added to the list ${emoji.get('sparkles')}`);
    base('Participants').create({ "Phone Number": from });
  } else {
    twiml.message(`You're supposed to say 'SANTA' ${emoji.get('confused')}`);
  }

  callback(null, twiml);
};
