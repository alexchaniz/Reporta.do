var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Http = new XMLHttpRequest();

var apiKey = "AIzaSyB9Soo0S1gk2QTcexPqwoIhQKZOfNAxRvE";

var address = "Calle borja, Madrid"

var url = "https://maps.googleapis.com/maps/api/geocode/json?key="+apiKey+"&address="+address;


  console.log(url);

  Http.open("POST", url);
  try {
    Http.send();
  } catch (error) {
    console.log("Error in the sending to arcgis");
    console.log(error);
  }

  Http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        console.log(typeof myArr );
        console.log(myArr.results[0].geometry.location);
        
        }
    };
    
  