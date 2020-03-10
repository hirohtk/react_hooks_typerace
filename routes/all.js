const path = require("path");
const router = require("express").Router();
const db = require("../model/index");

const axios = require("axios");
const cheerio = require("cheerio");

router.get("/scrape", function (req, res) {

    axios.get("http://www.famousquotesandauthors.com/topics/sea_quotes.html").then( (response) => {

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

router.get("/api/:quote", (req, res) => {
  db.Quotes.findOne({quote: req.params.quote}).populate("Scores")
  .then(response => {
      console.log(response)
      // middleware here to sort for high scores
      res.json(response);
  })// if there is no quote in the db yet, that means no one has submitted a high score.  db will return an error, I believe
  .catch(err => res.json(err));
});

router.post("/api/:quote", (req, res) => {

  let poster = () => {
    let obj = {
      quote: req.params.quote,
      name: req.body.name,
      score: req.body.score,
    }
    db.Scores.create(obj).then((response) => {
      console.log(response);
      res.json(response);
    })
  }

  // if there already exists this quote in the db, post your score
  db.Quotes.findOne({quote: req.params.quote}).then(() => {
    poster();
  // but if no quote is found, then create the quote, then post your score 
  }).catch(err => {
    db.Quotes.create({quote: req.params.quote}).then(() => {
    poster();
    })
  })
  
});

// If no API routes are hit, send the React app

router.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "../client/public/index.html"));
  });

module.exports = router;
