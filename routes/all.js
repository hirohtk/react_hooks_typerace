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
  console.log("get route firing")
  db.Quotes.findOne({quote: req.params.quote}).populate("Scores")
  .then(response => {
    if (response != null) {
      console.log(response)
      // middleware here to sort for high scores
      res.json(response);
    }
    else {
      res.json("no scores yet on this quote!")
    }
      
  })// if there is no quote in the db yet, that means no one has submitted a high score.  db will return an error, I believe
  .catch(err => res.json(err));
});

router.post("/api/quote", (req, res) => {

  let poster = (quoteId) => {
    let obj = {
      quote: quoteId,
      name: req.body.name,
      score: req.body.score,
    }
    db.Scores.create(obj).then((response) => {
      res.json(response);
    })
  }

  db.Quotes.findOne({quote: req.body.quote}).then(response => {
    // if there already exists this quote in the db, post your score
    if (response != null) {
      console.log("FOUND QUOTE")
      console.log(`quote id is ${response._id}.  I'm looking for object ID of this quote`)
      poster(response._id);
    }
    // but if no quote is found, then create the quote, then post your score 
    else {
    console.log("COULD NOT FIND QUOTE")
    db.Quotes.create({quote: req.body.quote}).then((response) => {
    console.log(`quote id is ${response._id}.  I'm looking for object ID of this quote`)
      poster(response._id);})
    }
  }).catch(err => res.json(err))
});

// If no API routes are hit, send the React app

router.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "../client/public/index.html"));
  });

module.exports = router;
