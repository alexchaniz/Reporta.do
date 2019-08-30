// prepare the header
/*var postheaders = {
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
};
 
// the post options
var optionspost = {
    host : 'graph.facebook.com',
    port : 443,
    path : '/youscada/feed?access_token=your_api_key',
    method : 'POST',
    headers : postheaders
};*/

/*var $http = require('request');
console.log("hh");

var url = "https://services1.arcgis.com/C4QnL6lJusCeBpYO/arcgis/rest/services/PruebaPuntos/FeatureServer/0/addFeatures/";

    var newFeature = {
        "attributes" : {
          "sender_id" : 23,
          "cause" : "lalalong",
          "damages" : "skrr",
          "lat" : 33,
          "longitud" : 36
        },
        "geometry" : {
          "x" : -122.41247978999991,
          "y" : 37.770630098000083
        }
      };

 

  var features = [];

  features.push(newFeature);

   

     var featuresString = JSON.stringify(features);
     data = "f=json&features="+featuresString;


     var config={

        headers : {

          'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'

      }};



$http.post(url, data, config)

.then(

function(response){

console.log(response);

},

function(response){

console.log(response);

}

);
*/
/*var https = require('https');


jsonObject = JSON.stringify([{
    "attributes" : {
      "sender_id" : 23,
      "cause" : "lalalong",
      "damages" : "skrr",
      "lat" : 33,
      "longitud" : 36
    },
    "geometry" : {
      "x" : -122.41247978999991,
      "y" : 37.770630098000083
    }
  }])
 
// prepare the header
var postheaders = {
    'Content-Type' : 'application/json'
  //  'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
};
 
// the post options
var optionspost = {
    host : 'https://services1.arcgis.com/C4QnL6lJusCeBpYO/arcgis/rest/services/PruebaPuntos/FeatureServer/0/addFeatures?f=JSON&features=' + jsonObject,
    //port : 443,
 //   path : '/addFeatures',
  // body : jsonObject,
    method : 'POST',
    headers : postheaders
};
 
console.info('Options prepared:');
console.info(optionspost);
console.info('Do the POST call');
 
// do the POST call
var reqPost = https.request(optionspost, function(res) {
    console.log("statusCode: ", res.statusCode);
    // uncomment it for header details
//  console.log("headers: ", res.headers);
 
    res.on('data', function(d) {
        console.info('POST result:\n');
        process.stdout.write(d);
        console.info('\n\nPOST completed');
    });
});
 
// write the json data
//reqPost.write(jsonObject);
reqPost.end();
reqPost.on('error', function(e) {
    console.error(e);
});
*/

//---------------------------
/*
var https = require('https');
const response = await HTMLOptGroupElement(options);

function httpGet(options){
    return new Promise(((resolve, reject)=> {
        var https = require('http');
      const request = https.request(options, (response)=>{
      response.setEncoding('utf8');
      let returnData = '';
      if(response.statusCode<200 || response.statusCode==200){
          return reject(new Error('${response.statusCode}:'+ response.statusCode))
      }
      response.on('data', (chunk) => {
          returnData += chunk;
      });
      response.on('end', () => {
          resolve(JSON.parse(returnData));
      });
      response.on('eror', (error) => {
          reject(error);
      });
    });
    console.log()
    request.end();
    }));
}

jsonObject = JSON.stringify({
    "attributes" : {
      "sender_id" : 23,
      "cause" : "lalalong",
      "damages" : "skrr",
      "lat" : 33,
      "longitud" : 36
    },
    "geometry" : {
      "x" : -122.41247978999991,
      "y" : 37.770630098000083
    }
  });
  httpGet(jsonObject);

  */
/*
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

jsonObject = JSON.stringify([{
"attributes" : {
  "sender_id" : 23,
  "cause" : "lalalong",
  "damages" : "https://scontent.xx.fbcdn.net/v/t1.15752-9/69231118_507861743377147_7014946539546083328_n.jpg?_nc_cat=109&_nc_oc=AQkNvASlHO9Zbs2xyAbr6nNbomaYwQN0Xt9_560Aa4NSMgnqewB1UFO-kg6pfheCS4V1t_aOL4uod2Zrp9gSsCfO&_nc_ad=z-m&_nc_cid=0&_nc_zor=9&_nc_ht=scontent.xx&oh=31bb71b5e58219877b7051ae1d441acc&oe=5DCE2D04",
  "lat" : 33,
  "longitud" : 36
},
"geometry" : {
  "x" : 0,
  "y" : 0
}
}])

const Http = new XMLHttpRequest();
const url='https://services1.arcgis.com/C4QnL6lJusCeBpYO/arcgis/rest/services/PruebaPuntos/FeatureServer/0/addFeatures?f=JSON&features=' + jsonObject;
Http.open("POST", url);
Http.send();

Http.onreadystatechange = (e) => {
console.log(Http.responseText)
}
*/

const request = require('request');


let request_body;


request_body = {
  "persistent_menu": [
    {
      "locale": "default",
      "composer_input_disabled": false,
      "call_to_actions": [
        {
          "type": "postback",
          "title": "Volver al paso anterior",
          "payload": "stepback"
        },
        {
          "type": "postback",
          "title": "Comenzar de nuevo",
          "payload": "restart"
        },
        {
          "type": "web_url",
          "title": "Comparte nuestro trabajo",
          "url": "https://www.facebook.com/sharer/sharer.php?u=https%3A//www.facebook.com/Monitoreo-RRSS-Bot-110194503665276/",
          "webview_height_ratio": "compact"
        }]
    }]
}

var access_token = "EAAFrsb5cwRoBAORZAREANRBqCmj2RC1ooy3l8Nu3hinzIaHnZCIBNxV8wg2GORnEIbLoLwIztQJ5tBMznE2kAbjzJLSSLTms8cN7DrzJ7i2PXENqvAf39vXioOlNbWVHsRmlSQou9skixZAD2O6vTNUKjlIpmJaRPqRsrPr0wZDZD";

request({
  "uri": "https://graph.facebook.com/v4.0/me/messenger_profile",
  "qs": { "access_token": access_token},
  "method": "POST",
  "json": request_body
}, (err, res, body) => {
  if (err) {
    console.log('error sending' + err);
  } else {
    console.log("Message sent");
    console.log(res);
    console.log(body);


  }
})
