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
  },

  history: [{
    quote: {
      type: Schema.Types.ObjectId,
      ref: "Quotes",
    },
    score: {
      type: Schema.Types.ObjectId,
      ref: "Scores",
    }
  }],


  // history: [
  //   {
  //     both: {
  //       quote: {
  //         type: Schema.Types.ObjectId,
  //         ref: "Quotes",
  //       },
  //       score: { 
  //         type: Schema.Types.ObjectId,
  //         ref: "Scores",
  //       }
  //     }
  //   }
  // ],

});

// THIS IS WHAT CREATES LOCAL STRATEGY 
UserSchema.plugin(passportLocalMongoose);
// THIS IS WHAT CREATES LOCAL STRATEGY 

var Users = mongoose.model("Users", UserSchema);

// exporting it with local strategy
module.exports = Users;