var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ScoreSchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: false
    },

    score: {
        type: String,
        required: true,
    }

});


var Scores = mongoose.model("Scores", ScoreSchema);

module.exports = Scores;