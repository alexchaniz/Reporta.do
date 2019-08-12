'use strict';

const request = require('request');

// page acces token> EAAHxOF5ZBsSoBAMCneBZBRZBhac2ZCsYNVRLMS5aLuyjwGe0ayZB6ZCptcPmLs6AQ0qOeV4ZAJjHDOi2fOCMBJU2kR7wItickH6hJn4Y7Ki1iIFEC2dWTXdigF54QOLZBiflYy773P1JRH6t8HCEPvEer9q8TG46Csi2ZCdKTnUM3kAZDZD 
//Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log("webhook event: " + webhook_event.type);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
      
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          console.log("1---------------------------------------------");
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          console.log("2---------------------------------------------");
          handlePostback(sender_psid, webhook_event.postback);
        }
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
  });

  // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });

  

  // Handles messages events
  function handleMessage(sender_psid, received_message) {
    console.log("Handling message: ");
    
    let response;
    let kind=0;

    console.log("//////////" + JSON.stringify(received_message))
    
    // Check if the message contains text
    if (received_message.text) {    
      console.log(received_message.text)
      // Create the payload for a basic text message
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an image!`
      }
      
    } else if (received_message.attachments) {

      if(received_message.attachments.coordinates){

      console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"+JSON.stringify(received_message.attachments.coordinates))
      }else{
     // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    console.log("the picture is in the link: " + attachment_url)
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } }
    // Sends the response message
    callSendAPI(sender_psid, response, kind);    
  }

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  let kind=0;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  } else if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    /*request({
      url: "https://graph.facebook.com/v2.6/" + sender_psid,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response2, body) {
      var greeting = "";
      var name = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        console.log(bodyObj)
        name = bodyObj.first_name;
        greeting = "Hola " + name + ". ";
      }
      response = greeting + "Bienvenido a DominiBot.";   
    });*/
    response = {
      "text": "Pick a color:",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Red",
          "payload":"<POSTBACK_PAYLOAD>",
          "image_url":""
        },{
          "content_type":"text",
          "title":"Green",
          "payload":"<POSTBACK_PAYLOAD>",
          "image_url":""
        }
      ]
    }
    kind=1;
  }
  
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response, kind);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response, kind) {
  // Construct the message body
  let request_body
  if(kind=1){
    request_body = {
      "recipient": {
        "id": sender_psid
    },
    "messaging_type": "RESPONSE",
    "message": response
  }}else {
   request_body = {
      "recipient": {
        "id": sender_psid
      },
      "messaging_type": "RESPONSE",
      "message": response
    }  }

  console.log(process.env.PAGE_ACCESS_TOKEN)
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}