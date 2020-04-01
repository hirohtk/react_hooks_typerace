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

UserSchema.plugin(passportLocalMongoose);
var Users = mongoose.model("Users", UserSchema);

module.exports = Users;