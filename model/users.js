var mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({

  username: {
      type: String,
      required: true,
      unique: true
    },
  password: {
      type: String,
      required: true,
      unique: true
    }

});

// THIS IS WHAT CREATES LOCAL STRATEGY 
UserSchema.plugin(passportLocalMongoose);
// THIS IS WHAT CREATES LOCAL STRATEGY 

var Users = mongoose.model("Users", UserSchema);

// exporting it with local strategy
module.exports = Users;