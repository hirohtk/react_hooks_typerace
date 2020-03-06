const path = require("path");
const router = require("express").Router();
const db = require("../model/index");

const axios = require("axios");
const cheerio = require("cheerio");

router.get("/", function (req, res) {
    
    axios.get("http://www.famousquotesandauthors.com/topics/inspirational_quotes.html").then(function (response) {

        let $ = cheerio.load(response.data);
    
        let quoteArray = [];
    
        // THIS IS ESSENTAILLY A FOR LOOP, making a new result object for every headline
        $("div[style~='font-size:12px;font-family:Arial;']").each(function (i, element) {

        console.log(element);
    
          let quote = $(element).text();
    
          quoteArray.push(quote);
        });
      });

});

// If no API routes are hit, send the React app

router.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "../../client/public/index.html"));
  });

module.exports = router;
