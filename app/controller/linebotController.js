const line = require('@line/bot-sdk');
const Config = require('../../config');
const client = new line.Client(Config.linebot);
var lc = {};

lc.HandleEvent = function(event){
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const echo = { type: 'text', text: event.message.text };
  return client.replyMessage(event.replyToken, echo);
};