const line = require('@line/bot-sdk');
const Config = require('../../config');
const client = new line.Client(Config.linebot);
var lc = {};

lc.HandleEvent = function(event){
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  client.getNumberOfMessagesSentThisMonth().then((response) => {
    console.log(response);
    var message = event.message.text;
    const echo = { type: 'text', text: message};
    return client.replyMessage(event.replyToken, echo);
  })
};

module.exports = lc;
