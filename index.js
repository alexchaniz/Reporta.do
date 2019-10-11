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

var delayComprobationStep=4;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));


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
    homeOrComunitty: { type: String },
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

//Sets replys
var grettingsReply = {
    "text": "Hola, es el asistente de daños de República Dominicana. ¿Como le ayudamos?",
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
    "text": "Haga un reporte de daños en su hogar o comunidad?",
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
    "text": "¿Que daños ha sufrido su vivienda?",
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

var cause = ["Lluvias intensas", "Deslizamientos", "Incendio o explosión", "Huracán", "Terremoto", "Violencia", "Accidentede tráfico", "Tsunami", "Otro"]
var causeReply = {
    "text": "Diganos la causa de los daños",
    "quick_replies": [
        {
            "content_type": "text",
            "title": "Lluvias intensas",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        }, {
            "content_type": "text",
            "title": "Deslizamientos",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        }, {
            "content_type": "text",
            "title": "Incendio o explosión",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        }, {
            "content_type": "text",
            "title": "Huracán",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        }, {
            "content_type": "text",
            "title": "Terremoto",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        }, {
            "content_type": "text",
            "title": "Violencia",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        },
        {
            "content_type": "text",
            "title": "Accidentes de tráfico",
            "payload": "<POSTBACK_PAYLOAD>",
            "image_url": ""
        },
        {
            "content_type": "text",
            "title": "Tsunami",
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
    "text": "¿Hay fallecidos o heridos?",
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

var harmedPeopleReply = {
    "text": "Si hubo heridos, diganos cuantos usando números",
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
    "text": "Si hubo fallecidos, diganos cuantos usando números",
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
    "text": "¿Quiere reportar otro daño?",
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
        }
    ]
}

var byeReply = {
    "text": 'Muchas gracias por colaborar con el servicio de monitoreo. Su información nos es muy util para ayudarle.\n Con el siguiente link podrá avisar a sus amigos de que nos ha ayudado con su información: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
};


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

    //Checks if is an echomessage. If it is, it wont be analyced
    if (!received_message.is_echo) {

        console.log("Handling message: ");

        console.log("Delay step : " + delayComprobationStep);
    
        delayComprobationStep=0;
    
        if (delayComprobationStep>3){

            console.log("Delay checking...");
            
            delayComprobationStep=0;
            getDelayedReports();
        }

        //Sets report and step variables, that will be used
        var report = [];
        var step;

        //Set message state to recived and actives the typing icon
        //on the conversation
        messagingActions(sender_psid, "mark_seen")
        messagingActions(sender_psid, "typing_on")

        //Get the step in wich the report is so it can build the correct reply
        //Also gets the report object from the database, with all the info associated to the report
        var stepAux = await getStep(sender_psid);
        step = stepAux[0];
        report = stepAux[1];

        console.log("Getsteeeeeeeep" + step);

        //Sets the auxiliar response indicator to 0, so there isjust one reply message
        try {
            report[0].responseAuxIndicator = 0;
        } catch{ }

        // Expired conversation, new conversation or completed survey
        //Creates a new Report and inicialize the conversation
        if (step == -1) {
            //in that case creates another entry
            report = create(sender_psid, 1);
            report[0].response = grettingsReply;

            // Check if the message contains text
        } else if (received_message.text) {

            console.log("Received message is a text");
            console.log(received_message.text)

            var msgText = received_message.text;

            //checks if message is one of the preconfigured special messages
            if (msgText == "borrartodoArcoiris566") {
                //Erases the database content
                report[0].response = {
                    "text": "Base de datos mongodb reiniciada correctamente"
                }
                //reset the mongo database
                reset();

            } else if (msgText == "Asistencia 123") {
                //If the user writes this msg one of the page owners may take control of the conversation
                //So he/she can ask the pertinent questions

                console.log("Asistencia activada. Controlamos desde facebook manualmente la conversación");

                //changes takecontrol attribute of the report to true, to indicate that the control has been taken
                report[0].response = {
                    "text": "Uno de nuestros operarios ha tomado el control de la conversación."
                }
                //changes takecontrol attribute of the report to true, to indicate that the control has been taken
                report = fillReport("tomarControl", true, report);

            } else if (msgText == "Asistencia 321") {
                //Close asistance and leads to the last step

                report[0].responseAuxIndicator = 1;
                report[0].responseAux = {
                    "text": "El operario dejó de tener el control"
                }
                report[0].response = byeReply

                //changes the step, take control and the addsa litle text to the onservation field of the report
                var closeAsistanceAux = [20, false, "--Acabó la toma de control"]
                report = fillReport("closeAsistance", closeAsistanceAux, report);


            } else if (step) {
                //if an stepp have been received
                //Activate the function asociated to the step and report the variable
                switch (step) {
                    //if the control was took from the operator
                    case -2:
                        //in case take control is true
                        messagingActions(sender_psid, "typing_off")
                        report = fillReport("observation", msgText, report)
                        break;
                    case 1:
                        report = await step1(msgText, report);
                        break;
                    case 2:
                        report = await step2(msgText, report);
                        break;
                    case 3:
                        report = await step3(msgText, report);
                        break;
                    case 4:
                        report = await step4(msgText, report);
                        break;
                    case 5:
                        report = await step5(msgText, report);
                        break;
                    case 6:
                        report = await step6(msgText, report);
                        break;
                    case 7:
                        report = await step7(msgText, report);
                        break;
                    case 9:
                        //in case the user responses to the location petition with text instead of a location object
                        report = nextStep(report);
                        report[0].responseAuxIndicator = 1;
                        report[0].responseAux = {
                            "text": 'Es importante que nos envie su ubicación para ayudarle. Deberá aceptar esto en el movil. En otro caso puede escribir su dirección(calle y ciudad)'
                        }
                        report[0].response = locationReply;
                        break;
                    case 10:
                        //in case user responses again with a text to the location demand
                        report = await step9Aux(msgText, report);
                        break;
                    case 11:
                        report = await step11(msgText, report);
                        break;
                    case 12:
                        report = await step12(msgText, report);
                        break;
                    case 13:
                        report = await step13(msgText, report);
                        break;
                    case 14:
                        report = await step14(msgText, report);
                        break;
                    case 15:
                        report = await step15(msgText, report);
                        break;
                    case 16:
                        report = await step16(msgText, report);
                        break;
                    case 18:
                        report = await step9Aux(msgText, report);
                        break;
                    case 19:
                        report = await step19(msgText, report);
                        break;
                    case 20:
                        report = await step20(msgText, report);
                        break;
                    default:
                        //Asks for the cooect question to return as no action could be took
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

                //checks if the image have been received in the correct step
                if ((step == -2) || (step == 8) || (step == 17)) {

                    // Get the URL of the message attachment
                    let attachment_url = received_message.attachments[0].payload.url;

                    //if the takecntrol field is true
                    if (step == -2) {
                        //set the step to 8 for changing it to 9 when updating the report.
                        //As this activates the step8 function it will reply automatically with the location demand as itwill always
                        //be necessary. It is recomended to the administrator to ask for an image to the user so this
                        //cycle gets activated and this fields are updated
                        report[0].step = 8;
                        console.log(report[0].step);

                    }

                    //calls step8 funtion
                    report = await step8(attachment_url, received_message.attachments[0].type, report);
                    console.log("after step 8 " + report[0].step);

                } else {
                    //If the image was not sent in the correct step activates the correctdemand function so
                    //replys with the correct question
                    console.log("wrong step");
                    report = correctDemand(sender_psid, step, report);
                }
            } else if (received_message.attachments[0].type == "location") {
                //If the recived message is a location package
                console.log("Received message is a location");

                //checks f the locatn was received in the correctstep
                if ((step == -2) || (step == 9) || (step == 10)) {

                    //calls the step 9 function
                    report = await step9(received_message, report)
                } else {

                    //If the loction was not sent in the correct step activates the correctdemand function so
                    //replys with the correct question
                    report = correctDemand(sender_psid, step, report);
                }
            } else {
                //if none of the ifs was satisfiedcalls correctdemand
                report = correctDemand(sender_psid, step, report);
            }
        } else {
            //if none of the ifs was satisfiedcalls correctdemand
            report = correctDemand(sender_psid, step, report);
        }

        //quits the typing widget in the conversation
        await messagingActions(sender_psid, "typing_off").then(async function () {

            // Sends the response message
            //In case aux=1 send auxiliar response
            if (report[0].responseAuxIndicator == 1) {
                console.log("Se envia mensaje previo de alcaración");

                await callSendAPI(sender_psid, report[0].responseAux).then(async function (err, data) {
                    await callSendAPI(sender_psid, report[0].response);
                })
            } else {
                console.log("No hay mensaje previo de alcaración");
                console.log("response");

                await callSendAPI(sender_psid, report[0].response);
            }
        });
    }
}

//Functions to be triggered in the pertinent step of the conversantion as ordered

//Evaluates the message, build a reply and change the step for the grettings reply from the user
async function step1(msgText, report) {
    console.log("Steeeeeeep 1111111111111111");

    //Check if we recibe the text from the Quick Replys
    //If it is information we stay in the step
    if (msgText == "Información") {
        report[0].responseAuxIndicator = 1
        report[0].responseAux = {
            "text": 'Somos el asistente de daños de República Dominicana. Nuestro trabajo consiste en recoger información sobre los daños sufridos por desastre naturales para poder actuar mejor respecto a estos. Estamos a su disposición en caso de que ocurra algo /n Puede compartir nuestro trabajo en sus Redes Sociales: https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/'
        }
        report[0].response = grettingsInfoReply;
        report = fillReport("step", 1, report);

        //if it is "Si"o "Reportar daños avanzamos un paso"
    } else if ((msgText == "¡Si!") || (msgText == "Reportar daños")) {
        report = nextStep(report);
        report[0].response = safePlaceReply;

        //If it is "No" remain in the step 1
    } else if (msgText == "No") {
        report[0].response = {
            "text": "Nos alegramos de que no haya sufrido ningún problema, muchas gracias"
        };
        report = fillReport("step", 1, report)

        //If the message contains "no" and "app" we activates the auxiliar conversation for users without writting from the mobile browser
    } else if ((msgText.toLowerCase().includes("no")) && (msgText.includes("app"))) {
        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
            "text": "De acuerdo, iniciaremos un reporte sin botones"
        }
        report[0].response = {
            "text": "¿Cual es la causa de los daños producidos?"
        }

        //Change the field fromApp of the report to false and upgrade one step
        report = fillReport("fromApp", false, report)

        //if the user dont use the buttons and don´t say No app, we understand that maybe the user can´t see the buttons and 
        //inform him/her about the option of having an auxiliar conversation with nobuttons
    } else {

        console.log(report[0].response);
        console.log(grettingsReply);

        console.log(report[0].response == "");

        //Checks if the response field is empty. This let us know if the report was just created via writting a msg,
        //so we dont show the auxiliar message, or if we have already made a first reply and the user didnt use the buttons 
        if (!report[0].response == "") {

            report[0].responseAuxIndicator = 1;
            report[0].responseAux = {
                "text": 'Si no le aparecen los botones quiere decir que no nos escribe desde la aplicación de messenger. Sería mejor que nos escribiera desde la app. En caso de que este usando el celular y no le sea posible escribanos "No tengo la app"'
            };
        }
        report[0].response = grettingsReply;

        //maintain the steo to 1 and update the response fields
        report = fillReport("step", 1, report)
    }

    //Returns the report object after the pertinent modifications
    return report;
}

//Evaluates the message, build a reply and change the step for the safeplace reply from the user
async function step2(msgText, report) {
    console.log("Steeeeeeep 22222222222222222222222");

    //if response to the safe place question is "No"
    if (msgText == "No") {
        report[0].response = {
            "text": 'Vaya a un lugar seguro. En caso de que sea necesario utilice el numero de emergencias 911.\n Escribanos cuando este en un lugar seguro'
        }

        //if response is Si we upgrade the step adn the reply
    } else if (msgText == "Si") {

        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
            "text": "Ok, continuemos"
        }
        report[0].response = homeOrComunityReply;

        report = nextStep(report);

        //if the buttons are not used sends a reminder to use them
    } else {
        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
            "text": 'Utilice los botones para responder'
        };
        report[0].response = safePlaceReply;
    }

    //return the updated report
    return report;
}

//Evaluates the message, build a reply and change the step and if its a community or home reply field for the comunitty or home reply from the user
async function step3(msgText, report) {
    console.log("Steeeeeeep 33333333333333333333333333");

    //If uses the buttons fill the correspondent field
    if (msgText == "Comunidad" || msgText == "Hogar") {
        report[0].response = causeReply;
        report = fillReport("homeOrComunitty", msgText, report);

        //insist on using the buttons
    } else {
        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
            "text": 'Utilice los botones para responder'
        };
        report[0].response = homeOrComunityReply;
    }

    return report;
}

//Evaluates the message, build a reply and change the step for the cause reply from the user. updates the cause
async function step4(msgText, report) {
    console.log("Steeeeeeep 4444444444");

    //Checks if any button has been used.
    if (cause.includes(msgText)) {
        //If it is the button Otro replys forthe user to write the cause
        if (msgText == "Otro") {
            report[0].response = {
                "text": 'Escriba la causa del problema'
            }
            //otherwise update the cause field and response
        } else {
            report[0].response = homeDamagesReply;
            report = fillReport("cause", msgText, report);
        }
        //it the buttons has not been used saves the recive text as the cause
    } else {
        report[0].response = homeDamagesReply;
        report = fillReport("cause", msgText, report);
    }

    //Returns the updated report
    return report;
}

//Evaluates the message, build a reply, change the step and updates the homedamages 
//fields with the response to this question from the user
async function step5(msgText, report) {
    console.log("Steeeeeeep 55555555555");

    //Checks if the buttons has been used
    if (homeDamages.includes(msgText)) {
        //updates the homeDamages field
        report[0].response = humanDamagesReply;
        report = fillReport("homeDamages", msgText, report);

        //Oherwise insist on using he buttons
    } else {
        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
            "text": 'Utilice los botones para responder'
        };
        report[0].response = homeDamagesReply;
    }

    return report;
}

//Evaluates the message, build a reply, change the step and updates the humasHarmed 
//fields with the response to this question from the user
async function step6(msgText, report) {
    console.log("Steeeeeeep 666666666666");

    //If the response is no fills the humansHarmed and humanDetahs fields with a 0
    if (msgText == "No") {
        report[0].response = imageReply;
        report = fillReport("noHumansHarmed", msgText, report)

        //If its a yesreplys asking for the damaged ppl
    } else if (msgText == "Si") {
        report[0].response = harmedPeopleReply;

        //if the user replys to this las question with the No hubo heridos button, the pertinent field is filled 
        //with a 0
    } else if (msgText == "No hubo heridos") {
        report[0].response = deathPeopleReply;
        report = fillReport("humansHarmed", 0, report)

        //Otherwise understand that the message is a reply to the humansHarmed question and updates this
    } else {

        //IF the msg is not a number asks for replying with a number
        if (isNaN(msgText)) {
            report[0].response = {
                "text": "Señale el numero de heridos utilizando los números del teclado"
            };

            //Otherwise fills the pertinent field
        } else {
            report[0].response = deathPeopleReply;
            report = fillReport("humansHarmed", msgText, report)
        }
    }

    //Returns the updated response
    return report;
}

//Evaluates the message, build a reply, change the step and updates the humasDeath
//fields with the response to this question from the user
async function step7(msgText, report) {
    console.log("Steeeeeeep 7777777777777");

    //if the user replys to this las question with the No hubo muertos button, the pertinent field is filled 
    //with a 0
    if (msgText == "No hubo muertos") {
        report[0].response = imageReply;
        report = fillReport("humansDeath", 0, report)

        //Otherwise if the reply is not a number asks for a number
    } else if (isNaN(msgText)) {
        report[0].response = {
            "text": "Señale el numero de muertes utilizando los números del teclado"
        };

        //if it is a number updates this field with the value
    } else {
        report[0].response = imageReply;
        report = fillReport("humansDeath", msgText, report)
    }

    //returns the updated report
    return report;
}

//Evaluates the message, build a reply, change the step and updates the image
//fields with the response to this question from the user
async function step8(attachment_url, type, report) {
    console.log("Steeeeeeep 8888888888888");

    //Build a reply depending on if the function has been called form the auxiliar conversation or the one with buttons
    if (!report[0].fromApp) {
        report[0].response = {
            "text": 'Escribanos la dirección del suceso, especificando la calle y ciudad'
        };
    } else {
        report[0].response = locationReply;
    }

    //If type is equal to Image it means the attachment is an image, not a video
    if (type == "image") {

        //save the image as buffer
        getImage(attachment_url, function (err, data) {
            if (err) {
                throw new Error(err);
            } else {
                var image = [data, attachment_url];
                report = fillReport("img", image, report);
            }
        });

        //Otherwise it may be a video
    } else {
        report = fillReport("video", attachment_url, report);
    }

    //returns the updated report
    return report;
}

//Evaluates the message, build a reply, change the step and updates the location
//fields with the response to this question from the user
async function step9(received_message, report) {
    console.log("Steeeeeeep 999999999");

    //Get the coordinates from the package recived
    let coordinates = received_message.attachments[0].payload.coordinates;
    var location = [coordinates.long, coordinates.lat];

    console.log("cooooooooooooooooooooordinateeeeeeeeeeeeeeeeeeeees");
    console.log(coordinates);

    //Sets the step to 10, to be upgraded to 10 when filling the field, so we jump over the auxiliar step 10
    report[0].step = 10;

    //Build a reply depending on if the function has been called form the auxiliar conversation or the one with buttons
    if (!report[0].tomarControl) {
        report[0].response = observationReply;
    } else {
        report[0].response = {}
    }

    //saves the location
    report = fillReport("location", location, report);

    return report;
}

//Evaluates the message, build a reply, change the step and updates the location
//fields with the response to this question from the user. Called when the location has to be
//Signaled with an adress by the user
async function step9Aux(msgText, report) {
    console.log("Steeeeeeep 99999999999999auxxxxxxxxx");

    //Trys to get the coordnates from the address indicated
    try {
        var location = await getLocationFromAddress(msgText);
        console.log(location);
        location.push(msgText);

        //Saves coordinates and the address received
        report = fillReport("address", location, report);
        report[0].response = observationReply;

        //returns the updated report
        return report;

        //If the coordinates can no be got, insist to the userto write it correctly or differently
    } catch (error) {
        console.log("err getting adress");

        report[0].response = {
            "text": "No hemos encontrado la dirección que nos ha especifiado. Por favor, compruebe que el nombre está escrito correctamente, evitando el caracter ñ, o díganos la dirección de otro lugar próximo"
        }

        //returns the updated report
        return report;
    }
}

//Evaluates the message, build a reply, change the step and updates the observation
//fields with the response to this question from the user
async function step11(msgText, report) {
    console.log("Steeeeeeep 111 111 1 11 11 11");

    report[0].response = anotherReportReply;
    //Saves any text recibed as an observation, and send the report to the arcgis layer
    report = fillReport("observation", msgText, report);

    //returns the updated report
    return report;
}

//Evaluates the message, build a reply and change the step with the reply to the otherreply question
async function step12(msgText, report) {
    console.log("Steeeeeeep 12 12 12 12 12 12");

    //If used button is No, says bye and chane the step so its greater than 19.Case in wich the getStep function will
    //understand thats its necesary to build a new report, for the moment in wich the user could text us again
    if (msgText == "No") {
        report[0].response = byeReply;

        report = fillReport("step", 20, report);

        //If it is reportarit creates a new report
    } else if (msgText == "Reportar") {

        console.log("Step 111 siiiiiiii");
        report[0].responseAuxIndicator = 1;
        report[0].responseAux = {
            "text": 'Usted ha decidido reportar un nuevo daño'
        }
        //this new report may ster in the third step
        report = create(report[0].sender_id, 3);
        report[0].response = homeOrComunityReply;

        //if it is information replys with the pertinent information to the cause
    } else if (msgText = "Información") {
        //calls getCause Info to get the info to response
        report = getCauseInfo(report);
        report[0].response = anotherReportReply;

        //Otherwise insist on the question
    } else {
        report[0].responseAuxIndicator = 0,
            report[0].response = anotherReportReply;
    }

    //resturns the updated report or the new one
    return report;
}

//first step of the auxiliar conversation where it fills the cause that has been asked previously
//and asks for the home damages
async function step13(msgText, report) {
    report[0].response = {
        "text": "¿Ha sufrido daños su vivienda? Describalos"
    }
    report = fillReport("cause", msgText, report);
    return report;
}

//it fills the homeDamages that has been asked previously
//and asks for the human damages
async function step14(msgText, report) {
    report[0].response = {
        "text": "¿Ha habido muertos? Indiquenos la cantidad utilizando un número."
    }
    report = fillReport("homeDamages", msgText, report);
    return report;
}

//it fills the humas death that has been asked previously
//and asks for the humas death
async function step15(msgText, report) {
    //checks if its a number. In case its not it asks for a number
    if (!isNaN(msgText)) {
        report[0].response = {
            "text": "¿Ha habido heridos? Indiquenos la cantidad utilizando un número."
        }
        report = fillReport("humansDeath", msgText, report);
    }
    else {
        if (msgText.toLowerCase() == "no") {
            report = fillReport("humansDeath", msgText, report);
            report[0].response = {
                "text": "¿Ha habido heridos? Indiquenos la cantidad utilizando un número."
            }
        } else {
            report[0].response = {
                "text": "Indiquenos la cantidad utilizando un número."
            }
        }
    }
    return report;
}

//the same than the previous step. Asks for an image
async function step16(msgText, report) {
    if (!isNaN(msgText)) {
        report[0].response = {
            "text": "Envienos una imagen de los daños provocados"
        }
        report = fillReport("humansHarmed", msgText, report);
    }
    else {
        if (msgText.toLowerCase() == "no") {
            report = fillReport("humansHarmed", msgText, report);
            report[0].response = {
                "text": "Envienos una imagen de los daños provocados"
            }
        } else {
            report[0].response = {
                "text": "Indiquenos la cantidad utilizando un número."
            }
        }
    }
    return report;
}

//it fills the observation that has been asked previously
//and says bye
async function step19(msgText, report) {
    report[0].response = byeReply;

    report = fillReport("observation", msgText, report);
    return report;
}


//Look for the correct reply as no action could be took
function correctDemand(sender_psid, step, report) {
    console.log("correct demand");

    switch (step) {
        case -1:
            //cratesa neew report
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
        default:
            report[0].responseAuxIndicator = 1;
            report[0].responseAux = {
                "text": "Disculpe, hubo un problema. La encuesta volverá a comenzar."
            }
            report[0].response = grettingsReply;
            report = fillReport("step", 1, report);
            break;
    }

    return report;
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {

    var report = [];

    //sets the aux indicator to 0
    try {
        report[0].responseAuxIndicator = 0;
    } catch{ }

    // Get the payload for the postback
    let payload = received_postback.payload;

    //Activates thetyping widget in the ocnversatoin
    messagingActions(sender_psid, "typing_on")


    // Set the response based on the postback payload, andtake actions

    //if greetings create a new report. This will be used when starting a conversation for the first time, as
    //the usermay push a "comenzar" button
    if (payload === "Greeting") {
        report = create(sender_psid, 1);
        report[0].response = grettingsReply;

        //otherwise get the step ofthe report adn take the pertinet actionfrom the menu
    } else {
        var stepAux = await getStep(sender_psid);
        var step = stepAux[0];
        report = stepAux[1];

        //checks if interaction with static menu was received
        //if stepback was pushed sets the previousstep in the report
        if (payload === "stepback") {

            //if conversation is already in last step or in the first of the auxiliarsets the step in 1
            if ((step == 12) || (step == 13)) {
                report[0].response = grettingsReply;
                report = fillReport("step", 1, report)

                //Set the step to step - 1 and calls correctdemand to know the pertinentreply
            } else {
                report = correctDemand(sender_psid, step - 1, report);
                report = fillReport("step", step - 1, report)
            }

            //if restart was pushed sets the step to 1
        } else if (payload == "restart") {
            report[0].response = grettingsReply;
            report = fillReport("step", 1, report)

            //otherwise replys with the correct demand
        } else {
            report = correctDemand(sender_psid, step, report);
        }
    }

    //quits the typing widget
    await messagingActions(sender_psid, "typing_off").then(async function () {

        // Send the response
        await callSendAPI(sender_psid, report[0].response);
    });
}

//resets mongo db collection
function reset() {
    Report.deleteMany({}, function (err, doc) {
        console.log("removeeeeeeeeeeeeeeeeeeeeeed");
    });
}

//create new Report onject in db with the indicated step
function create(sender_psid, stepNew) {

    var report = [];
    var d = new Date();

    //creates a report object
    report[0] = new Report({
        sender_id: sender_psid,
        step: stepNew,
        response: "",
        responseAux: { "text": "Responda utilizando los botones por favor." },
        responseAuxIndicator: 0,
        fromApp: true,
        cause: "no cause indicated",
        damages: "no damages indicates",
        date: d.getTime(),
        observation: ".",
        X: 0,
        Y: 0,
        address: "no addresss indicated",
        img: "no image",
        tomarControl: false,
        formatedDate: d.toLocaleString() + " " + d.toTimeString()
    });

    //saves the created report object into the mongo data base
    report[0].save(function () {
        console.log("creado");
    });

    //returns the created report
    return report;
}

//Fills the indicates fill with the indicated values of the indicated report
function fillReport(field, value, report) {

    //adds 1 to the step
    report[0].step += 1;

    switch (field) {
        case "cause":
            report[0].cause = value;
            break;
        case "homeDamages":
            report[0].homeDamages = value;
            break;
        case "humansHarmed":
            //parses the number in the string to int type
            report[0].humansHarmed = parseInt(value);
            break;
        case "humansDeath":
            //parses the number in the string to int type
            report[0].humansDeath = parseInt(value);
            break;
        case "noHumansHarmed":
            //fills with 0 and adds another step
            report[0].humansHarmed = 0;
            report[0].humansDeath = 0;
            report[0].step += 1;
            break;
        case "img":
            //saves the img url and the img buffer
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
            //adds the recived observation value
            report[0].observation += value + "--";

            //if the control is not taken send the report to arcgis
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
            //sends thereport toarcgis
            sendReportToArcGis(report[0]);
            break;
        case "fromApp":
            report[0].fromApp = value;
            //set step to 13, step where the aux conversation starts
            report[0].step = 13;
            break;
        case "homeOrComunitty":
            report[0].homeOrComunitty = value;
            break;
        default:
            //In case it where wrongsomehow the step would just remain
            report[0].step = report[0].step - 1;
            return;
    }
    //Updates the date
    var date = new Date();
    report[0].date = date.getTime();

    //updates the object with the same object_id in the mongo database
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

    //looks for the object by its ibject_id and increases 1
    Report.findByIdAndUpdate(report[0]._id, { '$inc': { 'step': 1 } }, function (err, upt) {
        console.log("nexesteeeeeeeped");
    });

    report[0].step += 1;

    return report;
}

//Get the last created Report element in the db associated to the sender
function getReport(sender_psid) {
    //returns a promise
    return new Promise((resolve, reject) => {
        //search it by its object id. Sort it in descendent order by date and get just the first element 
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

    //trys to get the last report from the userwith th sender_psid
    try {
        var report = await getReport(sender_psid);
        console.log("tiempo pasado " + (d.getTime() - report[0].date));

        //if get report dont get any results means the user has none created so we will have to create one. 
        //We indicate this returning -1 
        if (report == []) {
            console.log("report is empty");
            step = -1;

            //if tomarcontrol from the report is truereturns a -1
        } else if (report[0].tomarControl) {
            console.log("Control tomado");
            step = -2;

            //in case the step is 9 or 10, the location stepwe set when reciving an image, we return the step
            //so the bot asks forthe location automatically
            if (report[0].step == 9 || report[0].step == 10) {
                step = report[0].step;
            }

            //if the step is greater than the greatest step posible of the conversation (19), orthe actual time is 15mins
            //greater than the time the report was created, returns a -1, indicating
            //that we will have to create a new one
        } else if ((report[0].step > 19) || (d.getTime() - report[0].date > 900000)) {
            console.log("Reports recibió el paso" + report[0].step);
            console.log();

            step = -1;

            //in any other case just return the step contained in this field from the report
        } else {
            step = report[0].step;
            console.log("steeeeeeeeeeep " + step);
        }

        //returns the stepand the report object
        return [step, report];

        //in casetherewere any error getting the report object returns a -1
    } catch (e) {
        return [-1, {}];
    }
}

//Method took from stack overflow i guess. Lost the source :(
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
function getCauseInfo(report) {

    console.log("infooooo causeeeeee");
    console.log(report[0].cause);

    //Sets an auxiliar response depending on the value of the cause(wich you can find in the cause array) field of the report
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

        //If the user didntsetany of the givenvalues we can not return an appropiate information message
        default:
            report[0].responseAux = {
                "text": "No marcó una de nuestras causas predeterminadas. No le podemos ayudar con información sobre la causa indicada"
            }
            break;
    }

    //return the updatedreport
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
function sendReportToArcGis(report) {

    var urlImgAux = report.imgUrl;

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
        //necesary to add the spatialReference so arcgis knows how it may use the coordinates
        "geometry": { "x": report.X, "y": report.Y, "spatialReference": { "wkid": 4326 } },
        "attributes": {
            "senderId": report.sender_id,
            "MongoId": report._id,
            "fromApp": report.fromApp,
            "homeOrComunitty": report.homeOrComunitty,
            "cause": report.cause,
            "homeDamages": report.homeDamages,
            "humansHarmed": report.humansHarmed,
            "humansDeath": report.humansDeath,
            "date": report.date,
            "X": report.X,
            "Y": report.Y,
            "address": report.address,
            "observation": report.observation,
            "imgUrl1": repImg,
            "formatedDate": report.formatedDate
        }
    }];

    //Converts the object to string so it can be added to the url
    var stringObject = JSON.stringify(object);
    console.log("SSSSSSSSSSSSSSStrrrrrrrrrrrrrrrrriiiiiiiiiiinnngggg");

    console.log(stringObject);

    //The url with the parameters indicated in the addFeature
    //rest service for updating data to an arcgis layer
    var url = process.env.ARCGIS_LAYER_ADDFEATURE + '/addFeatures?f=JSON&features=' + JSON.stringify(object);;
    console.log(url);

    //trys to send the post petition
    Http.open("POST", url);
    try {
        Http.send();
    } catch (error) {
        console.log("Error in the sending to arcgis");
        console.log(error);
    }

    //Prints the report
    Http.onreadystatechange = (e) => {
        console.log("arcgiiiiisssssssssssssssssssssssssss");
        console.log(Http.responseText);
    }
}

//Activate the messaging actions
async function messagingActions(sender_psid, action) {

    //Construct the fb request for messaging actions
    let request_body

    request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": action
    }

    console.log("Action: " + action);

    //Make a promise for calling the service
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

//Uses geocoding google api to get the cordinates froman address
async function getLocationFromAddress(address) {


    var apiKey = "AIzaSyB9Soo0S1gk2QTcexPqwoIhQKZOfNAxRvE";

    //Erases diacritics
    var addressAux1 = await eliminarDiacriticos(address)

    //Adds epublica dominicana to the addresso itis more specific for google services to find it
    var addressAux = addressAux1 + ", Republica Dominicana";

    //Adds theparameters to the url
    var url = "https://maps.googleapis.com/maps/api/geocode/json?key=" + apiKey + "&address=" + addressAux;

    console.log(url);

    //Calls the service
    Http.open("POST", url);
    try {
        Http.send();

    } catch (error) {
        console.log("Error in the sending to arcgis");
        console.log(error);
        return -1;
    }

    //returns a promise with the resulting coordinates or -1
    return new Promise((resolve, reject) => {


        Http.onreadystatechange = function (err, data) {

            //If its ready and the demand wassuccesfull
            if (this.readyState == 4 && this.status == 200) {
                var result = JSON.parse(this.responseText);

                //If the response fro the service has the status ZERO_RESULTS means there wereno results
                //for the specified address soit reutrns a -1
                if (result.status == "ZERO_RESULTS") {
                    reject(-1);
                    return;
                }

                //Otherwise goes to the pertinent field of the recived object to get the coordinates
                var coordinates = result.results[0].geometry.location;

                console.log("Coordenadas" + coordinates.lat + coordinates.lng);

                //Checks if the cordinatesare inside an imaginary square that contains dominican republic
                //If so, returns an object with the coordinates
                if ((17.3926782 < coordinates.lat) && (coordinates.lat < 20.79844) && (-74.3962979 < coordinates.lng) && (coordinates.lng < -68.2227217)) {
                    console.log("la dirección ha sido encontrada en dominicana");
                    resolve([coordinates.lng, coordinates.lat])
                    return;

                    //Otherwise returns a -1
                } else {
                    console.log("No esta en rd");

                    reject(-1)
                }

                //If the result is ready but its status is 400(an arror ocurred) itreturns a -1
            } else if (err || (this.status == 400 && this.readyState == 4)) {
                console.log("llega 5");

                reject(-1)
            }
        };
    })
}

//Erases th diacritic symbols, except the ñ, as if it has weird symbols the geocoding api wont work
//  //https://es.stackoverflow.com/questions/62031/eliminar-signos-diacr%C3%ADticos-en-javascript-eliminar-tildes-acentos-ortogr%C3%A1ficos
async function eliminarDiacriticos(texto) {
    //returnsa promise
    return new Promise((resolve, reject) => {
        var aux = texto.normalize('NFD').replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1").normalize();
        resolve(aux);
    })
}


//Get the delayed responses
async function getDelayedReports() {

    console.log("Checking delayed responses");
    
    while (delayComprobationStep <=3) {
    
    var actualDate = new Date();
    var delayedResponseTime = actualDate - 120000;
    var delayedReportTime = actualDate - 720000;

    var delayedResponses = Report.find({ date: { $lte: delayedResponseTime } }).sort({ date: -1 });

    for (let i = 0; i < delayedResponses.length; i++) {

        if (delayedResponses[i].date < delayedReportTime) {
            delayedResponses[i].delete();

        } else {
            response = correctDemand(delayedResponses[i].sender_psid, delayedResponses[i].step, delayedResponses[i])
            responseAux = {
                'text': 'Si no contesta el reporte acabará y deberá comenzarlo de nuevo'
            }
            await callSendAPI(delayedResponses[i].sender_psid, report[0].responseAux).then(async function (err, data) {
                callSendAPI(delayedResponses[i].sender_psid, response)
            })
        }

    }
    delayComprobationStep+=1;
    await sleep(120000);
    console.log("Sleep awake");
    
}
}