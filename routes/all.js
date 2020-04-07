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

// As of 4/6/2020 this route is used solely for scraping articles and getting them into the db (basically an exercise
// for scraping, as it would have been easier to just manually seed.  However this can extend usefulness to doing daily scrapes from CNN)
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
        //also need to replace different apostrophe
        let numRemoved = arr[j].slice(3).trim().replace("’", "'").replace("–", "-")
        newArr.push(numRemoved);
      }
      return newArr;
    }
    let func2 = (arr) => {
      let arrForInsertMany = [];
      for (let k = 0; k < arr.length; k++) {
        arrForInsertMany.push({quote: arr[k]})
      }
      return arrForInsertMany;
    }
    db.Quotes.insertMany(func2(func1(quoteArray)), (error, docs) => {
      if (error) {
        console.log(error);
        return error;
      }
      res.json(docs);
    });
  });
});

// Model.find().populate({
//   path: 'friends author'        // either single path or multiple space delimited paths
// , select: 'name age'            // optional
// , model: 'ModelName'            // optional
// , match: { age: { $gte: 18 }}   // optional
// , options: { sort: { age: -1 }} // optional
// })

router.get("/api/user/:id", (req, res) => {
  db.Users.findById(req.params.id).populate({path: "scores quote"}).then(response => {
    // console.log(`well response is ${response}`);
    res.json(response);
  });
})

// router.get("/api/user/:id", (req, res) => {
//   db.Users.findById(req.params.id).populate("scores").populate("quote").then(response => {
//     console.log(`well response is ${response}`);
//     res.json(response);
//   });
// })

router.get("/api/quote/:quote", (req, res) => {
  console.log(`gotta add the question mark to this ${req.params.quote}`)
  db.Quotes.findById(req.params.quote).populate("scores")
    .then(response => {
      console.log(`response that is not popping up is ${response}`)
      if (response != undefined) {

        console.log(`response from quote route after populating scores is ${response}`)
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

  console.log(`req.body is ${JSON.stringify(req.body)}`)

    let obj = {
      quote: req.body.quote,
      name: req.body.name,
      score: req.body.score,
    }
    // creating a score exactly as schema is setup.  association is handled by passing in the quoteId of the quote field
    db.Scores.create(obj).then((response) => {
      // when working with associations, any value for association must be entered as the associated document's ID, nothing else. 
      // mongo seems to take care of the rest (in terms of bringing up the details of the document itself) 
      let scoreID = response._id
      console.log("score posting successful")
      db.Quotes.findByIdAndUpdate(quoteId, { $push: { scores: scoreID } }).then((response) => {
        console.log(`quote is ${quoteId}`);
        if (req.body.loggedIn === true) {
          // both scoreID and quoteiD are just references
          obj.id = req.body.id;
          db.Users.findByIdAndUpdate(obj.id, { $push: { history: {quote: quoteId, score: scoreID} }}).then(
            response => {
              res.json(response)
            }
          )

          // db.Users.findByIdAndUpdate(obj.id, { $push: { history: {quote: quoteId, score: scoreID} }}).then(
          //   response => {
          //     console.log(`posted to user.  response is ${response}`);
          //     res.json(response)
          //   }
          // )

          // let testobj = {
          //   both: {
          //     quote: quoteId,
          //     score: scoreID
          //   }
          // }
          // db.Users.findByIdAndUpdate(obj.id, { $push: {history: testobj } }).then(
          //   response => {
          //     console.log(`posted to user.  response is ${response}`);
          //     res.json(response)
          //   }
          // )

        }
        else {
          console.log("NOT LOGGED IN")
          console.log(`does this response contain quoteId somewhere? ${response}`);
          res.json(response);
        }
      }
      )
    })
});

router.post("/api/login", (req, res, next) => {
  /* PASSPORT LOCAL AUTHENTICATION */
  console.log(`trying to login`)
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    // authentication failure:
    if (!user) {
      console.log("failure")
      return res.json("Failure")
      // return res.redirect('/login?info=' + info);
    }
    // authentication success:
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      console.log("success!")
      return res.json({username: user.username, id: user._id})
      // return res.redirect('/');
    });

  })(req, res, next);
});

router.post("/api/register", function (req, res) {
  db.Users.register({ username: req.body.username }, req.body.password, (err) => {
    if (err) {
      console.log("error", err);
    }
    console.log(`creating a new user, name is ${req.body.username}, password is ${req.body.password}`)
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
