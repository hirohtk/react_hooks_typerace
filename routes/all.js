const path = require("path");
const router = require("express").Router();
const db = require("../model/index");

const axios = require("axios");
const cheerio = require("cheerio");

const passport = require("passport");

// THIS EITHER NEEDS TO BE HERE OR IN SERVER, WE'LL SEE
passport.use(db.Users.createStrategy());
passport.serializeUser(db.Users.serializeUser());
passport.deserializeUser(db.Users.deserializeUser());
// THIS EITHER NEEDS TO BE HERE OR IN SERVER, WE'LL SEE

// /The connect-ensure-login package is middleware that ensures a user is logged in.
const connectEnsureLogin = require("connect-ensure-login");

// router.get("/scrape", function (req, res) {

//   axios.get("http://www.famousquotesandauthors.com/topics/sea_quotes.html").then((response) => {

//     let quoteArray = [];

//     let $ = cheerio.load(response.data);

//     // THIS IS ESSENTAILLY A FOR LOOP, making a new result object for every headline
//     $("div[style~='font-size:12px;font-family:Arial;']").each(function (i, element) {
//       let quote = {
//         quote: $(element).text(),
//         author: $(element).next().text()
//       }
//       quoteArray.push(quote);
//     });
//     res.json(quoteArray);
//   });
// });

router.get("/scrape", function (req, res) {
  axios.get("https://www.universalclass.com/articles/self-help/keyboarding-practice-sentence-repetition.htm").then((response) => {

    let quoteArray = [];

    let $ = cheerio.load(response.data);

    // THIS IS ESSENTAILLY A FOR LOOP, making a new result object for every headline
    $("span[style*='font-size: 12pt; font-style: normal']").each(function (i, element) {
      let quote = $(element).text();
      quoteArray.push(quote);
    });

    let func1 = (arr) => {
      let newArr = [];
      for (let i = 0; i < arr.length; i++) {
        // .splice CHANGES THE ARRAY BEFORE MOVING ONTO THE NEXT ITERATION 
        arr.splice(i + 1, 1);
      }
      for (let j = 0; j < arr.length; j++) {
        // regex:  replace all numbers with nothing (DOESNT WORK IF THERE ARE NUMBERS IN THE MIDDLE THOUGH)
        // let numRemoved = arr[j].replace(/[0-9]/g, '').slice(1).trim()
        let numRemoved = arr[j].slice(3).trim()
        newArr.push(numRemoved);
      }
      return newArr;
    }

    res.json(func1(quoteArray));
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
        res.json([{ name: "No Scores yet on this quote!", score: "No Scores yet on this quote!" }])
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

router.post("/login", function (req, res) {
  /* PASSPORT LOCAL AUTHENTICATION */
  // exported db.Users-this is the mongoose model

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    // authentication failure:
    if (!user) {
      return res.redirect('/login?info=' + info);
    }
    // authentication success:
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/');
    });

  })(req, res, next);

});

router.get("/register", function (req, res) {
  db.Users.register({ username: '222'}, 'man', (err) => {
    if (err) {
      console.log("error", err);
    }
  });
  res.json("Users created")
});

router.get("/private", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  res.json("Login Success")
});

// If no API routes are hit, send the React app

router.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

module.exports = router;
