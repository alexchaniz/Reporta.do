'use strict';

const request = require('request');

// page acces token> EAAHxOF5ZBsSoBAMCneBZBRZBhac2ZCsYNVRLMS5aLuyjwGe0ayZB6ZCptcPmLs6AQ0qOeV4ZAJjHDOi2fOCMBJU2kR7wItickH6hJn4Y7Ki1iIFEC2dWTXdigF54QOLZBiflYy773P1JRH6t8HCEPvEer9q8TG46Csi2ZCdKTnUM3kAZDZD 
//Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var d = new Date();
mongoose.set('useFindAndModify', false);

var response;

//setting option and responses
var grettingsReply = {
  "text": "Hola, es el asistente de daños de república dominicana. Ha tenido lugar algún daño en su zona",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "¡Si!",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "No",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var cause = ["Terremoto", "Huracán", "Vaguada", "Otro"]
var causeReply = {
  "text": "Me podría decir la causa de este",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Terremoto",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Huracán",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Vaguada",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Otro",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var damages = ["No hubo daños", "Si, hay gente herida", "Si, gente ha fallecido"]
var damagesReply = {
  "text": "¿Hay persons heridas?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No hubo daños",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Si, hay gente herida",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Si, gente ha fallecido",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

var updateSchema = {
  sender_id: { type: Number },
  step: { type: Number },
  cause: { type: String },
  damages: { type: String },
  date: { type: Number },
  lat: { type: String },
  long: { type: String },
  img: { data: Buffer, contentType: String },
};

var update_schema = new Schema(updateSchema);

var Update = mongoose.model("Update", update_schema);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log(JSON.stringify(webhook_event))

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
async function handleMessage(sender_psid, received_message) {
  if (!received_message.is_echo) {
    console.log("Handling message: ");

    var step = await getStep(sender_psid);

    // Check if the message contains text
    if (received_message.text) {
      console.log(received_message.text)
      // Create the payload for a basic text message


      var msgText = received_message.text;
      if (step == 1) {
        step1(sender_psid, msgText);
      } else if (step == 2) {
        step2(sender_psid, msgText)
      } else if (step == 3) {
        step3(sender_psid, msgText)
    }
    } else if (received_message.attachments) {

      if (received_message.attachments[0].type == "image") {

        if (step == 4)
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        //console.log("the picture is in the link: " + attachment_url)
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
      } else if (received_message.attachments[0].type == "location") {

        if (step==5){
        let coordinates = received_message.attachments[0].payload.coordinates;
        response = {
          "text": `Your location is: lat= "${coordinates.lat}", long = "${coordinates.long}"`
        }
      } else {
        response = {
          "text": `Not a supported messag type`
        }
      }
    }
    // Sends the response message
    callSendAPI(sender_psid, response);

  }
}

function step1(sender_psid, msgText) {
  if (msgText == "No") {
    response = {
      "text": 'Pefecto, estamos a su disposición en caso de que ocurra algo'
    }
  } else if (msgText == "¡Si!") {
    nextStep(sender_psid);
    response = causeReply;
  } else {
    var aux = {
      "text": 'Utilice los botones para responder'
    }
    callSendAPI(sender_psid, aux)
    response = grettingsReply;
  }
  Update.find(function (err, doc) {
    console.log("guardadoooooooooooooooo")
    console.log(doc);
  });
}

function step2(sender_psid, msgText) {
  if (cause.indexOf(msgText > -1)) {
    fillUpdate(sender_psid, "cause", msgText);
    response = damagesReply;
  } else {
    var aux = {
      "text": 'Utilice los botones para responder'
    }
    callSendAPI(sender_psid, aux)
    response = causeReply;
  }

  Update.find(function (err, doc) {
    console.log("guardadoooooooooooooooo")
    console.log(doc);
  });
}

function step3(sender_psid, msgText) {
  if (damages.indexOf(msgText > -1)) {
    fillUpdate(sender_psid, "damages", msgText);
    response = damagesReply;
  } else {
    var aux = {
      "text": 'Utilice los botones para responder'
    }
    callSendAPI(sender_psid, aux)
    response = damagesReply;
  }

  Update.find(function (err, doc) {
    console.log("guardadoooooooooooooooo")
    console.log(doc);
  });
}


// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  } else if (payload === "Greeting") {
    create(sender_psid);
    response = grettingsReply;
  }

  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function create(sender_psid) {

  Update.deleteMany({}, function (err, doc) {
    console.log("removeeeeeeeeeeeeeeeeeeeeeed");
  });
  var update = new Update({
    sender_id: sender_psid,
    step: 1,
    cause: undefined,
    damages: undefined,
    date: d.getTime(),
    lat: undefined,
    long: undefined,
    img: undefined
  });

  update.save(function () {
    console.log("creado");
    Update.find(function (err, doc) {
      console.log("guardadoooooooooooooooo")
      console.log(doc);
    });
  });
}

async function fillUpdate(sender_psid, field, value) {
  var updates = await getUpdate(sender_psid);

  updates[0].step = updates[0].step + 1;

  switch (field) {
    case "cause":
      updates[0].cause = value;
      break;
    case "damages":
      updates[0].damages = value;
      break;
    case "location":
      updates[0].lat = value[0];
      updates[0].lat = value[1];
      break;
      default:
          updates[0].step = updates[0].step - 1;
          return err;
  }

  Update.findByIdAndUpdate(updates[0]._id, updates[0], function (err, upt) { 
    console.log("field : " + field + "-------saved")
  })
}

async function nextStep(sender_psid) {
  var updates = await getUpdate(sender_psid);

  Update.findByIdAndUpdate(updates[0]._id, { '$inc': { 'step': 1 } }, function (err, upt) {
    console.log("nexesteeeeeeeped");
    Update.find(function (err, docx) {
      console.log(docx);
    });
  });
}

function getUpdate(sender_psid) {
  return new Promise((resolve, reject) => {
    Update.find({ sender_id: sender_psid }).then(
      data => resolve(data),
      error => reject(error)
    );
  });
}

async function getStep(sender_psid) {
  var updates = await getUpdate(sender_psid);
  var step = updates[0].step;
  console.log("steeeeeeeeeeep " + step);
  return step;
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body

  request_body = {
    "recipient": {
      "id": sender_psid
    },
    "messaging_type": "RESPONSE",
    "message": response
  }
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