var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UpdateSchema = new Schema({
  sender_psid: {type: String},
  step: {type: Number},
  cause: {type: String},
//  damages: {type: String},
//  date: {type: String},
  date: {type: String},
//  lat: {type: String},
//  long: {type: String},
//  img: { data: Buffer, contentType: String },
});

module.exports = mongoose.model("Update", UpdateSchema);