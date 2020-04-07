const mongoose = require("mongoose");
const express = require("express");
const app = express();
const routes = require("./routes/all");
const PORT = process.env.PORT || 3001;
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// AUTH stuff
// DIRECTLY BELOW NOT NEEDED (this is from tutorial.  express.urlencoded works with Express v4.16+)
// const bodyParser = require('body-parser');
// Tutorial :https://www.sitepoint.com/local-authentication-using-passport-node-js/
const expressSession = require('express-session')({
  secret: 'these unprecedented times',
  resave: false,
  saveUninitialized: false
});


// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/typequote4";
mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  console.log("Connected to MongoDB!")
);

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSession);
/*  PASSPORT SETUP  */

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Start the server
app.listen(PORT, function() {
  console.log(`🌎  ==> Server now listening on PORT ${PORT}!`);
});
