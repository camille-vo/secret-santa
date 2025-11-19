// npm install node-emoji
const emoji = require('node-emoji');

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();
  const body = event.Body || event.body;

    if (body.toUpperCase() === "SANTA") {
      const message = twiml.message();
      message.body(`${emoji.get('gift')} Welcome to Secret Santa! ${emoji.get('santa')} `);
      message.media('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZndxNGlvdXB1dDBzcng1bG1jeXMzaG52YzN0bWFrcTQ2MmZkbmN4eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/FHqFssDjhXWF6mbTXB/giphy.gif')
    } else {
      twiml.message(`You're supposed to say 'SANTA' ${emoji.get('confused')}`);
    }

  console.log('Event received:', event);
  callback(null, twiml);
};
