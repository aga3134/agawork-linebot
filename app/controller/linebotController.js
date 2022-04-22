const line = require('@line/bot-sdk');
const axios = require('axios');
const fs = require('fs'); 
const Config = require('../../config');
const client = new line.Client(Config.linebot);
let lc = {};
const recreateMenu = false;

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
        type: 'richmenuswitch',
        richMenuAliasId: 'sort-menu',
        data: 'action=goToSortMenu'
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
        type: 'uri',
        uri: 'https://p.ecpay.com.tw/D95AD'
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

const sortMenu = {
  size: {width: 2500,height: 1686},
  selected: false,
  name: 'sortMenu',
  chatBarText: '專案排序',
  areas: [
    {
      bounds: {x: 50,y: 45,width: 1200,height: 800},
      action: {
        type: 'postback',
        data: 'action=sortByTime'
      }
    },
    {
      bounds: {x: 850,y: 45,width: 1200,height: 800},
      action: {
        type: 'postback',
        data: 'action=sortByIssue'
      }
    },
    {
      bounds: {x: 50,y: 845,width: 1200,height: 800},
      action: {
        type: 'postback',
        data: 'action=sortBySkill'
      }
    },
    {
      bounds: {x: 850,y: 845,width: 1200,height: 800},
      action: {
        type: 'richmenuswitch',
        richMenuAliasId: 'main-menu',
        data: 'action=goToMainMenu'
      }
    },
  ]
};

const RecreateRichMenu = async () => {
  try{
    const menuArr = await client.getRichMenuList();
    for(let i=0;i<menuArr.length;i++){
      let richmenu = menuArr[i];
      console.log('delete '+richmenu.richMenuId);
      await client.deleteRichMenu(richmenu.richMenuId);
    }
    const aliasArr = await client.getRichMenuAliasList();
    //console.log(aliasArr);
    for(let i=0;i<aliasArr.aliases.length;i++){
      let alias = aliasArr.aliases[i];
      console.log('delete alias'+alias.richMenuAliasId);
      await client.deleteRichMenuAlias(alias.richMenuAliasId);
    }

    const mainMenuID = await client.createRichMenu(mainMenu);
    const mainMenuImage = 'static/image/mainMenu.png';
    const mainMenuImageBuffer = fs.readFileSync(mainMenuImage);
    await client.setRichMenuImage(mainMenuID, mainMenuImageBuffer);
    console.log('create '+mainMenuID);

    const sortMenuID = await client.createRichMenu(sortMenu);
    const sortMenuImageName = 'static/image/sortMenu.png';
    const sortMenuImageBuffer = fs.readFileSync(sortMenuImageName);
    await client.setRichMenuImage(sortMenuID, sortMenuImageBuffer);
    console.log('create '+sortMenuID);

    await client.setDefaultRichMenu(mainMenuID);
    await client.createRichMenuAlias(mainMenuID, 'main-menu');
    await client.createRichMenuAlias(sortMenuID, 'sort-menu');
  }
  catch(err){
    console.log(err.originalError.response.data);
  }
};
if(recreateMenu) RecreateRichMenu();

lc.HandleEvent = function(event){
  //console.log(event.type);
  axios.get(Config.agaworkHost+'/static/content.json').then(res => {
    let result = res.data;
    let msg = [];
    if (event.type == 'message') {
      if(event.message.type == 'text'){
        let reqText = event.message.text;
        //check if message match a name in category
        let key = '';
        let desc = '';
        for(let i=0;i<result.timeCategory.length;i++){
          if(key != '') break;
          let cat = result.timeCategory[i];
          if(reqText == cat.name){
            key = 'time';
            desc = cat.desc;
          }
        }
        for(let i=0;i<result.issueCategory.length;i++){
          if(key != '') break;
          let cat = result.issueCategory[i];
          if(reqText == cat.name){
            key = 'issue';
            desc = cat.desc;
          }
        }
        for(let i=0;i<result.skillCategory.length;i++){
          if(key != '') break;
          let cat = result.skillCategory[i];
          if(reqText == cat.name){
            key = 'skill';
            desc = cat.desc;
          }
        }
        if(key == ''){  //查無專案類別
          msg.push({ type: 'text', text: 'Agawork目前沒有相關專案，若有合作需求，請直接聯絡到處跳坑的工程師 aga3134@gmail.com'});
        }
        else{
          let projArr = [];
          for(let i=0;i<result.project.length;i++){
            let project = result.project[i];
            if(project[key].includes(reqText)){
              projArr.push(project);
            }
          }
          //console.log(projArr);
          //add project in flex box
          let content = [];
          for(let i=0;i<projArr.length;i++){
            let project = projArr[i];
            let linkArr = [];
            for(let j=0;j<project.link.length;j++){
              let link = project.link[j];
              linkArr.push({
                'type': 'button',
                'style': 'link',
                'height': 'sm',
                'action':{
                  'type': 'uri',
                  'label': link.name,
                  'uri': link.url
                }
              });
            }
            //console.log(linkArr);
            content.push({
              'type': 'bubble',
              'size': 'kilo',
              'hero': {
                'type': 'image',
                'url': Config.agaworkHost+'/'+project.photo,
                'size': 'full',
              },
              'body':{
                'type':'box',
                'layout': 'vertical',
                'spacing': 'none',
                'contents':[
                  {
                    'type': 'text',
                    'text': project.name,
                    'weight': 'bold',
                    'size': 'md',
                    'wrap': true
                  },
                  {
                    'type': 'text',
                    'text': project.desc,
                    'size': 'sm',
                    'wrap': true
                  }
                ]
              },
              'footer':{
                'type': 'box',
                'layout': 'vertical',
                'spacing': 'xs',
                'contents': linkArr
              }
            });
          }
          //console.log(content);
          if(content.length == 0){
            msg.push({ type: 'text', text: '查無相關專案'});
          }
          else{
            let flexObj = {
              'type': 'flex',
              'altText': '這是專案列表',
              'contents': {
                'type': 'carousel',
                'contents': content
              }
            };
            msg.push({ type: 'text', text: desc});
            msg.push(flexObj);
          }
        }
        client.replyMessage(event.replyToken, msg).catch(err => {
          console.log(err.originalError.response.data);
        });
      }
    }
    else if(event.type == 'postback'){
      let data = new URLSearchParams(event.postback.data);
      let action = data.get('action');
      //load project content from agawork
      
      switch(action){
      case 'resource':
        {
          let content = [];
          for(let i=0;i<result.resource.length;i++){
            let resource = result.resource[i];
            content.push({
              'type': 'button',
              'action': {
                'type': 'uri',
                'label': resource.name,
                'uri': resource.url
              },
            });
          }
          let flexObj = {
            'type': 'flex',
            'altText': '這是資源列表',
            'contents':{
              'type':'bubble',
              'body':{
                'type':'box',
                'layout':'vertical',
                'contents':content
              }
            }
          };
          msg.push(flexObj);
        }
        break;
      case 'about':
        {
          let hero = {
            'type': 'image',
            'url': Config.agaworkHost+'/'+result.about.photo,
            'size': 'full'
          };
          let body = {
            'type': 'box',
            'layout': 'vertical',
            'contents':[
              {
                'type': 'text',
                'wrap': true,
                'text': result.about.desc
              }
            ]
          };
          let content = [];
          for(let i=0;i<result.about.link.length;i++){
            let link = result.about.link[i];
            content.push({
              'type': 'button',
              'style': 'link',
              'height': 'sm',
              'action':{
                'type': 'uri',
                'label': link.name,
                'uri': link.url
              }
            });
          }
          let footer = {
            'type': 'box',
            'layout': 'vertical',
            'spacing': 'xs',
            'contents': content
          };
          let flexObj = {
            'type': 'flex',
            'altText': '這是關於Agawork',
            'contents':{
              'type':'bubble',
              'hero': hero,
              'body': body,
              'footer': footer
            }
          };
          msg.push(flexObj);
        }
        break;
      case 'partner':
        {
          let content = [];
          for(let shape in result.partner){
            for(let i=0;i<result.partner[shape].length;i++){
              let partner = result.partner[shape][i];
              content.push({
                'type': 'box',
                'layout':'horizontal',
                'alignItems': 'center',
                'spacing': 'xs',
                'contents':[
                  {
                    'type': 'image',
                    'url': Config.agaworkHost+'/'+partner.url
                  },
                  {
                    'type': 'text',
                    'text': partner.name
                  },
                ],
                'action': {
                  'type': 'uri',
                  'label': partner.name,
                  'uri': partner.link
                }
              });
            }
          }
          //console.log(content);
          
          let flexObj = {
            'type': 'flex',
            'altText': '這是夥伴列表',
            'contents':{
              'type':'bubble',
              'body':{
                'type':'box',
                'layout':'vertical',
                'contents':content
              }
            }
          };
          msg.push(flexObj);
        }
        break;
      case 'contact':
        msg.push({ type: 'text', text: '請直接寄email至 aga3134@gmail.com'});
        break;
      case 'sortByTime':
        {
          let quickReply = {items:[]};
          for(let i=0;i<result.timeCategory.length;i++){
            let cat = result.timeCategory[i];
            quickReply.items.push({
              'type': 'action',
              'action':{
                'type':'message',
                'label':cat.name,
                'text':cat.name
              }
            });
          }
          msg.push({ type: 'text', text: '請選擇不同時期的專案',quickReply:quickReply});
        }
        break;
      case 'sortByIssue':
        {
          let quickReply = {items:[]};
          for(let i=0;i<result.issueCategory.length;i++){
            let cat = result.issueCategory[i];
            quickReply.items.push({
              'type': 'action',
              'action':{
                'type':'message',
                'label':cat.name,
                'text':cat.name
              }
            });
          }
          msg.push({ type: 'text', text: '請選擇不同議題的專案',quickReply:quickReply});
        }
        break;
      case 'sortBySkill':
        {
          let quickReply = {items:[]};
          for(let i=0;i<result.skillCategory.length;i++){
            let cat = result.skillCategory[i];
            quickReply.items.push({
              'type': 'action',
              'action':{
                'type':'message',
                'label':cat.name,
                'text':cat.name
              }
            });
          }
          msg.push({ type: 'text', text: '請選擇不同技能的專案',quickReply:quickReply});
        }
        break;
      }
      //console.log(msg);
      client.replyMessage(event.replyToken, msg).catch(err => {
        console.log(err.originalError.response.data);
      });
    }
    else{
      return Promise.resolve(null);
    }
  }).catch(err => {
    console.error(err);
  });
};

module.exports = lc;
