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

 var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

 jsonObject = JSON.stringify([{
  "attributes" : {
    "sender_id" : 23,
    "cause" : "lalalong",
    "damages" : "skrr",
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