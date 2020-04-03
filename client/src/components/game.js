import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import ReactDOM from 'react-dom'
import Modal from "react-responsive-modal"
import "./game.css"
import Timer from "react-compound-timer"
import Nav from './nav'

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
  const [currentUser, setCurrentUser] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const updateUserText = event => {
    if (gameState.startTime === null) {
      setGameState({ ...gameState, startTime: new Date().getTime(), timer: true })
    }
    setUserText(event.target.value);
    setChecker(checkBot(event.target.value, selection[0]));

    // need to do this with event.target.value, not userText
    if (event.target.value === selection[0].trim()) {
      let finishTime = new Date().getTime();
      let totalTime = finishTime - gameState.startTime;
      setGameState({ ...gameState, victory: true, endTime: finishTime, totalTime: totalTime, timer: false })
      setUserText("");
      onOpenModal();
    }
  }

  const updateUserName = event => {
    setPublicUserName(event.target.value);
  }

  const setup = () => {
    // randomize the index of the quotes array to select a quote (always excluding previous quote that user just had)
    let randomQuote;
    if (prevQuote === "") {
      randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    else {
      // whatever prevQuote is, splice it out of the quotes array
      // splicing directly removes quotes from quote (which is a stateful variable)
      // so setting a new variable each time this fires, so the quotes array doesn't run out of quotes
      // ALSO FINDING THAT you can't just set a new varaible equal to a state variable, or else state changes
      let tempQuotes = [];
      for (let i = 0; i < quotes.length; i++) {
        tempQuotes.push(quotes[i]);
      }
      tempQuotes.splice(tempQuotes.indexOf(prevQuote), 1);
      randomQuote = tempQuotes[Math.floor(Math.random() * tempQuotes.length)];
      console.log(`is quotes getting smaller? ${tempQuotes}`)
    }
    console.log(randomQuote);
    // setSelection([randomQuote.quote]);
    setSelection([randomQuote]);
    setprevQuote(randomQuote);
    setGameState({ ...gameState, readyMessage: "Clock starts when you start typing...", prepared: true })

    setReplay(false);
    // getScores(randomQuote.quote);
    getScores(randomQuote);
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
    axios.get(`/api/${currentQuote}`).then((response) => {
      console.log(response)
      setScores(response.data);
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

  const addScore = () => {
    let obj = {
      quote: selection[0],
      name: pubUserName,
      score: gameState.totalTime,
    }
    axios.post("/api/quote", obj).then((response) => {
      console.log(response);
      onCloseModal();
      localStorage.setItem("currentName", obj.name);
      localStorage.setItem("currentScore", obj.score);
      getScores(selection[0]);
    });
  }

  const promptLogin = () => {
    setLoggingIn(true);
    onOpenModal();
  }

  const promptRegister = () => {
    setRegistering(true);
    onOpenModal();
  }

  const logOut = () => {
    setLoggedIn(false);
  }

  const loginRegisterGate = (event) => {
      if (event.target.name === "username") {
        setUserName(event.target.value);
      }
      else {
        setUserPassword(event.target.value);
      }
  }

  const doLogOrReg = () => {
    let credentials = {
      username: userName,
      password: userPassword
    }
    //login
    if (loggingIn === true) {
      axios.post("/api/login", credentials).then((response, err) => {
        console.log(response.data);
        if (err) {
        }
        else if (response.data === "Failure") {
        }
        else {
          onCloseModal();
          setLoggingIn(false);
          setLoggedIn(true);
          setUserName("");
          setCurrentUser(response.data);
          setUserPassword("");
          // GRAB USER DETAILS -- response.data is the username
        }
      });
    }
    //register
    else {
      axios.post("/api/register", credentials).then((response, err) => {
        console.log(response.data);
        if (err) {
        }
        else {
          onCloseModal();
          setRegistering(false);
          setUserName("");
          setUserPassword("");
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

  // THIS IS HOW YOU DO ASYNCHRONOUS THINGS- useEffect fires at the refresh of component
  // BY HAVING [], THIS MIMICS componentDidMount, meaning it will only fire once
  useEffect(() => {
    axios.get("/scrape").then((response) => {
      setQuotes(response.data)
      setFirstRender(false);
    }
    )
  }, [])

  useEffect(() => {
    // CONDITIONAL AND firstMount USEREF prevent this effect from firing on initial render
    if (firstMount.current === true) {
      console.log(`not doing anything`)
      firstMount.current = false;
      return;
    }
    // if either quotes or replay state changes, then setup().  re-using this effect for initial game setup and also for resetting the game
    if (quotes || replay) {
      setup();
    }
  }, [quotes, replay])

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
      <Nav promptLogin={promptLogin} loggedIn={loggedIn} logOut={logOut} promptRegister={promptRegister} currentUser={currentUser}></Nav>
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
            <input id="textbox"
              value={userText} onChange={updateUserText} autoComplete="off" size={selection[0].length} maxLength={selection[0].length}>
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
              </div>
              : ""}
          </div>
          : null}
        <br></br>

        {gameState.startTime === null ? <button onClick={() => setup()}>Get another random quote to use.</button> : ""}
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
            : <div>
            Game finished in gameState.totalTime milliseconds. <br></br>
            Please enter your name: <input id="nameField" placeholder="Name Here" value={pubUserName} maxLength="16" onChange={updateUserName}></input>
            <button onClick={addScore}>Submit</button>
            </div>}
        </Modal>

        <h2 className="centerAlign">High scores on this quote:</h2>
        {
          (firstRender === false && scores.name === "No Scores yet on this quote!") ?
            <h2 className="centerAlign">No Scores yet on this quote</h2> :
            ((firstRender === false) ?
              <table >
                <tbody>
                  <tr>
                    <th>Name</th>
                    <th>Score (milliseconds)</th>
                  </tr>
                  {scores.map((each, index) =>
                    each.name === localStorage.currentName && each.score === localStorage.currentScore ?
                      <tr key={index}><td className="gold">{each.name}</td> <td className="gold">{each.score}</td></tr>
                      :
                      <tr key={index}><td>{each.name}</td><td>{each.score}</td></tr>
                  )}
                </tbody>
              </table>
              :
              "")
        }
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