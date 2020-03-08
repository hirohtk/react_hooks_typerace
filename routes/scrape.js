const path = require("path");
const router = require("express").Router();
// const db = require("../model/index");

const axios = require("axios");
const cheerio = require("cheerio");

router.get("/scrape", function (req, res) {

    axios.get("http://www.famousquotesandauthors.com/topics/sea_quotes.html").then(function (response) {

      let quoteArray = [];

        let $ = cheerio.load(response.data);

        // THIS IS ESSENTAILLY A FOR LOOP, making a new result object for every headline
        $("div[style~='font-size:12px;font-family:Arial;']").each(function (i, element) {

          let quote = {
            quote: $(element).text(),
            author: $(element).next().text()
          }
          
          quoteArray.push(quote);
        });

        res.json(quoteArray);
      });

});

// If no API routes are hit, send the React app

router.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "../client/public/index.html"));
  });

module.exports = router;
