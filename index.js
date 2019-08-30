'use strict';

const request = require('request');

// page acces token> EAAHxOF5ZBsSoBAMCneBZBRZBhac2ZCsYNVRLMS5aLuyjwGe0ayZB6ZCptcPmLs6AQ0qOeV4ZAJjHDOi2fOCMBJU2kR7wItickH6hJn4Y7Ki1iIFEC2dWTXdigF54QOLZBiflYy773P1JRH6t8HCEPvEer9q8TG46Csi2ZCdKTnUM3kAZDZD 
//Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server  

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Http = new XMLHttpRequest();

var https = require('https');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.set('useFindAndModify', false);

var updates = [];
var response;

var aux = 0;
var responseAux = {
  "text": 'Utilice los botones para responder'
}



//setting option and responses
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
  "text": "¿Ha sufrido daños o muerto algún miembro de su familia o comunidad?",
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
  "text": "¿Cuantas personas han resultado heridas?"
  /*"quick_replies": [
    {
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
    }
  ]*/
}

var deathPeople = ["No hubo muertos", "1 a 5", "5 a 10", "Más de 10"]
var deathPeopleReply = {
  "text": "Si hubo muertos, ¿Podría indicarnos cuantos?"
  /*"quick_replies": [
    {
      "content_type": "text",
      "title": "No hubo muertos",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
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
    }
  ]*/
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
        "title": "Envienos su ubicación. ",
        "subtitle": "Utilice el boton indicado en la foto y pulse el boton 'Enviar' en la esqiuna superior",
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

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

var updateSchema = {
  sender_id: { type: Number },
  step: { type: Number },
  cause: { type: String },
  homeDamages: { type: String },
  humansHarmed: { type: String },
  humansDeath: { type: String },
  date: { type: Number },
  X: { type: Number },
  Y: { type: Number },
  address: { type: String},
  img: { data: Buffer, contentType: String },
  observation: { type: String },
  imgUrl: { type: String },
  tomarControl: { type: Boolean },
  formatedDate: { type: String }
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
    messagingActions(sender_psid, "mark_seen")
    messagingActions(sender_psid, "typing_on")
    

    console.log("Handling message: ");

    var step = await getStep(sender_psid);
    console.log("Getsteeeeeeeep" + step);

    // Check if the user has been more than without updating
    if (step == -1) {
      //in that case creates another entry
      create(sender_psid, 1);
      response = grettingsReply;

      // Check if the message contains text
    } else if (received_message.text) {

      console.log("Teeeeeeeeeeeeeeext");
      console.log(received_message.text)
      // Create the payload for a basic text message

      var msgText = received_message.text;
      /*     */
      if (msgText == "borrartodo") {
        response = {
          "text": "Base de datos mongodb reiniciada correctamente"
        }
        reset();
      } else if (msgText == "Asistencia 123") {
        console.log("controlando porqueeee");

        fillUpdate(sender_psid, "tomarControl", true);
        response = {
          "text": "Uno de nuestros operarios ha tomado el control de la conversación."
        }
      } else if (msgText == "Asistencia 321") {
        fillUpdate(sender_psid, "step", 9);
        fillUpdate(sender_psid, "tomarControl", false);
        fillUpdate(sender_psid, "observation", ". Acabo la toma de control.")
        aux = 1;
        responseAux = {
          "text": "El operario dejó de tener el control"
        }
        response = anotherUpdateReply
      } else if (step) {
        switch (step) {
          case -2:
            response = {}
            fillUpdate(sender_psid, "observation", msgText)
            break;
          case 1:
            step1(sender_psid, msgText);
            break;
          case 2:
            step2(sender_psid, msgText);
            break;
          case 3:
            step3(sender_psid, msgText);
            break;
          case 4:
            step4(sender_psid, msgText);
            break;
          case 5:
            step5(sender_psid, msgText);
            break;
          case 6:
            step6(sender_psid, msgText);
            break;
            case 8:
            step8Aux(sender_psid, msgText);
            break;
          case 9:
            step9(sender_psid, msgText);
            break;
          case 10:
            step10(sender_psid, msgText);
            break;
          default:
            correctDemand(sender_psid, step);
            break;
        }
      }

    } else if (received_message.attachments) {

      if (received_message.attachments[0].type == "image") {

        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        //console.log("the picture is in the link: " + attachment_url)

        if ((updates[0].tomarControl) || (step == 7)) {

          step7(sender_psid, attachment_url);

        } else {
          console.log("wrong step");
          correctDemand(sender_psid, step);
        }
      } else if (received_message.attachments[0].type == "location") {
        if ((updates[0].tomarControl) || (step == 8)) {

          step8(sender_psid, received_message)
        } else {
          correctDemand(sender_psid, step);
        }
        /*} else if (step == 10) {
          fillUpdate(sender_psid, "observations", msgText);*/
      } else {
        correctDemand(sender_psid, step);
      }
    } else {
      correctDemand(sender_psid);
    }

    // Sends the response message
    if (aux == 1) {
      await callSendAPI(sender_psid, responseAux).then(async function (err, data) {
        await callSendAPI(sender_psid, response);
        console.log("Se envia mensaje previo de alcaración");

        responseAux = {
          "text": 'Utilice los botones para responder'
        }
        aux = 0;
      })
    } else {
      console.log("No hay mensaje previo de alcaración");

      console.log(response);
      await callSendAPI(sender_psid, response);
    }
  }
}

//Steps of the conversantion as ordered
async function step1(sender_psid, msgText) {
  console.log("Steeeeeeep 1111111111111111");

  //Check if we recibe the text from the Quick Replys
  if (msgText == "Información") {
    aux = 1
    responseAux = {
      "text": 'Somos el asistente de daños de República Dominicana. Nuestro trabajo consiste en recoger información sobre los daños sufridos por desastre naturales para poder actuar mejor respecto a estos. Estamos a su disposición en caso de que ocurra algo /n Puede compartir nuestro trabajo en sus Redes Sociales: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
    }
    response = grettingsInfoReply;
  } else if ((msgText == "¡Si!") || (msgText == "Reportar daños")) {
    nextStep();
    response = safePlaceReply;
  } else if (msgText == "No") {
    response = {
      "text": "Nos alegramos de que no haya sufrido ningún problema, muchas gracias"
    };
  } else {
    aux = 1;
    response = grettingsReply;
  }
}

async function step2(sender_psid, msgText) {
  console.log("Steeeeeeep 22222222222222222222222");

  if (msgText == "No") {
    response = {
      "text": 'Debería ir a un lugar seguro. En caso de que sea necesario utilice el numero de emergencias 911.\n No dude en escribirnos cuando este seguro'
    }
  } else if (msgText == "Si") {
    nextStep();
    aux = 1;
    responseAux = {
      "text": "Ok, continuemos"
    }
    response = causeReply;
  } else {
    aux = 1;
    response = safePlaceReply;
  }
}

async function step3(sender_psid, msgText) {
  console.log("Steeeeeeep 33333333333333333333333333");
  if (cause.includes(msgText)) {
    if (msgText == "Otro") {
      response = {
        "text": 'Escriba la causa del problema'
      }
    } else {
      fillUpdate(sender_psid, "cause", msgText);
      response = homeDamagesReply;
    }
  } else {
    fillUpdate(sender_psid, "cause", msgText);
    response = homeDamagesReply;
  }
}

async function step4(sender_psid, msgText) {
  console.log("Steeeeeeep 44444444444444444");
  if (homeDamages.includes(msgText)) {
    fillUpdate(sender_psid, "homeDamages", msgText);
    response = humanDamagesReply;
  } else {
    aux = 1;
    response = homeDamagesReply;
  }
}

async function step5(sender_psid, msgText) {
  console.log("Steeeeeeep 5555555555555");

  if (msgText == "No") {
    fillUpdate(sender_psid, "noHumansHarmed", msgText)
    response = imageReply;
  } else if (msgText == "Si") {
    response = harmedPeopleReply;
  }  else {
fillUpdate(sender_psid, "humansHarmed", msgText)
    response = deathPeopleReply;
  }
  /*else if (harmedPeople.includes(msgText)) {
    fillUpdate(sender_psid, "humansHarmed", msgText);
    response = deathPeopleReply;
  }*/
}

async function step6(sender_psid, msgText) {
  console.log("Steeeeeeep 666666666666");
  fillUpdate(sender_psid, "humansDeath", msgText)
  response = imageReply;
  /*} else {
    aux = 1;
    response = deathPeopleReply;
  }*/
}

async function step7(sender_psid, attachment_url) {
  console.log("Steeeeeeep 777777777777777");
  getImage(attachment_url, function (err, data) {
    if (err) {
      throw new Error(err);
    } else {
      var image = [data, attachment_url];
      fillUpdate(sender_psid, "img", image);
    }
  });
  response = locationReply;
}

async function step8(sender_psid, received_message) {

  console.log("Steeeeeeep 666666666666");
  let coordinates = received_message.attachments[0].payload.coordinates;
  var location = [coordinates.lat, coordinates.long];
  console.log(coordinates);

  fillUpdate(sender_psid, "location", location);
  if (!updates[0].tomarControl) {
    response = observationReply;
  } else {
    response = {}
  }
  /*} else if (step == 10) {
    let coordinates = received_message.attachments[0].payload.coordinates;
    var location = [coordinates.X, coordinates.Y];
    fillUpdate(sender_psid, "observations", location);*/
}

async function step8Aux(sender_psid, msgText) {
  console.log("Steeeeeeep 99999999999999");

  //Saves any text recibed
  fillUpdate(sender_psid, "address", msgText);
  response = observationReply;
}

async function step9(sender_psid, msgText) {
  console.log("Steeeeeeep 99999999999999");

  //Saves any text recibed
  fillUpdate(sender_psid, "observation", msgText);
  response = anotherUpdateReply;
}

async function step10(sender_psid, msgText) {
  console.log("Steeeeeeep 100000000000000");

  if (msgText == "No") {
    response = {
      "text": 'Muchas gracias por colaborar con el servicio de monitoreo. Su información nos es muy util para ayudarle.\n Con el siguiente link podrá avisar a sus amigos de que nos ha ayudado con su información: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
    }
    nextStep();
  } else if (msgText == "Reportar") {

    console.log("Step 111 siiiiiiii");
    aux = 1;
    responseAux = {
      "text": 'Usted ha decidido reportar un nuevo daño'
    }

    create(sender_psid, 3);
    response = causeReply;

  } else if (msgText = "Información") {
    getCauseInfo(sender_psid);
    response = anotherUpdateReply;
  } else {
    aux = 1
    response = anotherUpdateReply;
  }
  console.log(response);
}

function correctDemand(sender_psid, step) {
  console.log("correct demand");

  switch (step) {
    case -1:
      create(sender_psid, 1);
      response = grettingsReply;
      break;
    case 1:
      response = grettingsReply;
      break;
    case 2:
      response = safePlaceReply;
      break;
    case 3:
      response = causeReply;
      break;
    case 4:
      response = homeDamagesReply;
      break;
    case 5:
      response = humanDamagesReply;
      break;
    case 6:
      response = deathPeopleReply;
      break;
    case 7:
      aux = 1;
      responseAux = {
        "text": 'Una foto es de mucha ayuda para ubicar los daños.'
      }
      response = imageReply;
      break;
    case 8:
      aux = 1;
      responseAux = {
        "text": 'Es importante que nos envie su ubicación para ayudarle. Deberá aceptar esto en el movil. En otro caso puede escribir su dirección'
      }
      response = locationReply;
      break;
    case 9:
      response = observationReply;
      break;
    case 10:
      response = anotherUpdateReply;
      break;
    default:
      aux = 1;
      responseAux = {
        "text": "Disculpe, hubo un problema. La encuesta volverá a comenzar."
      }
      response = grettingsReply;
      fillUpdate(sender_psid, "step", 1);
      break;

  }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {

  // Get the payload for the postback
  let payload = received_postback.payload;
  messagingActions(sender_psid, "typing_on")


  // Set the response based on the postback payload
  if (payload === "Greeting") {
    create(sender_psid, 1);
    response = grettingsReply;

  } else {
    var step = await getStep(sender_psid);

    if (payload === "stepback") {
      if (step == 10) {
        fillUpdate(sender_psid, "step", 1)
      response=grettingsReply;
      } else{
      fillUpdate(sender_psid, "step", step - 1)
      correctDemand(sender_psid, step-1);
      }
    } else if (payload == "restart") {
      fillUpdate(sender_psid, "step", 1)
      response=grettingsReply;
    } else {
      correctDemand(sender_psid, step);
    }
  }

  // Send the message to acknowledge the postback
  await callSendAPI(sender_psid, response);
}

function reset() {
  Update.deleteMany({}, function (err, doc) {
    console.log("removeeeeeeeeeeeeeeeeeeeeeed");
  });
}

function create(sender_psid, stepNew) {

  var d = new Date();

  updates[0] = new Update({
    sender_id: sender_psid,
    step: stepNew,
    cause: undefined,
    damages: undefined,
    date: d.getTime(),
    observation: ".",
    X: 0,
    Y: 0,
    address: undefined,
    img: undefined,
    tomarControl: false,
    formatedDate: d.toLocaleString() + " " + d.toTimeString()
  });

  updates[0].save(function () {
    console.log("creado");
    Update.find(function (err, doc) {
      console.log("guardadoooooooooooooooo")
      console.log(doc);
    });
  });
}

async function fillUpdate(sender_psid, field, value) {

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
      }
      break;
    case "tomarControl":
      updates[0].tomarControl = value;
      break;
    case "step":
      updates[0].step = value;
      break;
    default:
      updates[0].step = updates[0].step - 1;
      return err;
  }

  Update.findByIdAndUpdate(updates[0]._id, updates[0], function (err, upt) {
    console.log("field : " + field + "-------saved")
    Update.find(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("guardadoooooooooooooooo")
        console.log(doc);
      }
    });
  })
}

async function nextStep() {

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
  try {
    var d = new Date();
    updates = await getUpdate(sender_psid);
    console.log("tiempo pasado " + (d.getTime() - updates[0].date));

    if (updates == []) {
      console.log("updates is empty");
      return -1;
    } else if (updates[0].tomarControl) {
      console.log("Control tomado");
      return -2;
    } else if ((updates[0].step > 10) || (d.getTime() - updates[0].date > 900000)) {
      console.log("Updates recibió el paso" + updates[0].step);
      console.log();

      if (updates[0].step < 6) {
        updates[0].remove();
      }
      return -1;
    } else {
      var step = updates[0].step;
      console.log("steeeeeeeeeeep " + step);
      return step;
    }
  } catch (e) {
    return -1;
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

async function getCauseInfo(sender_psid) {

  console.log("infooooo causeeeeee");
  console.log(updates[0].cause);

  aux = 1;
  switch (updates[0].cause) {
    case cause[0]:
      responseAux = {
        "text": "Información huracán"
      }
      break;
    case cause[1]:
      responseAux = {
        "text": "Información lluvias torrenciales"
      }
      break;
    case cause[2]:
      responseAux = {
        "text": "Información deslizamiento de tierras"
      }
      break;
    case cause[3]:
      responseAux = {
        "text": "Información terremoto"
      }
      break;
    case cause[4]:
      responseAux = {
        "text": "Información fuego o explosión"
      }
      break;
    default:
      responseAux = {
        "text": "Hubo un error, no le podemos ayudar con información sobre la causa"
      }
      break;
  }

  nextStep;

}

// Sends response messages via the Send API
async function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body

  messagingActions(sender_psid, "typing_off")


  console.log(JSON.stringify(response));

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


function sendUpdateToArcGis(update) {

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

  var urlImgAux = update.imgUrl;
  var res = urlImgAux.replace(/&/g, "aspersan");
  var object = [{
    "attributes": {
      "MongoId": update._id,
      "cause": update.cause,
      "homeDamages": update.homeDamages,
      "humansHarmed": update.humansHarmed,
      "humansDeath": update.humansDeath,
      "date": update.date,
      "X": update.X,
      "Y": update.Y,
      "address" : update.address,
      //"img1": update.img.data,
      //"img": { "data": update.img.data, "Type": update.img.contentType },
      "observation": update.observation,
      "imgUrl1": res,
      "formatedDate": update.formatedDate
    },
    "geometry": {
      "x": update.X,
      "y": update.Y
    }
  }];


  var stringObject = JSON.stringify(object);
  console.log("SSSSSSSSSSSSSSStrrrrrrrrrrrrrrrrriiiiiiiiiiinnngggg");

  console.log(stringObject);

  var url = 'https://services1.arcgis.com/C4QnL6lJusCeBpYO/arcgis/rest/services/PruebaPuntos/FeatureServer/0/addFeatures?f=JSON&features=' + JSON.stringify(object);;
  console.log(url);


  Http.onreadystatechange = (e) => {
    console.log("arcgiiiiisssssssssssssssssssssssssss");

    console.log(Http.responseText);
  }
}


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