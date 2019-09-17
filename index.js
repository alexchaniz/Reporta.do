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

var ReportSchema = {
  sender_id: { type: Number },
  step: { type: Number },
  response: { type: {} },
  responseAux: { type: {} },
  responseAuxIndicator: { type: Number },
  fromApp: { type: Boolean },
  hormeOrComunitty: { type: String },
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

var Report_schema = new Schema(ReportSchema);
var Report = mongoose.model("Report", Report_schema);


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

var homeOrComunityReply = {
  "text": "¿Quiere hacer un reporte de daños en su hogar o de su comunidad?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "Hogar",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }, {
      "content_type": "text",
      "title": "Comunidad",
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
  "text": "¿Cuantas personas han resultado heridas? Escribanoslo usando números",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No hubo heridos",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var deathPeopleReply = {
  "text": "Si hubo muertos, ¿Podría escribirnos cuantos?",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No hubo muertos",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var imageReply = {
  "text": 'Envienos una foto de los daños'
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
      }]
    }
  }
}

var observationReply = {
  "text": "Si quiere hacer alguna observación añadalá en el siguiente mensaje",
  "quick_replies": [
    {
      "content_type": "text",
      "title": "No es neceario",
      "payload": "<POSTBACK_PAYLOAD>",
      "image_url": ""
    }
  ]
}

var anotherReportReply = {
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

var byeReply = {
  "text": 'Muchas gracias por colaborar con el servicio de monitoreo. Su información nos es muy util para ayudarle.\n Con el siguiente link podrá avisar a sus amigos de que nos ha ayudado con su información: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
};


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

    var report = [];
    var step;

    //Set message state to recived and actives the typing icon
    //on the conversation
    messagingActions(sender_psid, "mark_seen")
    messagingActions(sender_psid, "typing_on")


    console.log("Handling message: ");

    //Get the step the conversation is
    var stepAux = await getStep(sender_psid, report);
    step = stepAux[0];
    report = stepAux[1];
    console.log("Getsteeeeeeeep" + step);


    try {
      report[0].responseAuxIndicator = 0;
    } catch{ }

    // Expired conversation, new conversation or completed survey
    //Creayes a new conversation, a new Report
    if (step == -1) {
      //in that case creates another entry
      report = create(sender_psid, 1);
      report[0].response = grettingsReply;

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
      if (msgText == "borrartodoArcoiris566") {
        report[0].response = {
          "text": "Base de datos mongodb reiniciada correctamente"
        }
        reset();

      } else if (msgText == "Asistencia 123") {
        console.log("controlando porqueeee");

        report = fillReport(sender_psid, "tomarControl", true, report);
        report[0].response = {
          "text": "Uno de nuestros operarios ha tomado el control de la conversación."
        }

      } else if (msgText == "Asistencia 321") {
        var closeAsistanceAux = [12, false, "--Acabó la toma de control"]
        report = fillReport(sender_psid, "closeAsistance", closeAsistanceAux, report);
        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
          "text": "El operario dejó de tener el control"
        }
        report[0].response = anotherReportReply

      } else if (step) {

        //Activate the function asociated to the step and report the variable
        switch (step) {
          //if the control was took from the operator
          case -2:
            messagingActions(sender_psid, "typing_off")
            report = fillReport(sender_psid, "observation", msgText, report)
            break;
          case 1:
            report = await step1(sender_psid, msgText, report);
            break;
          case 2:
            report = await step2(sender_psid, msgText, report);
            break;
          case 3:
            report = await step3(sender_psid, msgText, report);
            break;
          case 4:
            report = await step4(sender_psid, msgText, report);
            break;
          case 5:
            report = await step5(sender_psid, msgText, report);
            break;
          case 6:
            report = await step6(sender_psid, msgText, report);
            break;
          case 7:
            report = await step7(sender_psid, msgText, report);
            break;
          case 9:
            report = nextStep(report);
            report[0].responseAuxIndicator = 1;
            report[0].responseAux = {
              "text": 'Es importante que nos envie su ubicación para ayudarle. Deberá aceptar esto en el movil. En otro caso puede escribir su dirección(calle y ciudad)'
            }
            report[0].response = locationReply;
            break;
          case 10:
            report = await step9Aux(sender_psid, msgText, report);
            break;
          case 11:
            report = await step11(sender_psid, msgText, report);
            break;
          case 12:
            report = await step12(sender_psid, msgText, report);
            break;
          case 13:
            report = await step13(sender_psid, msgText, report);
            break;
          case 14:
            report = await step14(sender_psid, msgText, report);
            break;
          case 15:
            report = await step15(sender_psid, msgText, report);
            break;
          case 16:
            report = await step16(sender_psid, msgText, report);
            break;
          case 18:
            report = await step8Aux(sender_psid, msgText, report);
            break;
          case 19:
            report = await step19(sender_psid, msgText, report);
            break;
          case 20:
            report = await step20(sender_psid, msgText, report);
            break;
          default:
            //Asks for the cooect question to return as no action coud be tooken
            report = await correctDemand(sender_psid, step, report);
            break;
        }
      }

      //Check if message has attached elements
    } else if (received_message.attachments) {

      //if image or video
      if ((received_message.attachments[0].type == "image") || (received_message.attachments[0].type == "video")) {
        console.log("Received message is an image");
        console.log(received_message.attachments[0]);


        if ((report[0].tomarControl) || (step == 8) || (step == 17)) {

          // Get the URL of the message attachment
          let attachment_url = received_message.attachments[0].payload.url;
          report = await step8(sender_psid, attachment_url, received_message.attachments[0].type, report);

        } else {
          console.log("wrong step");
          report = correctDemand(sender_psid, step, report);
        }
      } else if (received_message.attachments[0].type == "location") {
        console.log("Received message is a location");

        if ((report[0].tomarControl) || (step == 9) || (step == 10)) {

          report = await step9(sender_psid, received_message, report)
        } else {
          report = correctDemand(sender_psid, step, report);
        }
      } else {
        report = correctDemand(sender_psid, step, report);
      }
    } else {
      report = correctDemand(sender_psid, step, report);
    }

    await messagingActions(sender_psid, "typing_off").then(async function () {

      // Sends the response message
      //In case aux=1 send auxiliar response
      if (report[0].responseAuxIndicator == 1) {
        await callSendAPI(sender_psid, report[0].responseAux).then(async function (err, data) {
          await callSendAPI(sender_psid, report[0].response);
          console.log("Se envia mensaje previo de alcaración");
        })
      } else {
        console.log("No hay mensaje previo de alcaración");

        console.log("response");

        await callSendAPI(sender_psid, report[0].response);
      }
    });
  }
}

//Steps of the conversantion as ordered
async function step1(sender_psid, msgText, report) {
  console.log("Steeeeeeep 1111111111111111");

  //Check if we recibe the text from the Quick Replys
  if (msgText == "Información") {
    report[0].responseAuxIndicator = 1
    report[0].responseAux = {
      "text": 'Somos el asistente de daños de República Dominicana. Nuestro trabajo consiste en recoger información sobre los daños sufridos por desastre naturales para poder actuar mejor respecto a estos. Estamos a su disposición en caso de que ocurra algo /n Puede compartir nuestro trabajo en sus Redes Sociales: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
    }
    report[0].response = grettingsInfoReply;
    report = fillReport(sender_psid, "step", 1, report);

  } else if ((msgText == "¡Si!") || (msgText == "Reportar daños")) {
    report = nextStep(report);
    report[0].response = safePlaceReply;

  } else if (msgText == "No") {
    report[0].response = {
      "text": "Nos alegramos de que no haya sufrido ningún problema, muchas gracias"
    };
    report = fillReport(sender_psid, "step", 1, report)

  } else if ((msgText.toLowerCase().includes("no")) && (msgText.includes("app"))) {
    report[0].responseAuxIndicator = 1;
    report[0].responseAux = {
      "text": "De acuerdo, iniciaremos un reporte sin botones"
    }
    report[0].response = {
      "text": "¿Cual es la causa de los daños producidos?"
    }
    report = fillReport(sender_psid, "fromApp", false, report)

  } else {
    console.log("a verrrrrrrrrrrrrrrrrr");

    console.log(report[0].response);
    console.log(grettingsReply);

    console.log(report[0].response == "");

    if (!report[0].response == "") {
      console.log("LLega aqui");

      report[0].responseAuxIndicator = 1;
      report[0].responseAux = {
        "text": 'Si no le aparecen los botones quiere decir que no nos escribe desde la aplicación de messenger. Sería mejor que nos escribiera desde la app. En caso de que este usando el celular y no le sea posible escribanos "No tengo la app"'
      };
    }
    report[0].response = grettingsReply;
    report = fillReport(sender_psid, "step", 1, report)
  }

  return report;
}

async function step2(sender_psid, msgText, report) {
  console.log("Steeeeeeep 22222222222222222222222");

  if (msgText == "No") {
    report[0].response = {
      "text": 'Debería ir a un lugar seguro. En caso de que sea necesario utilice el numero de emergencias 911.\n No dude en escribirnos cuando este seguro'
    }
  } else if (msgText == "Si") {
    report = nextStep(report);

    report[0].responseAuxIndicator = 1;
    report[0].responseAux = {
      "text": "Ok, continuemos"
    }
    report[0].response = homeOrComunityReply;
  } else {
    report[0].responseAuxIndicator = 1;
    report[0].responseAux = {
      "text": 'Utilice los botones para responder'
    };
    report[0].response = safePlaceReply;
  }

  return report;
}

async function step3(sender_psid, msgText, report) {
  console.log("Steeeeeeep 33333333333333333333333333");

  if (msgText == "Comunidad") {
    report[0].response = causeReply;
    report = fillReport(sender_psid, "hormeOrComunitty", msgText, report);

  } else if (msgText == "Hogar") {
    report[0].response = causeReply;
    report = fillReport(sender_psid, "hormeOrComunitty", msgText, report);
  } else {
    report[0].responseAuxIndicator = 1;
    report[0].responseAux = {
      "text": 'Utilice los botones para responder'
    };
    report[0].response = homeOrComunityReply;
  }

  return report;
}

async function step4(sender_psid, msgText, report) {
  console.log("Steeeeeeep 33333333333333333333333333");

  if (cause.includes(msgText)) {
    if (msgText == "Otro") {
      report[0].response = {
        "text": 'Escriba la causa del problema'
      }
    } else {
      report = fillReport(sender_psid, "cause", msgText, report);
      report[0].response = homeDamagesReply;
    }
  } else {
    report = fillReport(sender_psid, "cause", msgText, report);
    report[0].response = homeDamagesReply;
  }

  return report;
}

async function step5(sender_psid, msgText, report) {
  console.log("Steeeeeeep 44444444444444444");

  if (homeDamages.includes(msgText)) {
    report = fillReport(sender_psid, "homeDamages", msgText, report);
    report[0].response = humanDamagesReply;
  } else {
    report[0].responseAuxIndicator = 1;
    report[0].responseAux = {
      "text": 'Utilice los botones para responder'
    };
    report[0].response = homeDamagesReply;
  }

  return report;
}

async function step6(sender_psid, msgText, report) {
  console.log("Steeeeeeep 5555555555555");

  if (msgText == "No") {
    report = fillReport(sender_psid, "noHumansHarmed", msgText, report)
    report[0].response = imageReply;
  } else if (msgText == "Si") {
    report[0].response = harmedPeopleReply;
  } else if (msgText == "No hubo heridos") {
    report = fillReport(sender_psid, "humansHarmed", 0, report)
    report[0].response = deathPeopleReply;
  } else {
    if (isNaN(msgText)) {
      report[0].response = {
        "text": "Señale el numero de heridos utilizando los números del teclado"
      };
    } else {
      report = fillReport(sender_psid, "humansHarmed", msgText, report)
      report[0].response = deathPeopleReply;
    }
  }
  /*else if (harmedPeople.includes(msgText)) {
    fillReport(sender_psid, "humansHarmed", msgText);
    response = deathPeopleReply;
  }*/

  return report;
}

async function step7(sender_psid, msgText, report) {
  console.log("Steeeeeeep 666666666666");

  if (msgText == "No hubo muertos") {
    report = fillReport(sender_psid, "humansDeath", 0, report)
    report[0].response = imageReply;
  } else if (isNaN(msgText)) {
    report[0].response = {
      "text": "Señale el numero de muertes utilizando los números del teclado"
    };
  } else {
    report = fillReport(sender_psid, "humansDeath", msgText, report)
    report[0].response = imageReply;
  }

  return report;
}

async function step8(sender_psid, attachment_url, type, report) {
  console.log("Steeeeeeep 777777777777777");

  if (type == "image") {

    //save the image as buffer
    getImage(attachment_url, function (err, data) {
      if (err) {
        throw new Error(err);
      } else {
        var image = [data, attachment_url];
        report = fillReport(sender_psid, "img", image, report);
      }
    });
  } else {
    report = fillReport(sender_psid, "video", attachment_url, report);
  }

  if (!report[0].fromApp) {
    report[0].response = {
      "text": 'Escribanos la dirección del suceso, especificando la calle y ciudad'
    };
  } else {
    report[0].response = locationReply;
  }
  return report;
}

async function step9(sender_psid, received_message, report) {
  console.log("Steeeeeeep 88888888");

  let coordinates = received_message.attachments[0].payload.coordinates;
  var location = [coordinates.long, coordinates.lat];
  console.log("cooooooooooooooooooooordinateeeeeeeeeeeeeeeeeeeees");

  console.log(coordinates);

  report[0].step = 9;
  report = fillReport(sender_psid, "location", location, report);
  if (!report[0].tomarControl) {
    report[0].response = observationReply;
  } else {
    report[0].response = {}
  }
  /*} else if (step == 10) {
    let coordinates = received_message.attachments[0].payload.coordinates;
    var location = [coordinates.X, coordinates.Y];
    fillReport(sender_psid, "observations", location);*/

  return report;
}

async function step9Aux(sender_psid, msgText, report) {
  console.log("Steeeeeeep 99999999999999");
  try {
    var location = await getLocationFromAddress(msgText);
    console.log(location);
    location.push(msgText);
    //Saves any text recibed
    report = fillReport(sender_psid, "address", location, report);
    report[0].response = observationReply;

    return report;

  } catch (error) {
    console.log("err getting adress");

    report[0].response = {
      "text": "No hemos encontrado la dirección que nos ha especifiado. Por favor, compruebe que el nombre está escrito correctamente, evitando el caracter ñ, o díganos la dirección de otro lugar próximo"
    }
    return report;
  }
}

async function step11(sender_psid, msgText, report) {
  console.log("Steeeeeeep 1000000000000000");

  //Saves any text recibed
  report = fillReport(sender_psid, "observation", msgText, report);
  report[0].response = anotherReportReply;

  return report;
}

async function step12(sender_psid, msgText, report) {
  console.log("Steeeeeeep 12 12 12 12 12 12");

  if (msgText == "No") {
    report[0].response = byeReply;

    report = fillReport(sender_psid, "step", 19, report);
  } else if (msgText == "Reportar") {

    console.log("Step 111 siiiiiiii");
    report[0].responseAuxIndicator = 1;
    report[0].responseAux = {
      "text": 'Usted ha decidido reportar un nuevo daño'
    }

    report = create(sender_psid, 3);
    report[0].response = homeOrComunityReply;

  } else if (msgText = "Información") {
    report = getCauseInfo(sender_psid, report);
    report[0].response = anotherReportReply;
  } else {
    report[0].responseAuxIndicator = 0,
      report[0].response = anotherReportReply;
  }

  return report;
}

async function step13(sender_psid, msgText, report) {
  report[0].response = {
    "text": "¿Ha sufrido daños su vivienda? Describalos"
  }
  report = fillReport(sender_psid, "cause", msgText, report);
  return report;
}

async function step14(sender_psid, msgText, report) {
  report[0].response = {
    "text": "¿Ha habido muertos? Indiquenos la cantidad utilizando un número."
  }
  report = fillReport(sender_psid, "homeDamages", msgText, report);
  return report;
}

async function step15(sender_psid, msgText, report) {
  if (!isNaN(msgText)) {
    report[0].response = {
      "text": "¿Ha habido heridos? Indiquenos la cantidad utilizando un número."
    }
    report = fillReport(sender_psid, "humansDeath", msgText, report);
  }
  else {
    report[0].response = {
      "text": "Indiquenos la cantidad utilizando un número."
    }
  }
  return report;
}

async function step16(sender_psid, msgText, report) {
  if (!isNaN(msgText)) {
    report[0].response = {
      "text": "Envienos una imagen de los daños provocados"
    }
    report = fillReport(sender_psid, "humansHarmed", msgText, report);
  }
  else {
    report[0].response = {
      "text": "Indiquenos la cantidad utilizando un número."
    }
  }
  return report;
}

async function step19(sender_psid, msgText, report) {
  report[0].response = observationReply;

  report = fillReport(sender_psid, "address", msgText, report);
  return report;
}

async function step20(sender_psid, msgText, report) {
  report[0].response = byeReply;
  report = fillReport(sender_psid, "observation", msgText, report);
  return report;
}



//Look for the correct reply as no action could be took
function correctDemand(sender_psid, step, report) {
  console.log("correct demand");

  switch (step) {
    case -1:
      report = create(sender_psid, 1);
      report[0].response = grettingsReply;
      break;
    case 8: case 17:
      report[0].responseAuxIndicator = 1;
      report[0].responseAux = {
        "text": 'Una foto es de mucha ayuda para ubicar los daños.'
      }
      report[0].response = imageReply;
      break;
    case 9:
    case 10:
      report[0].responseAuxIndicator = 1;
      report[0].responseAux = {
        "text": 'Es importante que nos envie su ubicación para ayudarle. Deberá aceptar esto en el movil. En otro caso puede escribir su dirección'
      }
      report[0].response = locationReply;
      break;
    case 1:
      report[0].response = grettingsReply;
      break;
    case 2:
      report[0].response = safePlaceReply;
      break;
    case 3:
      report[0].response = homeOrComunityReply;
      break;
    case 4:
      report[0].response = causeReply;
      break;
    case 5:
      report[0].response = homeDamagesReply;
      break;
    case 6:
      report[0].response = humanDamagesReply;
      break;
    case 7:
      report[0].response = deathPeopleReply;
      break;
    case 11:
      report[0].response = observationReply;
      break;
    case 12:
      report[0].response = anotherReportReply;
      break;
    case 13:
      report[0].response = {
        "text": "¿Cual es la causa de los daños producidos"
      };
      break;
    case 14:
      report[0].response = {
        "text": "¿Ha sufrido daños su vivienda? Describalos"
      };
      break;
    case 15:
      report[0].response = {
        "text": "¿Ha habido muertos? Indiquenos la cantidad utilizando un número."
      };
      break;
    case 16:
      report[0].response = {
        "text": "¿Ha habido heridos? Indiquenos la cantidad utilizando un número."
      };
      break;
    case 18:
      report[0].response = {
        "text": 'Escribanos la dirección del suceso, especificando la calle y ciudad'
      };
      break;
    case 19:
      report[0].response = observationReply;
      break;
    case 20:
      report[0].response = byeReply;
      break;
    default:
      report[0].responseAuxIndicator = 1;
      report[0].responseAux = {
        "text": "Disculpe, hubo un problema. La encuesta volverá a comenzar."
      }
      report[0].response = grettingsReply;
      report = fillReport(sender_psid, "step", 1, report);
      break;
  }

  return report;
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {

  var report = [];
  try {
    report[0].responseAuxIndicator = 0;
  } catch{ }
  // Get the payload for the postback
  let payload = received_postback.payload;
  messagingActions(sender_psid, "typing_on")


  // Set the response based on the postback payload
  if (payload === "Greeting") {
    report = create(sender_psid, 1);
    report[0].response = grettingsReply;

  } else {
    var stepAux = await getStep(sender_psid, report);
    var step = stepAux[0];
    report = stepAux[1];

    //checks if interaction with static menu was received
    if (payload === "stepback") {

      //if conversation is already in last step
      if ((step == 12) || (step == 13)) {
        report[0].response = grettingsReply;
        report = fillReport(sender_psid, "step", 1, report)
      } else {
        report = correctDemand(sender_psid, step - 1, report);
        report = fillReport(sender_psid, "step", step - 1, report)
      }
    } else if (payload == "restart") {
      report = fillReport(sender_psid, "step", 1, report)
      report[0].response = grettingsReply;
    } else {
      report = correctDemand(sender_psid, step, report);
    }
  }
  await messagingActions(sender_psid, "typing_off").then(async function () {

    // Send the message to acknowledge the postback
    await callSendAPI(sender_psid, report[0].response);
  });
}

//resets mongo db collection
function reset() {
  Report.deleteMany({}, function (err, doc) {
    console.log("removeeeeeeeeeeeeeeeeeeeeeed");
  });
}

//create new Report onject in db
function create(sender_psid, stepNew) {

  var report = [];
  var d = new Date();

  report[0] = new Report({
    sender_id: sender_psid,
    step: stepNew,
    response: "",
    responseAux: { "text": "Responda utilizando los botones por favor." },
    responseAuxIndicator: 0,
    fromApp: true,
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

  report[0].save(function () {
    console.log("creado");
    Report.find(function (err, doc) {
      console.log("guardadoooooooooooooooo")
    });
  });

  return report;
}

//Fills the indicates fill with the indicated values
function fillReport(sender_psid, field, value, report) {

  report[0].step += 1;

  switch (field) {
    case "cause":
      report[0].cause = value;
      break;
    case "homeDamages":
      report[0].homeDamages = value;
      break;
    case "humansHarmed":
      report[0].humansHarmed = parseInt(value);
      break;
    case "humansDeath":
      report[0].humansDeath = parseInt(value);
      break;
    case "noHumansHarmed":
      report[0].humansHarmed = 0;
      report[0].humansDeath = 0;
      report[0].step += 1;
      break;
    case "img":
      report[0].img.data = value[0];
      report[0].img.contentType = 'image/png';
      report[0].imgUrl = value[1];
      break;
    case "video":
      report[0].imgUrl = value;
    case "location":
      report[0].X = value[0];
      report[0].Y = value[1];
      break;
    case "address":
      report[0].address = value[2];
      report[0].X = value[0];
      report[0].Y = value[1];
      break;
    case "observation":
      report[0].observation += value + "--";
      if (!report[0].tomarControl) {
        sendReportToArcGis(report[0]);
      } else {
        report[0].response = {};
      }
      break;
    case "tomarControl":
      report[0].tomarControl = value;
      break;
    case "step":
      report[0].step = value;
      break;
    case "closeAsistance":
      report[0].step = value[0];
      report[0].tomarControl = value[1];
      report[0].observation += value[2];
      sendReportToArcGis(report[0]);
      break;
    case "fromApp":
      report[0].fromApp = value;
      report[0].step = 13;
      break;
    case "hormeOrComunitty":
      report[0].hormeOrComunitty = value;
      break;
    default:
      report[0].step = report[0].step - 1;
      return;
  }

  Report.findByIdAndUpdate(report[0]._id, report[0], function (err, upt) {
    console.log("field : " + field + "-------saved")
    Report.find(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("guardadoooooooooooooooo")
      }
    });
  })
  return report;
}

//Set the nex step. Sums 1
function nextStep(report) {

  Report.findByIdAndUpdate(report[0]._id, { '$inc': { 'step': 1 } }, function (err, upt) {
    console.log("nexesteeeeeeeped");
    Report.find(function (err, docx) {
      console.log(docx);
    });
  });

  report[0].step += 1;

  return report;
}

//Get the last created Report element in the db associated to the sender
function getReport(sender_psid) {
  return new Promise((resolve, reject) => {
    Report.find({ sender_id: sender_psid }).sort({ date: -1 }).limit(1).then(
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
    var report = await getReport(sender_psid);
    console.log("tiempo pasado " + (d.getTime() - report[0].date));

    if (report == []) {
      console.log("report is empty");
      step = -1;
    } else if (report[0].tomarControl) {
      console.log("Control tomado");
      step = -2;
    } else if ((report[0].step > 19) || (d.getTime() - report[0].date > 900000)) {
      console.log("Reports recibió el paso" + report[0].step);
      console.log();

      if (report[0].step < 6) {
        report[0].remove();
      }
      step = -1;
    } else {
      step = report[0].step;
      console.log("steeeeeeeeeeep " + step);
    }

    return [step, report];
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
function getCauseInfo(sender_psid, report) {

  console.log("infooooo causeeeeee");
  console.log(report[0].cause);

  report[0].responseAuxIndicator = 1;
  switch (report[0].cause) {
    case cause[0]:
      report[0].responseAux = {
        "text": "Información huracán"
      }
      break;
    case cause[1]:
      report[0].responseAux = {
        "text": "Información lluvias torrenciales"
      }
      break;
    case cause[2]:
      report[0].responseAux = {
        "text": "Información deslizamiento de tierras"
      }
      break;
    case cause[3]:
      report[0].responseAux = {
        "text": "Información terremoto"
      }
      break;
    case cause[4]:
      report[0].responseAux = {
        "text": "Información fuego o explosión"
      }
      break;
    default:
      report[0].responseAux = {
        "text": "No marcó una de nuestras causas predeterminadas. No le podemos ayudar con información sobre la causa indicada"
      }
      break;
  }
  //report = nextStep(report);

  return report;
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
function sendReportToArcGis(Report) {
  /*
    var xhr = new XMLHttpRequest();
    var blob;
  
    // Use JSFiddle logo as a sample image to avoid complicating
    // this example with cross-domain issues.
    xhr.open("GET", Report.imgUrl, true);
  
    // Ask for the result as an ArrayBuffer.
    xhr.responseType = "arraybuffer";
  
    xhr.onload = function (e) {
      // Obtain a blob: URL for the image data.
      var arrayBufferView = new Uint8Array(this.response);
      console.log("aaaaaaaaaaaaarrrrrrrrrraaaaaaybuffer");
  
      console.log(arrayBufferView);
  
      blob = new Blob([arrayBufferView], { type: Report.img.contentType });
    }
    console.log("blooooooooooooooooooooooooob");
  
    console.log(blob);
  
    // var imgg = new Blob(Report.img.data, {type : Report.img,type})
  */

  var urlImgAux = Report.imgUrl;

  console.log(urlImgAux);

  try {
    //Replace the & for the string 'aspersan' as the other is bad interpretes
    // int the reques, as it may signal a new parameter when its part of one of them
    var repImg = urlImgAux.replace(/&/g, "aspersan");
  } catch (error) {
    console.log("No se subio ninguna imgen");

  }

  //Constructs the object witht he data to Report
  var object = [{
    "geometry": { "x": Report.X, "y": Report.Y, "spatialReference": { "wkid": 4326 } },
    "attributes": {
      "senderId": Report.sender_id,
      "MongoId": Report._id,
      "fromApp": Report.fromApp,
      "cause": Report.cause,
      "homeDamages": Report.homeDamages,
      "humansHarmed": Report.humansHarmed,
      "humansDeath": Report.humansDeath,
      "date": Report.date,
      "X": Report.X,
      "Y": Report.Y,
      "address": Report.address,
      "observation": Report.observation,
      "imgUrl1": repImg,
      "formatedDate": Report.formatedDate
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
    //  formData.append("attachment", Report.imgUrl);  
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

async function getLocationFromAddress(address) {

  var apiKey = "AIzaSyB9Soo0S1gk2QTcexPqwoIhQKZOfNAxRvE";

  //elimina tildes y diacriticos
  var addressAux1 = await eliminarDiacriticosEs(address)

  var addressAux = addressAux1 + ", Republica Dominicana";

  var url = "https://maps.googleapis.com/maps/api/geocode/json?key=" + apiKey + "&address=" + addressAux;

  console.log(url);

  Http.open("POST", url);
  try {
    Http.send();

  } catch (error) {
    console.log("Error in the sending to arcgis");
    console.log(error);
    return -1;
  }

  console.log("llega 2");


  return new Promise((resolve, reject) => {

    Http.onreadystatechange = function (err, data) {
      console.log("llega 3");
      console.log(this.status + "    " + this.readyState);

      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        console.log("llega 4");

        if (result.status == "ZERO_RESULTS") {
          reject(-1);
          return;
        }

        var coordinates = result.results[0].geometry.location;

        console.log("Coordenadas" + coordinates.lat + coordinates.lng);

        //Comprueba si las coordenadas pertenecen al area del pais
        if ((17.3926782 < coordinates.lat) && (coordinates.lat < 20.79844) && (-74.3962979 < coordinates.lng) && (coordinates.lng < -68.2227217)) {
          console.log("la dirección ha sido encontrada en dominicana");
          resolve([coordinates.lng, coordinates.lat])
          return;
        } else {
          console.log("No esta en rd");

          reject(-1)
        }
      } else if (err || (this.status == 400 && this.readyState == 4)) {
        console.log("llega 5");

        reject(-1)
      }
    };
  })
}

// Elimina los diacríticos de un texto excepto si es una "ñ" (ES6)
//  //https://es.stackoverflow.com/questions/62031/eliminar-signos-diacr%C3%ADticos-en-javascript-eliminar-tildes-acentos-ortogr%C3%A1ficos

async function eliminarDiacriticosEs(texto) {
  return new Promise((resolve, reject) => {
    var aux = texto.normalize('NFD').replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1").normalize();
    resolve(aux);
  })
}