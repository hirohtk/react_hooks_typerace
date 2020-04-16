import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import ReactDOM from 'react-dom'
import Modal from "react-responsive-modal"
import "./game.css"
import Timer from "react-compound-timer"
import Nav from './nav'
import UserStats from "./userstats"


// Import react-circular-progressbar module and styles
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { json } from 'body-parser';

const Game = () => {

  // hook that sets "" as the initial value for both userText, setUserText

  // HOOKS USE DESTRUCTURING HERE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  // ALWAYS TWO VALUES HERE... INDEX 0 REPRESENTS THE VALUE (i.e. key/value)
  // INDEX 1 REPRESENTS A FUNCTION TO UPDATE INDEX 0 (i.e. this.setState())
  // AKA... userText = this.state.userText & setUserText = this.setState({userText: "..."})  

  // Note to self:  the 0th index can be an array (which you can use to map)

  // FOR FIRING USEEFFECTS THAT SHOULD NOT FIRE ON THE FIRST RENDER
  const firstMount = useRef(true);
  const [prevQuote, setprevQuote] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [selection, setSelection] = useState([]);
  const [replay, setReplay] = useState(false)
  const [userText, setUserText] = useState("");
  const [pubUserName, setPublicUserName] = useState("");
  const [modal, setModal] = useState(false);
  const [scores, setScores] = useState([]);
  const [checker, setChecker] = useState([]);
  const [firstRender, setFirstRender] = useState(true);
  const INITIAL_GAME_STATE = { victory: false, startTime: null, endTime: null };
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [loggingIn, setLoggingIn] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState([]);
  const [userPassword, setUserPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats, setStats] = useState([]);
  const [prevStats, setPrevStats] = useState([]);
  const [progress, setProgress] = useState(0);

  const updateUserText = event => {
    if (gameState.startTime === null) {
      setGameState({ ...gameState, startTime: new Date().getTime(), timer: true })
    }
    setUserText(event.target.value);
    setChecker(checkBot(event.target.value, selection[0]));
    // console.log(`event.target.value is ${event.target.value} and its length is ${event.target.value.length}`)
    // console.log(`selection[0] is ${selection[0]} and its length is ${selection[0].length}`)
    let howFarAlong = Math.floor((event.target.value.length / selection[0].length) * 100);

    setProgress(howFarAlong);
    // need to do this with event.target.value, not userText
    if (event.target.value === selection[0].trim()) {
      let finishTime = new Date().getTime();
      let totalTime = finishTime - gameState.startTime;
      setGameState({ ...gameState, victory: true, endTime: finishTime, totalTime: totalTime, timer: false })
      setUserText("");
      if (loggedIn === true) {
        // console.log('youre logged in, adding score automatically')
        // ASYNC WAS MESSING THIS UP- I'D CALL addScore BEFORE GameState COULD BE UPDATED.  THUS, SCORE WASN'T PRESENT
        addScore(totalTime);
      }
      else {
        // THIS WAS FINE BECAUSE IT TOOK LONG ENOUGH TO INPUT NAME FOR GAMESTATE TO HAVE SCORE
        onOpenModal();
      }
    }
  }

  const updateUserName = event => {
    setPublicUserName(event.target.value);
  }

  const setup = () => {
    // randomize the index of the quotes array to select a quote (always excluding previous quote that user just had)
    let randomQuote;
    let randomQuoteId;
    if (prevQuote === "") {
      let randNum = Math.floor(Math.random() * quotes.length);
      randomQuote = quotes[randNum].quote;
      randomQuoteId = quotes[randNum]._id;
    }
    else {
      // whatever prevQuote is, splice it out of the quotes array
      // splicing directly removes quotes from quote (which is a stateful variable)
      // so setting a new variable each time this fires, so the quotes array doesn't run out of quotes
      // ALSO FINDING THAT you can't just set a new varaible equal to a state variable, or else state changes
      let tempQuotes = [];
      for (let i = 0; i < quotes.length; i++) {
        tempQuotes.push({ quote: quotes[i].quote, _id: quotes[i]._id });
      }
      tempQuotes.splice(tempQuotes.indexOf(prevQuote), 1);
      let randNum = Math.floor(Math.random() * tempQuotes.length);
      randomQuote = tempQuotes[randNum].quote;
      randomQuoteId = tempQuotes[randNum]._id;
    }
    // console.log(`*** The quote that you're typing is ${randomQuote}`);
    // console.log(`*** its ID is ${randomQuoteId}`);
    setSelection([randomQuote, randomQuoteId]);
    setprevQuote(randomQuoteId);
    setGameState({ ...gameState, readyMessage: "Clock starts when you start typing...", prepared: true })

    setReplay(false);
    getScores(randomQuoteId);
  }

  const reset = () => {
    // Having so many async state setting may be a problem... need to refer back to this at some point.
    // I think the only time this may be okay is if all of these run, and only the one that matters for doing an async operation
    // to move onto the next stage can be put in a useEffect
    setGameState({ ...gameState, victory: false, startTime: null, endTime: null, prepared: false, readyMessage: "" });
    setUserText("");
    setPublicUserName("");
    setChecker("");
    setReplay(true);
    localStorage.clear();
  }

  const getScores = currentQuote => {
    // console.log(`grabbing scores on ${currentQuote}`);
    axios.get(`/api/quote/${currentQuote}`).then((response) => {
      // console.log(`response from quering current quote scores is ${JSON.stringify(response.data)}`)
      setScores(response.data);
      if (loggedIn === true) {
        getStats(currentUser[1]);
      }
    })
  }

  const getStats = (id) => {
    // console.log(`current user id is ${id}`)
    axios.get(`/api/user/${id}`).then((response) => {
      // console.log(`getting stats, response.data is ${response.data}`);
      setStats(response.data);
      let indexThatChanged;
      let arrEquals = (arr1, arr2) => {
        // first of all, arrays should be same length
        if (arr1.length != arr2.length) {
          indexThatChanged = arr2.length;
          return false;
        }
        // then, check each array object's key values for equality
        else {
          for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].quote != arr2[i].quote || arr1[i].score != arr2[i].score) {
              indexThatChanged = i;
              console.log(`FOUND DISCREPANCY, AND INDEX THAT DOES NOT MATCH IS ${indexThatChanged}`)
              return false;
            }
            else {
              console.log("No mismatch, going onto next iteration");
            }
          }
        }
        return true;
      }

      if (prevStats.length === 0) {
        console.log("setting previous stats");
        setPrevStats(response.data);
      }
      else if (arrEquals(prevStats, response.data) === false) {
        console.log("prevStats is " + JSON.stringify(prevStats))
        console.log("response.data is " + JSON.stringify(response.data))
        console.log(`there is a difference between previous stats, and response in position ${indexThatChanged}`)
        setPrevStats(response.data);
        let newObjArr = [];
        for (let j = 0; j < response.data.length; j++) {
          let newObj = {
            quote: response.data[j].quote,
            score: response.data[j].score,
          }
          if (j === indexThatChanged) {
            console.log(`WE HAVE A DIRECT MATCH.  j is ${j} and indexthatchanged is ${indexThatChanged} \n ***************`)
            newObj.changed = true;
          }
          else {
            console.log(`no direct match.  j is ${j} and indexthatchanged is ${indexThatChanged} \n ***************`)
            newObj.changed = false;
          }
          newObjArr.push(newObj);
        }
        console.log(`here's the newobj array ${JSON.stringify(newObjArr)} \n ***************`)
        setStats(newObjArr);
      }
      else {
        console.log("no change in stats")
      }
    })
  }

  const checkBot = (attempt, prompt) => {
    let arr = [];
    // ***THIS ENTIRE FOR LOOP RUNS EVERY SINGLE TIME A NEW LETTER IS INPUT
    for (let i = 0; i < attempt.length; i++) {
      if (attempt[i] === prompt[i]) {
        arr.push(attempt[i]);
      }
      else {
        arr.push("_");
      }
    }
    // ONCE DONE, RETURNS A *BRAND NEW* ARRAY EACH TIME SHOWING MISTAKES OR CORRECT CHARACTERS.
    return arr;
  }

  const addScore = (localScore) => {
    let obj = {
      quote: selection[1],
      score: localScore,
    }
    // console.log(`*** adding score, the quote is ${selection[0]}`)
    // console.log(`*** adding score, the quoteId is ${selection[1]}`)
    if (loggedIn === true) {
      obj.name = currentUser[0];
      obj.id = currentUser[1];
      obj.loggedIn = true;
      // console.log("LOGGED IN")
    }
    else {
      obj.name = pubUserName;
      // console.log("NOT LOGGED IN")
    }
    // console.log(`obj sent to backend is ${JSON.stringify(obj)}`);
    axios.post("/api/quote", obj).then((response) => {
      // console.log(`the response I'm getting from posting a score is ${JSON.stringify(response.data)}`);
      onCloseModal();
      localStorage.setItem("currentName", obj.name);
      localStorage.setItem("currentScore", obj.score);
      getScores(selection[1]);
    });

  }

  const promptLogin = () => {
    setLoggingIn(true);
    onOpenModal();
  }

  const promptRegister = () => {
    setLoggingIn(false);
    setRegistering(true);
    onOpenModal();
  }

  const logOut = () => {
    setLoggedIn(false);
    setCurrentUser([]);
    setStats([]);
    setPrevStats([]);
  }

  const loginRegisterGate = (event) => {
    if (event.target.name === "username") {
      setUserName(event.target.value);
    }
    else {
      setUserPassword(event.target.value);
    }
  }

  const notify = (condition, message) => {
    if (condition === "success") {
      toast.success(message);
    }
    else if (condition === "failure") {
      toast.error(message);
    }
  }
    ;

  const doLogOrReg = () => {
    let credentials = {
      username: userName,
      password: userPassword
    }
    //login
    if (loggingIn === true) {
      axios.post("/api/login", credentials).then((response, err) => {
        // console.log(response.data);
        if (err) {
        }
        else if (response.data === "Failure") {
          notify("failure", `Error: Username and/or Password incorrect.`);
        }
        else {
          setCurrentUser([response.data.username, response.data.id]);
          onCloseModal();
          setLoggingIn(false);
          setLoggedIn(true);
          setUserName("");
          setUserPassword("");
          getStats(response.data.id);
          notify("success", `${response.data.username} is now logged in!`);
          // GRAB USER DETAILS -- response.data is the username
        }
      });
    }
    //register
    else if (registering === true) {
      axios.post("/api/register", credentials).then((response, err) => {
        // console.log(response.data);
        if (err) {
          notify("failure", `Registration Failed!`);
        }
        else {
          onCloseModal();
          setRegistering(false);
          setUserName("");
          setUserPassword("");
          notify("success", `${credentials.username} is now registered!`);
          // GRAB USER DETAILS -- response.data is the username
        }
      });
    }
  }

  const onOpenModal = () => {
    setModal(true);
  }

  const onCloseModal = () => {
    setModal(false);
  }

  const antiCheat = a => {
    a.onpaste = e => {
      e.preventDefault();
      return false;
    };
  }

  const startGame = () => {
    setFirstRender(false);
    setup();
  }

  // THIS IS HOW YOU DO ASYNCHRONOUS THINGS- useEffect fires at the refresh of component
  // BY HAVING [], THIS MIMICS componentDidMount, meaning it will only fire once
  useEffect(() => {
    // check if db is empty- if so then scrape
    localStorage.clear();
    axios.get("/api/checkforquote").then(response => {
      if (response.data.length === 0) {
        // console.log("IF STATEMENT FIRING")
        axios.get("/scrape").then((response) => {
          setQuotes(response.data);
        }
        );
      }
      else {
        // console.log("ELSE STATEMENT FIRING")
        setQuotes(response.data);
      }
    })
  }, [])

  useEffect(() => {
    // CONDITIONAL AND firstMount USEREF prevent this effect from firing on initial render
    if (firstMount.current === true) {
      console.log(`not doing anything`)
      firstMount.current = false;
      return;
    }
    // if either quotes or replay state changes, then setup().  re-using this effect for initial game setup and also for resetting the game
    if (replay) {
      console.log("**replay has changed, setting up**")
      setup();
    }
  }, [replay])

  useEffect(() => {
    if (firstMount.current === true) {
      console.log(`not doing anything`)
      firstMount.current = false;
      return;
    }
    if (gameState.prepared) {
      let pasteBox = document.getElementById("textbox");
      antiCheat(pasteBox);
    }
  }, [gameState.prepared])

  return (
    <div>
      <Nav promptLogin={promptLogin} loggedIn={loggedIn} logOut={logOut} promptRegister={promptRegister} currentUser={currentUser[0]}></Nav>
      <div className="container fluid">
        {gameState.readyMessage}
        <br></br><br></br>
        <div className="card">
          <div className="card-body">
            <blockquote className="blockquote mb-0">
              <p>Your quote to type is:<br></br><span id="quote">{selection[0]}<br></br></span></p>
              {/* <footer className=""><cite title="Source Title">{selection[1]}</cite></footer> */}
            </blockquote>
          </div>
        </div>

        <br></br>

        {gameState.prepared === true && gameState.victory === false ?
          <div>
            <input id="textbox" class="blockquote mb-0"
              value={userText} onChange={updateUserText} autoComplete="off" size={selection[0].length - 10} maxLength={selection[0].length}>
            </input>
            <br></br>
            {gameState.timer === true ?
              <div>
                <Timer
                  startImmediately={false}>
                  {({ start, resume, pause, stop, reset, timerState }) => (
                    <React.Fragment>
                      <Timer.Seconds /> seconds have elapsed!
                {start()}
                    </React.Fragment>
                  )}
                </Timer>
                {/*  if you have two characters, the array will render two each's, and so forth */}
                <p style={{ position: "relative", left: "2px" }}>{checker.map((each) => each.includes("_") ? <span className="err">{each}</span> : <span className="correct">{each}</span>)}</p>
                {/* <CircularProgressbar value={progress} text={`${progress}%`}/> */}
              </div>
              : <div style={{ height: "3.6rem" }}></div>}
          </div>
          : null}
        <br></br>

        {firstRender === true ? <button onClick={() => startGame()}>Start!</button>
          :
          gameState.startTime === null ? <button onClick={() => setup()}>Get another random quote to use.</button> : ""}
        <br></br>

        {gameState.victory === true ? <div><h1>Game finished in {gameState.totalTime} milliseconds</h1><br></br>
          <button onClick={() => reset()}>Play again?</button></div> : ""}
        <Modal open={modal} onClose={onCloseModal} center>
          {loggingIn === true ?
            <div>
              <h1>Login</h1>
              <input placeholder="Username" name="username" value={userName} maxLength="16" onChange={loginRegisterGate}></input>
              <input placeholder="Password" name="password" type="password" value={userPassword} maxLength="16" onChange={loginRegisterGate}></input>
              <button onClick={doLogOrReg}>Submit</button>
            </div>
            : registering === true ?
              <div>
                <h1>User Registration</h1>
                <input placeholder="Username" name="username" value={userName} maxLength="16" onChange={loginRegisterGate}></input>
                <input placeholder="Password" name="password" type="password" value={userPassword} maxLength="16" onChange={loginRegisterGate}></input>
                <button onClick={doLogOrReg}>Submit</button>
              </div>
              :
              <div>
                Game finished in {gameState.totalTime} milliseconds. <br></br>
                Please enter your name: <input id="nameField" placeholder="Name Here" value={pubUserName} maxLength="16" onChange={updateUserName}></input>
                <button onClick={() => addScore(gameState.totalTime)}>Submit</button>
              </div>}
        </Modal>

        {(firstRender === true) ? "" :
          <h2 className="centerAlign">High scores on this quote:</h2>
        }
        {
          (firstRender === false && scores.name === "No Scores yet on this quote!") ?
            <h2 className="centerAlign">No Scores yet on this quote</h2> :
            ((firstRender === false) ?
              <table >
                <tbody>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score (milliseconds)</th>
                  </tr>
                  {scores.map((each, index) =>
                    each.name === localStorage.currentName && each.score === localStorage.currentScore ?
                      <tr key={index}><td className="gold">{index + 1}</td><td className="gold">{each.name}</td> <td className="gold">{each.score}</td></tr>
                      :
                      <tr key={index}><td>{index + 1}</td><td>{each.name}</td><td>{each.score}</td></tr>
                  )}
                </tbody>
              </table>
              :
              "")
        }
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover={false}></ToastContainer>
        <UserStats firstRender={firstRender} history={stats} loggedIn={loggedIn}>

        </UserStats>
        {/* 

      DON'T USE this HERE- App IS A FUNCTION, AND this DEFAULTS TO WINDOW

      <input value={this.userText} onChange={this.updateUserText}></input> 
      
      One main advantage of using hooks is that it does NOT use this, whether 
      called in props or inside the function itself
      
      */}
      </div>
    </div>
  )
}

export default Game;