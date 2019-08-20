'use strict';

const request = require('request');

// page acces token> EAAHxOF5ZBsSoBAMCneBZBRZBhac2ZCsYNVRLMS5aLuyjwGe0ayZB6ZCptcPmLs6AQ0qOeV4ZAJjHDOi2fOCMBJU2kR7wItickH6hJn4Y7Ki1iIFEC2dWTXdigF54QOLZBiflYy773P1JRH6t8HCEPvEer9q8TG46Csi2ZCdKTnUM3kAZDZD 
//Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

var https = require('https');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var d = new Date();
mongoose.set('useFindAndModify', false);

var response;
var responseAux = {
  "text": 'Utilice los botones para responder'
}
var aux = 0;

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

var imageReply = {
  "text": 'Envienos una imagen de los daños sufridos'
}

var locationReply = {
  "text": 'Ahora envienos la ubicación utilizando dicha funcionalidad en messenger'
}

var observationReply = {
  "text": "Si quiere hacer alguna observación añadalá en el siguiente mensaje",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No quiero dejar ninguna observación",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var anotherUpdateReply = {
  "text": "Quiere subir otra imagen de la zona",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Si",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "No.",
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
  observation: { type: String }
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
   //   console.log(JSON.stringify(webhook_event))

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
    console.log("Steeepppppppppppp" + step);
    
    // Check if the user has been more than without updating
    if (step == -1) {
      //in that case creates another entry
      create(sender_psid);
      response = grettingsReply;

      // Check if the message contains text
    } else if (received_message.text) {

      console.log("Teeeeeeeeeeeeeeext");
      
      console.log(received_message.text)
      // Create the payload for a basic text message

      var msgText = received_message.text;

      if (step == 1) {
        step1(sender_psid, msgText);
      } else if (step == 2) {
        step2(sender_psid, msgText)
      } else if (step == 3) {
        step3(sender_psid, msgText)
      } else if (step == 6) {
        step6(sender_psid, msgText)
      } else if (step == 7) {
        step7(sender_psid, msgText)
      } else if (msgText == "borrartodo") {
        reset();
      } else {
        correctDemand(sender_psid);
      }
    } else if (received_message.attachments) {

      if (received_message.attachments[0].type == "image") {

        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        //console.log("the picture is in the link: " + attachment_url)

        if (step == 4) {
          console.log("Steeeeeeep 4444444444444444444");
          getImage(attachment_url, function (err, data) {
            if (err) {
              throw new Error(err);
            } else {
              fillUpdate(sender_psid, "img", data);
            }
          });
          response = {
            "text": 'Ahora envienos la ubicación utilizando dicha funcionalidad en messenger'
          }
        } else {
          console.log("wrong step");
          correctDemand(sender_psid);
        }
      } else if (received_message.attachments[0].type == "location") {
        if (step == 5) {
          console.log("Steeeeeeep 55555555555555");
          let coordinates = received_message.attachments[0].payload.coordinates;
          var location = [coordinates.lat, coordinates.long];

          fillUpdate(sender_psid, "location", location);
          response = observationReply;
        } else {
          correctDemand(sender_psid);
        }
      } else {
        correctDemand(sender_psid);
      }
    }
    // Sends the response message
    if (aux==1) {
      await callSendAPI(sender_psid, responseAux).then(async function(err, data){
        await callSendAPI(sender_psid,response);
      })
    } else{
    await callSendAPI(sender_psid, response);
    }
    aux=0;
  }
}

async function step1(sender_psid, msgText) {
  console.log("Steeeeeeep 1111111111111111");
  
  if (msgText == "No") {
    console.log("llglggliugytxsrersdfjgyukihjlbyrvctedfhgunmk");
      
    response = {
      "text": 'Pefecto, estamos a su disposición en caso de que ocurra algo'
    }
  } else if (msgText == "¡Si!") {
    nextStep(sender_psid);
    response = causeReply;
  } else {
    console.log("Correct steeep1");
    response = grettingsReply;
    aux=1
    
    while(x==0){}

    console.log(response);
  }
}

async function step2(sender_psid, msgText) {
  console.log("Steeeeeeep 22222222222222222222222");
  if (cause.indexOf(msgText > -1)) {
    fillUpdate(sender_psid, "cause", msgText);
    response = damagesReply;
  } else {
    var aux = {
      "text": 'Utilice los botones para responder'
    }
    await callSendAPI(sender_psid, aux)
    response = causeReply;
  }
}

async function step3(sender_psid, msgText) {
  console.log("Steeeeeeep 333333333333333333");
  if (damages.indexOf(msgText > -1)) {
    fillUpdate(sender_psid, "damages", msgText);
    response = imageReply;
  } else {
    var aux = {
      "text": 'Utilice los botones para responder'
    }
    await callSendAPI(sender_psid, aux)
    response = damagesReply;
  }
}

async function step6(sender_psid, msgText) {
  console.log("Steeeeeeep 66666666666666");
  fillUpdate(sender_psid, "observation", msgText);
  response = anotherUpdate;
}

async function step7(sender_psid, msgText) {
  console.log("Steeeeeeep 77777777777777");
  if (msgText == "No.") {
    response = {
      "text": 'Muchas graias por colaborar con el servicio de monitore. Su información nos es muy util'
    }
  } else if (msgText == "Si") {

    var updates = await getUpdate(sender_psid);
    updates[0].step = 4;
    updates[0].img = undefined;
    updates[0].lat = undefined;
    updates[0].long = undefined;
    updates[0].save(function () {
      console.log("creado");
      Update.find(function (err, doc) {
        console.log("guardadoooooooooooooooo")
        console.log(doc);
      });
    });
    response = {
      "text" : 'Suba una nueva imagen'
    }
    nextStep(sender_psid);
  } else {
    var aux = {
      "text": 'Utilice los botones para responder'
    }
    await callSendAPI(sender_psid, aux)
    response= anotherUpdateReply;
  }
}

async function correctDemand(sender_psid) {
  var step = getStep(sender_psid)

  switch (step) {
    case -1:
      create(sender_psid);
      response=grettingsReply;
      break;
    case 1:
      response = grettingsReply;
      break;
    case 2:
      response = causeReply;
      break;
    case 3:
      response = damagesReply;
      break;
    case 4:
      response = imageReply;
      break;
    case 5:
      response = locationReply;
      break;
    case 6:
      response = observationReply;
      break;
    case 7:
      response = anotherUpdateReply;
      break;
    default:
      return err;
  }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "Greeting") {
    create(sender_psid);
    response = grettingsReply;

    // Send the message to acknowledge the postback
    await callSendAPI(sender_psid, response);
  } else {
    correctDemand(sender_psid);
  }
}

function reset() {
  Update.deleteMany({}, function (err, doc) {
    console.log("removeeeeeeeeeeeeeeeeeeeeeed");
  });
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
    case "img":
      updates[0].img.data = value;
      updates[0].img.contentType = 'image/png';
      break;
    case "location":
      updates[0].lat = value[0];
      updates[0].long = value[1];
      break;
    case "observation":
      updates[0].observation = value;
    default:
      updates[0].step = updates[0].step - 1;
      return err;
  }

  Update.findByIdAndUpdate(updates[0]._id, updates[0], function (err, upt) {
    console.log("field : " + field + "-------saved")
    Update.find(function (err, doc) {
      console.log("guardadoooooooooooooooo")
      console.log(doc);
    });
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
    Update.find({ sender_id: sender_psid }).sort({ date: -1 }).limit(1).then(
      data => resolve(data),
      error => reject(error)
    );
  });
}

async function getStep(sender_psid) {
  var updates = await getUpdate(sender_psid);
  if ((!updates.length)||(updates[0].step == 8)||(d.getTime() - updates[0].date > 604000000)){
    //si el reistro guardado no tiene una localizaci´n asociada ala imagen, o menos información, es eliminado
    if(updates[0].step <6) updates[0].remove();
    return -1;
  } 
  var step = updates[0].step;
  console.log("steeeeeeeeeeep " + step);
  return step;
}

function getImage(url, callback) {
  https.get(url, res => {
    // Initialise an array
    const bufs = [];

    // Add the data to the buffer collection
    res.on('data', function (chunk) {
      bufs.push(chunk)
    });

    // This signifies the end of a request
    res.on('end', function () {
      // We can join all of the 'chunks' of the image together
      const data = Buffer.concat(bufs);

      // Then we can call our callback.
      callback(null, data);
    });
  })
    // Inform the callback of the error.
    .on('error', callback);
}

// Sends response messages via the Send API
async function callSendAPI(sender_psid, response) {
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
    return new Promise(function(resolve, reject){
     request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (err) {
        console.log('error sending' + err);
        return reject(err);
      } else {
        console.error("Message sent");
        resolve(body)
      }
    })
    });
}