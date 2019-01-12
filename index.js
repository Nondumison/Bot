const express = require('express')
const bodyParser = require('body-parser')
const request=require('request')

const app = express()

const token = process.env.FB_VERIFY_TOKEN
const access = process.env.FB_ACCESS_TOKEN

app.set('port',(process.env.PORT || 5000))

//Allows us to process the data

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//ROUTES

app.get('/', function(req, res){
  res.send("Hello I am chatbot");
})

//Facebook
app.get('/webhook/', function(req, res){
  if(req.query['hub.verify_token'] === token){
    res.send(req.query['hub.challenge'])
  }
  res.send("wrong token")
})

//server

app.listen(app.get('port'), function(){
  console.log("running: port")
})


// app.post('/webhook/', function(req, res){
//    var data = req.body;
//
//    //make sure this is a page subscription
//
//    if (data.object === 'page') {
//
//      //Iterate over each entry
//      data.entry.forEach(function(entry){
//        var pageID = entry.id;
//        var timeOfEvent = entry.time;
//
//        //Iterate over each messaging timeOfEvent
//        entry.messaging.forEach(function(event){
//          if (event.message){
//            receivedMessage(event);
//          }else {
//            console.log("webhook received unknown event:", event);
//          }
//        });
//      });
//
//      //assume all went well.
//      //
//      //you must send back a 200
//      res.sendStatus(200);
//    }
// });
//
// function receivedMessage(event){
//   //putting a stub for unknown
// //console.log("Message data: ", event.message);
// var senderID = event.sender.id;
// var recipientID = event.recipient.id;
// var timeOfMessage = event.timestamp;
// var message = event.message;
//
// console.log("Received message for user %d and page %d at %d with message:",
//  senderID, recipientID, timeOfMessage);
//  console.log(JSON.stringfy(message));
//
//  var messageId = message.mid;
//
//  var messageText = message.text;
//  var messageAttachments = message.attachments;
//
//  if (messageText){
//
//    //if we receive a text messageId
//    //and send back the example
//
//    switch (messageText) {
//      case 'generic':
//        sendGenericMessage(senderID);
//        break;
//
//      default:
//      sendTextMessage(senderID, messageText);
//
//    }
//  }else if (messageAttachments){
//    sendTextMessage(senderID, "Message with attachment received");
//  }
// }
//
// function sendGenericMessage(recipientId, messageText) {
//   //to be expanded later
// }
//
// function sendTextMessage(recipientId, messageText) {
//   var messageData = {
//     recipient: {
//         id: recipientId
//     },
//     message: {
//         text:messageText
//     }
//   };
//   callSendAPI(messageData);
// }
//
//
// function callSendAPI(messageData){
//   request({
//      uri: 'https://graph.facebook.com/v2.6/me/messages',
//      qs: {access_token: access },
//       method: 'POST',
//       json: messageData
//
//     }, function(error, response, body){
//       if (!error && response.statusCode == 200){
//         var recipientId = body.recipient_id;
//         var messageId = body.message_id;
//
//         console.log("Successfully sent generic message with id %s to recipient %s",
//           messageId, recipientId);
//       }else {
//         console.error("Unable to send message.");
//         console.error(response);
//         console.error(error);
//
//       }
//
//   });
// }


//what I took from github

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text === 'Generic') {
            sendGenericMessage(sender)
            continue
        }
        sendTextMessage(sender, "Message received: " + text.substring(0, 200))
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback: "+text.substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })


function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:access},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: access},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
