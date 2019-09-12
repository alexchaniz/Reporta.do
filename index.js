'use strict';

const request = require('request');

//Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server  

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Http = new XMLHttpRequest();

var https = require('https');



//Setting mongo server collections and connections
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

var updateSchema = {
  sender_id: { type: Number },
  step: { type: Number },
  response: { type: {} },
  responseAux: { type: {} },
  responseAuxIndicator: { type: Number },
  cause: { type: String },
  homeDamages: { type: String },
  humansHarmed: { type: Number },
  humansDeath: { type: Number },
  date: { type: Number },
  X: { type: Number },
  Y: { type: Number },
  address: { type: String },
  img: { data: Buffer, contentType: String },
  observation: { type: String },
  imgUrl: { type: String },
  tomarControl: { type: Boolean },
  formatedDate: { type: String }
};

var update_schema = new Schema(updateSchema);
var Update = mongoose.model("Update", update_schema);


//
//setting option and responses
//
/*
var response;
var aux = 0;
var responseAux = {
  "text": 'Utilice los botones para responder'
}
*/

var grettingsReply = {
  "text": "Hola, es el asistente de daños de república dominicana. ¿Como te ayudamos?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Reportar daños",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Información",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var grettingsInfoReply = {
  "text": "¿Quiere reportar algún daño?",
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

var safePlaceReply = {
  "text": "¿Está en un lugar seguro?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Si",
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

var homeDamages = ["Daños graves", "Daños leves", "No"]
var homeDamagesReply = {
  "text": "¿Ha sufrido daños su vivienda?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Daños leves",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Daños graves",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var cause = ["Huracán", "Lluvias intensas", "Deslizamiento", "Terremoto", "Explosión o incendio", "Otro"]
var causeReply = {
  "text": "Me podría decir la causa de los daños",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Huracán",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Lluvias intensas",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Deslizamiento",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Terremoto",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Explosión o incendio",
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

var humanDamagesReply = {
  "text": "¿Ha sufrido daños o muerto algún miembro de su familia?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Si",
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

var harmedPeople = ["1 a 5", "5 a 10", "Más de 10"]
var harmedPeopleReply = {
  "text": "¿Cuantas personas han resultado heridas?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No hubo heridos",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
    /* {
      "content_type": "text",
      "title": "5 a 10",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Más de 10",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }*/
  ]
}

var deathPeople = ["No hubo muertos", "1 a 5", "5 a 10", "Más de 10"]
var deathPeopleReply = {
  "text": "Si hubo muertos, ¿Podría escribirnos cuantos?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No hubo muertos",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
    /*, {
      "content_type": "text",
      "title": "1 a 5",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "5 a 10",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Más de 10",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }*/
  ]
}

var imageReply = {
  "text": 'Envienos una foto'
}

var locationReply = {
  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [{
        "title": "Envienos su ubicación",
        "subtitle": "Para ello utilice el botón que aparece en la imagen y pulse 'Enviar'.",
        "image_url": "https://quirky-lalande-b290cd.netlify.com/location1.jpg"
        //  "buttons": [{}]
      }]
    }
  }
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
  "text": "¿Quiere información sobre como actuar o reportar otro daño?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Reportar",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Información",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}


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

  console.log("Intentando conectar con facebook app");

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

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
  //Checks if is echomessage. If it is it wont be analyced
  if (!received_message.is_echo) {

    var updates = [];
    var step;

    //Set message state to recived and actives the typing icon
    //on the conversation
    messagingActions(sender_psid, "mark_seen")
    messagingActions(sender_psid, "typing_on")


    console.log("Handling message: ");

    //Get the step the conversation is
    var stepAux = await getStep(sender_psid, updates);
    step = stepAux[0];
    updates = stepAux[1];
    console.log("Getsteeeeeeeep" + step);


    try {
      updates[0].responseAuxIndicator = 0;
    } catch{ }

    // Expired conversation, new conversation or completed survey
    //Creayes a new conversation, a new update
    if (step == -1) {
      //in that case creates another entry
      updates = create(sender_psid, 1);
      updates[0].response = grettingsReply;

      // Check if the message contains text
    } else if (received_message.text) {

      console.log("Received message is a text");


      console.log("Teeeeeeeeeeeeeeext");
      console.log(received_message.text)
      // Create the payload for a basic text message

      var msgText = received_message.text;
      /*   
      checks if message is one of the preconfigured special messages
      */
      if (msgText == "borrartodo") {
        updates[0].response = {
          "text": "Base de datos mongodb reiniciada correctamente"
        }
        reset();

      } else if (msgText == "Asistencia 123") {
        console.log("controlando porqueeee");

        updates = fillUpdate(sender_psid, "tomarControl", true, updates);
        updates[0].response = {
          "text": "Uno de nuestros operarios ha tomado el control de la conversación."
        }

      } else if (msgText == "Asistencia 321") {
        var closeAsistanceAux = [11, false, "--Acabó la toma de control"]
        updates = fillUpdate(sender_psid, "closeAsistance", closeAsistanceAux, updates);
        updates[0].responseAuxIndicator = 1;
        updates[0].responseAux = {
          "text": "El operario dejó de tener el control"
        }
        updates[0].response = anotherUpdateReply

      } else if (step) {

        //Activate the function asociated to the step
        switch (step) {
          //if the control was took from the operator
          case -2:
            messagingActions(sender_psid, "typing_off")
            updates = fillUpdate(sender_psid, "observation", msgText, updates)
            break;
          case 1:
            updates = await step1(sender_psid, msgText, updates);
            break;
          case 2:
            updates = await step2(sender_psid, msgText, updates);
            break;
          case 3:
            updates = await step3(sender_psid, msgText, updates);
            break;
          case 4:
            updates = await step4(sender_psid, msgText, updates);
            break;
          case 5:
            updates = await step5(sender_psid, msgText, updates);
            break;
          case 6:
            updates = await step6(sender_psid, msgText, updates);
            break;
          case 8:
            updates = nextStep(updates);
            updates[0].responseAuxIndicator = 1;
            updates[0].responseAux = {
              "text": 'Es importante que nos envie su ubicación para ayudarle. Deberá aceptar esto en el movil. En otro caso puede escribir su dirección'
            }
            updates[0].response = locationReply;
            break;
          case 9:
            updates = await step8Aux(sender_psid, msgText, updates);
            break;
          case 10:
            updates = await step10(sender_psid, msgText, updates);
            break;
          case 11:
            updates = await step11(sender_psid, msgText, updates);
            break;
          default:
            //Asks for the cooect question to return as no action coud be tooken
            updates = await correctDemand(sender_psid, step, updates);
            break;
        }
      }

      //Check if message has attached elements
    } else if (received_message.attachments) {

      //if image or video
      if ((received_message.attachments[0].type == "image") || (received_message.attachments[0].type == "video")) {
        console.log("Received message is an image");
        console.log(received_message.attachments[0]);


        if ((updates[0].tomarControl) || (step == 7)) {

          // Get the URL of the message attachment
          let attachment_url = received_message.attachments[0].payload.url;
          updates = await step7(sender_psid, attachment_url, received_message.attachments[0].type, updates);

        } else {
          console.log("wrong step");
          updates = correctDemand(sender_psid, step, updates);
        }
      } else if (received_message.attachments[0].type == "location") {
        console.log("Received message is a location");

        if ((updates[0].tomarControl) || (step == 8) || (step == 9)) {

          updates = await step8(sender_psid, received_message, updates)
        } else {
          updates = correctDemand(sender_psid, step, updates);
        }
        /*} else if (step == 10) {
          fillUpdate(sender_psid, "observations", msgText);*/
      } else {
        updates = correctDemand(sender_psid, step, updates);
      }
    } else {
      updates = correctDemand(sender_psid, step, updates);
    }

    await messagingActions(sender_psid, "typing_off").then(async function () {


      // Sends the response message
      //In case aux=1 send auxiliar response
      if (updates[0].responseAuxIndicator == 1) {
        await callSendAPI(sender_psid, updates[0].responseAux).then(async function (err, data) {
          await callSendAPI(sender_psid, updates[0].response);
          console.log("Se envia mensaje previo de alcaración");
        })
      } else {
        console.log("No hay mensaje previo de alcaración");

        console.log("response");

        await callSendAPI(sender_psid, updates[0].response);
      }

    });
  }
}

//Steps of the conversantion as ordered
async function step1(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 1111111111111111");

  //Check if we recibe the text from the Quick Replys
  if (msgText == "Información") {
    updates[0].responseAuxIndicator = 1
    updates[0].responseAux = {
      "text": 'Somos el asistente de daños de República Dominicana. Nuestro trabajo consiste en recoger información sobre los daños sufridos por desastre naturales para poder actuar mejor respecto a estos. Estamos a su disposición en caso de que ocurra algo /n Puede compartir nuestro trabajo en sus Redes Sociales: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
    }
    updates[0].response = grettingsInfoReply;
  } else if ((msgText == "¡Si!") || (msgText == "Reportar daños")) {
    updates = nextStep(updates);

    updates[0].response = safePlaceReply;
  } else if (msgText == "No") {
    updates[0].response = {
      "text": "Nos alegramos de que no haya sufrido ningún problema, muchas gracias"
    };
  } else {
    updates[0].responseAuxIndicator = 1;
    updates[0].responseAux = {
      "text": 'Utilice los botones para responder'
    };
    updates[0].response = grettingsReply;
  }

  return updates;
}

async function step2(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 22222222222222222222222");

  if (msgText == "No") {
    updates[0].response = {
      "text": 'Debería ir a un lugar seguro. En caso de que sea necesario utilice el numero de emergencias 911.\n No dude en escribirnos cuando este seguro'
    }
  } else if (msgText == "Si") {
    updates = nextStep(updates);

    updates[0].responseAuxIndicator = 1;
    updates[0].responseAux = {
      "text": "Ok, continuemos"
    }
    updates[0].response = causeReply;
  } else {
    updates[0].responseAuxIndicator = 1;
    updates[0].responseAux = {
      "text": 'Utilice los botones para responder'
    };
    updates[0].response = safePlaceReply;
  }

  return updates;
}

async function step3(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 33333333333333333333333333");

  if (cause.includes(msgText)) {
    if (msgText == "Otro") {
      updates[0].response = {
        "text": 'Escriba la causa del problema'
      }
    } else {
      updates = fillUpdate(sender_psid, "cause", msgText, updates);
      updates[0].response = homeDamagesReply;
    }
  } else {
    updates = fillUpdate(sender_psid, "cause", msgText, updates);
    updates[0].response = homeDamagesReply;
  }

  return updates;
}

async function step4(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 44444444444444444");

  if (homeDamages.includes(msgText)) {
    updates = fillUpdate(sender_psid, "homeDamages", msgText, updates);
    updates[0].response = humanDamagesReply;
  } else {
    updates[0].responseAuxIndicator = 1;
    updates[0].responseAux = {
      "text": 'Utilice los botones para responder'
    };
    updates[0].response = homeDamagesReply;
  }

  return updates;
}

async function step5(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 5555555555555");

  if (msgText == "No") {
    updates = fillUpdate(sender_psid, "noHumansHarmed", msgText, updates)
    updates[0].response = imageReply;
  } else if (msgText == "Si") {
    updates[0].response = harmedPeopleReply;
  } else if (msgText == "No hubo heridos") {
    updates = fillUpdate(sender_psid, "humansHarmed", 0, updates)
    updates[0].response = deathPeopleReply;
  } else {
    if (isNaN(msgText)) {
      updates[0].response = {
        "text": "Señale el numero de muertes utilizando numeros"
      };
    } else {
      updates = fillUpdate(sender_psid, "humansHarmed", msgText, updates)
      updates[0].response = deathPeopleReply;
    }
  }
  /*else if (harmedPeople.includes(msgText)) {
    fillUpdate(sender_psid, "humansHarmed", msgText);
    response = deathPeopleReply;
  }*/

  return updates;
}

async function step6(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 666666666666");

  if (msgText=="No hubo muertos"){
    updates = fillUpdate(sender_psid, "humansDeath", 0, updates)
    updates[0].response = imageReply;
  } else if (isNaN(msgText)) {
    updates[0].response = {
      "text": "Señale el numero de muertes utilizando numeros"
    };
  } else {
    updates = fillUpdate(sender_psid, "humansDeath", msgText, updates)
    updates[0].response = imageReply;
  }

  return updates;
}

async function step7(sender_psid, attachment_url, type, updates) {
  console.log("Steeeeeeep 777777777777777");

  if (type == "image") {

    //save the image as buffer
    getImage(attachment_url, function (err, data) {
      if (err) {
        throw new Error(err);
      } else {
        var image = [data, attachment_url];
        updates = fillUpdate(sender_psid, "img", image, updates);
      }
    });
  } else {
    updates = fillUpdate(sender_psid, "video", attachment_url, updates);
  }

  updates[0].response = locationReply;
  return updates;
}

async function step8(sender_psid, received_message, updates) {
  console.log("Steeeeeeep 88888888");

  let coordinates = received_message.attachments[0].payload.coordinates;
  var location = [coordinates.lat, coordinates.long];
  console.log(coordinates);

  updates[0].step = 9;
  updates = fillUpdate(sender_psid, "location", location, updates);
  if (!updates[0].tomarControl) {
    updates[0].response = observationReply;
  } else {
    updates[0].response = {}
  }
  /*} else if (step == 10) {
    let coordinates = received_message.attachments[0].payload.coordinates;
    var location = [coordinates.X, coordinates.Y];
    fillUpdate(sender_psid, "observations", location);*/

  return updates;
}

async function step8Aux(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 99999999999999");

  //Saves any text recibed
  updates = fillUpdate(sender_psid, "address", msgText, updates);
  updates[0].response = observationReply;

  return updates;
}

async function step10(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 1000000000000000");

  //Saves any text recibed
  updates = fillUpdate(sender_psid, "observation", msgText, updates);
  updates[0].response = anotherUpdateReply;

  return updates;
}

async function step11(sender_psid, msgText, updates) {
  console.log("Steeeeeeep 11 111 11 11 11");

  if (msgText == "No") {
    updates[0].response = {
      "text": 'Muchas gracias por colaborar con el servicio de monitoreo. Su información nos es muy util para ayudarle.\n Con el siguiente link podrá avisar a sus amigos de que nos ha ayudado con su información: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
    } 
    //updates = nextStep(updates);
  } else if (msgText == "Reportar") {

    console.log("Step 111 siiiiiiii");
    updates[0].responseAuxIndicator = 1;
    updates[0].responseAux = {
      "text": 'Usted ha decidido reportar un nuevo daño'
    }

    updates = create(sender_psid, 3);
    updates[0].response = causeReply;

  } else if (msgText = "Información") {
    updates = getCauseInfo(sender_psid, updates);
    updates[0].response = anotherUpdateReply;
  } else {
    updates[0].responseAuxIndicator = 0,
    updates[0].response = anotherUpdateReply;
  }

  return updates;
}

//Look for the correct reply as no action could be took
function correctDemand(sender_psid, step, updates) {
  console.log("correct demand");

  switch (step) {
    case -1:
      updates = create(sender_psid, 1);
      updates[0].response = grettingsReply;
      break;
    case 7:
      updates[0].responseAuxIndicator = 1;
      updates[0].responseAux = {
        "text": 'Una foto es de mucha ayuda para ubicar los daños.'
      }
      updates[0].response = imageReply;
      break;
    case 8:
    case 9:
      updates[0].responseAuxIndicator = 1;
      updates[0].responseAux = {
        "text": 'Es importante que nos envie su ubicación para ayudarle. Deberá aceptar esto en el movil. En otro caso puede escribir su dirección'
      }
      updates[0].response = locationReply;
      break;
    case 1:
      updates[0].response = grettingsReply;
      break;
    case 2:
      updates[0].response = safePlaceReply;
      break;
    case 3:
      updates[0].response = causeReply;
      break;
    case 4:
      updates[0].response = homeDamagesReply;
      break;
    case 5:
      updates[0].response = humanDamagesReply;
      break;
    case 6:
      updates[0].response = deathPeopleReply;
      break;
    case 10:
      updates[0].response = observationReply;
      break;
    case 11:
      updates[0].response = anotherUpdateReply;
      break;
    default:
      updates[0].responseAuxIndicator = 1;
      updates[0].responseAux = {
        "text": "Disculpe, hubo un problema. La encuesta volverá a comenzar."
      }
      updates[0].response = grettingsReply;
      updates = fillUpdate(sender_psid, "step", 1, updates);
      break;
  }

  return updates;
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {

  var updates = [];
  try {
    updates[0].responseAuxIndicator = 0;
  } catch{ }
  // Get the payload for the postback
  let payload = received_postback.payload;
  messagingActions(sender_psid, "typing_on")


  // Set the response based on the postback payload
  if (payload === "Greeting") {
    updates = create(sender_psid, 1);
    updates[0].response = grettingsReply;

  } else {
    var stepAux = await getStep(sender_psid, updates);
    var step = stepAux[0];
    updates = stepAux[1];

    //checks if interaction with static menu was received
    if (payload === "stepback") {

      //if conversation is already in last step
      if (step == 11) {
        updates = fillUpdate(sender_psid, "step", 1, updates)
        updates[0].response = grettingsReply;
      } else {
        updates = fillUpdate(sender_psid, "step", step - 1, updates)
        updates = correctDemand(sender_psid, step - 1, updates);
      }
    } else if (payload == "restart") {
      updates = fillUpdate(sender_psid, "step", 1, updates)
      updates[0].response = grettingsReply;
    } else {
      updates = correctDemand(sender_psid, step, updates);
    }
  }
  await messagingActions(sender_psid, "typing_off").then(async function () {

    // Send the message to acknowledge the postback
    await callSendAPI(sender_psid, updates[0].response);
  });
}

//resets mongo db collection
function reset() {
  Update.deleteMany({}, function (err, doc) {
    console.log("removeeeeeeeeeeeeeeeeeeeeeed");
  });
}

//create new update onject in db
function create(sender_psid, stepNew) {

  var updates = [];
  var d = new Date();

  updates[0] = new Update({
    sender_id: sender_psid,
    step: stepNew,
    response: {},
    responseAux: { "text": "Responda utilizando los botones por favor." },
    responseAuxIndicator: 0,
    cause: "no cause indicated",
    damages: "no daages indicates",
    date: d.getTime(),
    observation: ".",
    X: 0,
    Y: 0,
    address: "addres signaled by the coordinates",
    img: "no image",
    tomarControl: false,
    formatedDate: d.toLocaleString() + " " + d.toTimeString()
  });

  updates[0].save(function () {
    console.log("creado");
    Update.find(function (err, doc) {
      console.log("guardadoooooooooooooooo")
    });
  });

  return updates;
}

//Fills the indicates fill with the indicated values
function fillUpdate(sender_psid, field, value, updates) {

  updates[0].step += 1;

  switch (field) {
    case "cause":
      updates[0].cause = value;
      break;
    case "homeDamages":
      updates[0].homeDamages = value;
      break;
    case "humansHarmed":
      updates[0].humansHarmed = value;
      break;
    case "humansDeath":
      updates[0].humansDeath = value;
      break;
    case "noHumansHarmed":
      updates[0].humansHarmed = value;
      updates[0].humansDeath = value;
      updates[0].step += 1;
      break;
    case "img":
      updates[0].img.data = value[0];
      updates[0].img.contentType = 'image/png';
      updates[0].imgUrl = value[1];
      break;
    case "video":
      updates[0].imgUrl = value;
    case "location":
      updates[0].X = value[0];
      updates[0].Y = value[1];
      break;
    case "address":
      updates[0].address = value;
      break;
    case "observation":
      updates[0].observation += value + "--";
      if (!updates[0].tomarControl) {
        sendUpdateToArcGis(updates[0]);
      } else {
        updates[0].response = {};
      }
      break;
    case "tomarControl":
      updates[0].tomarControl = value;
      break;
    case "step":
      updates[0].step = value;
      break;
    case "closeAsistance":
      updates[0].step = value[0];
      updates[0].tomarControl = value[1];
      updates[0].observation += value[2];
      sendUpdateToArcGis(updates[0]);
      break;
    default:
      updates[0].step = updates[0].step - 1;
      return ;
  }

  Update.findByIdAndUpdate(updates[0]._id, updates[0], function (err, upt) {
    console.log("field : " + field + "-------saved")
    Update.find(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("guardadoooooooooooooooo")
      }
    });
  })
  return updates;
}

//Set the nex step. Sums 1
function nextStep(updates) {

  Update.findByIdAndUpdate(updates[0]._id, { '$inc': { 'step': 1 } }, function (err, upt) {
    console.log("nexesteeeeeeeped");
    Update.find(function (err, docx) {
      console.log(docx);
    });
  });

  updates[0].step += 1;

  return updates;
}

//Get the last created update element in the db associated to the sender
function getUpdate(sender_psid) {
  return new Promise((resolve, reject) => {
    Update.find({ sender_id: sender_psid }).sort({ date: -1 }).limit(1).then(
      data => resolve(data),
      error => reject(error)
    );
  });
}

//Get the step of the user`s last conversation
async function getStep(sender_psid) {
  var d = new Date();
  var step;
  
  try {
    var updates = await getUpdate(sender_psid);
    console.log("tiempo pasado " + (d.getTime() - updates[0].date));

    if (updates == []) {
      console.log("updates is empty");
      step = -1;
    } else if (updates[0].tomarControl) {
      console.log("Control tomado");
      step = -2;
    } else if ((updates[0].step > 11) || (d.getTime() - updates[0].date > 900000)) {
      console.log("Updates recibió el paso" + updates[0].step);
      console.log();

      if (updates[0].step < 6) {
        updates[0].remove();
      }
      step = -1;
    } else {
      step = updates[0].step;
      console.log("steeeeeeeeeeep " + step);
    }

    return [step, updates];
  } catch (e) {
    return [-1, {}];
  }
}

//This converts de image to bin
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

//Get the info that corresponds to the cause of the damages that the user indicated
function getCauseInfo(sender_psid, updates) {

  console.log("infooooo causeeeeee");
  console.log(updates[0].cause);

  updates[0].responseAuxIndicator = 1;
  switch (updates[0].cause) {
    case cause[0]:
      updates[0].responseAux = {
        "text": "Información huracán"
      }
      break;
    case cause[1]:
      updates[0].responseAux = {
        "text": "Información lluvias torrenciales"
      }
      break;
    case cause[2]:
      updates[0].responseAux = {
        "text": "Información deslizamiento de tierras"
      }
      break;
    case cause[3]:
      updates[0].responseAux = {
        "text": "Información terremoto"
      }
      break;
    case cause[4]:
      updates[0].responseAux = {
        "text": "Información fuego o explosión"
      }
      break;
    default:
      updates[0].responseAux = {
        "text": "Hubo un error, no le podemos ayudar con información sobre la causa"
      }
      break;
  }
  //updates = nextStep(updates);

  return updates;
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
  // Send the HTTP request to the Messenger PXform
  return new Promise(function (resolve, reject) {
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
        console.log("Message sent");
        resolve(body)
      }
    })
  });
}

//Sends the collected data to arcgis
function sendUpdateToArcGis(update) {
  /*
    var xhr = new XMLHttpRequest();
    var blob;
  
    // Use JSFiddle logo as a sample image to avoid complicating
    // this example with cross-domain issues.
    xhr.open("GET", update.imgUrl, true);
  
    // Ask for the result as an ArrayBuffer.
    xhr.responseType = "arraybuffer";
  
    xhr.onload = function (e) {
      // Obtain a blob: URL for the image data.
      var arrayBufferView = new Uint8Array(this.response);
      console.log("aaaaaaaaaaaaarrrrrrrrrraaaaaaybuffer");
  
      console.log(arrayBufferView);
  
      blob = new Blob([arrayBufferView], { type: update.img.contentType });
    }
    console.log("blooooooooooooooooooooooooob");
  
    console.log(blob);
  
    // var imgg = new Blob(update.img.data, {type : update.img,type})
  */

  var urlImgAux = update.imgUrl;

  console.log(urlImgAux);
  
try {
    //Replace the & for the string 'aspersan' as the other is bad interpretes
  // int the reques, as it may signal a new parameter when its part of one of them
  var repImg = urlImgAux.replace(/&/g, "aspersan");
} catch (error) {
  console.log("No se subio ninguna imgen");
  
}

  //Constructs the object witht he data to update
  var object = [{
    "geometry": {"x": update.X, "y": update.Y },
    "attributes": {
      "MongoId": update._id, "cause": update.cause, "homeDamages": update.homeDamages,
      "humansHarmed": update.humansHarmed, "humansDeath": update.humansDeath, 
      "date": update.date, "X": update.X, "Y": update.Y, "address": update.address,
      "observation": update.observation, "imgUrl1": repImg, "formatedDate": update.formatedDate
    }
  }];

  //Hace string los parametro para añadirlos a la url
  var stringObject = JSON.stringify(object);
  console.log("SSSSSSSSSSSSSSStrrrrrrrrrrrrrrrrriiiiiiiiiiinnngggg");

  console.log(stringObject);

  //The url with the parameters indicated in the addFeature
  //rest service for updating data to an arcgis layer
  var url = process.env.ARCGIS_LAYER_ADDFEATURE + '/addFeatures?f=JSON&features=' + JSON.stringify(object);;
  console.log(url);

  Http.open("POST", url);
  try {
    Http.send();
  } catch (error) {
    console.log("Error in the sending to arcgis");
    console.log(error);
  }

  Http.onreadystatechange = (e) => {
    console.log("arcgiiiiisssssssssssssssssssssssssss");
    console.log(Http.responseText);

  //  var objectId = Http.responseText.addResults[0].objectId;
  //  console.log(objectId);
    
  //  var formData = new FormData();
  //  formData.append("attachment", update.imgUrl);  
  }
}

//Activate the messaging actions
async function messagingActions(sender_psid, action) {

  let request_body


  request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action": action
  }

  console.log("Action: " + action);


  return new Promise(function (resolve, reject) {
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
        console.log("Message sent");
        resolve(body)
      }
    })
  });
}