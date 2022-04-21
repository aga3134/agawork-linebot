const line = require('@line/bot-sdk');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs'); 
const Config = require('../../config');
const client = new line.Client(Config.linebot);
let lc = {};
var content = null;

//create rich menu
const mainMenu = {
  size: {width: 2500,height: 1686},
  selected: true,
  name: 'mainMenu',
  chatBarText: '主選單',
  areas: [
    {
      bounds: {x: 50,y: 45,width: 800,height: 800},
      action: {
        type: 'postback',
        data: 'action=project'
      }
    },
    {
      bounds: {x: 850,y: 45,width: 800,height: 800},
      action: {
        type: 'postback',
        data: 'action=resource'
      }
    },
    {
      bounds: {x: 1650,y: 45,width: 800,height: 800},
      action: {
        type: 'postback',
        data: 'action=about'
      }
    },
    {
      bounds: {x: 50,y: 845,width: 800,height: 800},
      action: {
        type: 'postback',
        data: 'action=donate'
      }
    },
    {
      bounds: {x: 850,y: 845,width: 800,height: 800},
      action: {
        type: 'postback',
        data: 'action=partner'
      }
    },
    {
      bounds: {x: 1650,y: 845,width: 800,height: 800},
      action: {
        type: 'postback',
        data: 'action=contact'
      }
    },
  ]
};

const main = async () => {
  const mainMenuID = await client.createRichMenu(mainMenu);

  const imageName = 'static/image/mainMenu.png';
  const imageBuffer = fs.readFileSync(imageName);
  await client.setRichMenuImage(mainMenuID, imageBuffer);

  await client.setDefaultRichMenu(mainMenuID);

  //load project content from agawork
  axios.get(Config.agaworkHost+'/static/content.json').then(res => {
    content = res;
  }).catch(error => {
    console.error(error);
  });
};
main();

lc.HandleEvent = function(event){
  if (event.type == 'message') {
    if(event.message.type == 'text'){ //echo
      var message = event.message.text;
      const echo = { type: 'text', text: message};
      return client.replyMessage(event.replyToken, echo);
    }
  }
  else if(event.type == 'postback'){
    console.log(event.postback.data);
  }
  else{
    return Promise.resolve(null);
  }
};

module.exports = lc;
