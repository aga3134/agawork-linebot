const line = require('@line/bot-sdk');
const express = require('express');
const Config = require('./config');
var LinebotRoute = require('./app/route/linebotRoute.js');

const app = express();
app.port = Config.serverPort;
app.host = '0.0.0.0';
app.use(line.middleware(Config.linebot));
app.use('/linebot', LinebotRoute);

app.listen(app.port, app.host, () => {
  console.log('Agawork linebot started');
});
