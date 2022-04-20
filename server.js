const line = require('@line/bot-sdk');
const express = require('express');
const Config = require('./config');

const client = new line.Client(Config.linebot);
const app = express();
app.port = Config.serverPort;
app.host = '0.0.0.0';

app.post('/linebot', line.middleware(Config.linebot), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const echo = { type: 'text', text: event.message.text };
  return client.replyMessage(event.replyToken, echo);
}

app.listen(app.port, app.host, () => {
  console.log('Agawork linebot started');
});
