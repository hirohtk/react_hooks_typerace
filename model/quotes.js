var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var QuoteSchema = new Schema({

    quote: {
        type: String,
        required: true,
    },

    scores: [{
        type: Schema.Types.ObjectId,
        ref: "Scores",
        required: false,
    }]

});


// This creates our model from the above schema, using mongoose's model method
//  this article is a Collection called "Users", defined by UsersSchema
var Quotes = mongoose.model("Quotes", QuoteSchema);

module.exports = Quotes;