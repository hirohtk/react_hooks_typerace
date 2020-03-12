const path = require("path");
const router = require("express").Router();
const db = require("../model/index");

const axios = require("axios");
const cheerio = require("cheerio");

router.get("/scrape", function (req, res) {

  axios.get("http://www.famousquotesandauthors.com/topics/sea_quotes.html").then((response) => {

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
  db.Quotes.findOne({ quote: req.params.quote }).populate("scores")
    .then(response => {
      if (response != undefined) {

        console.log(response)
        // 1.  get all scores into objects that contain the name and score
        let unsortedObjects = []
        for (let i = 0; i < response.scores.length; i++) {
          unsortedObjects.push(
            {
              name: response.scores[i].name,
              score: response.scores[i].score,
            })
        };

        // 2. take the score from each of the objects above (i.e. create new array with .map), and sort them lowest to highest
        // this will NOT keep the index (it does after .map, but not after .sort)

        let sortedScores = (unsortedObjects.map((each) => each.score)).sort((a, b) => { return a - b });

        let sortedObjects = []

        for (let j = 0; j < unsortedObjects.length; j++) {
          // 3. 
          // find index of the score in the unsortedObject that equals the first index of the sortedScores (I have it going lowest to highest)
          let index = unsortedObjects.findIndex((eeeach) => { return eeeach.score === sortedScores[j] })
          // 4.
          // this index (of the unsorted Objects) is the lowest score, so push this onto the sortedObject array as the first index, too.
          // duplicate scores (which in this application are rare anyway) shouldn't matter as the name can be attributed to either score 
          sortedObjects.push(unsortedObjects[index])
        }
        res.json(sortedObjects);
      }
      else {
        // needed to send this back as an array so that the array.map function to display scores still works on
        // (essentially giving an array with no scores)
        res.json(["no scores yet on this quote!"])
      }

    })
    .catch(err => res.json(err));
});

router.post("/api/quote", (req, res) => {

  console.log(`req.body is ${req.body}`)

  let poster = (quoteId) => {
    let obj = {
      quote: quoteId,
      name: req.body.name,
      score: req.body.score,
    }
    // creating a score exactly as schema is setup.  association is handled by passing in the quoteId of the quote field
    db.Scores.create(obj).then((response) => {
      // when working with associations, any value for association must be entered as the associated document's ID, nothing else. 
      // mongo seems to take care of the rest (in terms of bringing up the details of the document itself) 
      console.log(response._id);
      db.Quotes.findByIdAndUpdate(quoteId, { $push: { scores: response._id } }).then(response => res.json(response))
    })
  }

  db.Quotes.findOne({ quote: req.body.quote }).then(response => {
    // if there already exists this quote in the db, post your score
    if (response != null) {
      console.log("FOUND QUOTE")
      console.log(`quote id is ${response._id}.  I'm looking for object ID of this quote`)
      poster(response._id);
    }
    // but if no quote is found, then create the quote, then post your score 
    else {
      console.log("COULD NOT FIND QUOTE")
      db.Quotes.create({ quote: req.body.quote }).then((response) => {
        console.log(`quote id is ${response._id}.  I'm looking for object ID of this quote`)
        poster(response._id);
      })
    }
  }).catch(err => res.json(err))
});

// If no API routes are hit, send the React app

router.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

module.exports = router;
