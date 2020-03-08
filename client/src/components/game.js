import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import "./game.css"

const Game = () => {

  // hook that sets "" as the initial value for both userText, setUserText

  // HOOKS USE DESTRUCTURING HERE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  // ALWAYS TWO VALUES HERE... INDEX 0 REPRESENTS THE VALUE (i.e. key/value)
  // INDEX 1 REPRESENTS A FUNCTION TO UPDATE INDEX 0 (i.e. this.setState())
  // AKA... userText = this.state.userText & setUserText = this.setState({userText: "..."})  

  // Note to self:  the 0th index can be an array (which you can use to map)

  const SNIPPETS = [
  ];

  // FOR FIRING USEEFFECTS THAT SHOULD NOT FIRE ON THE FIRST RENDER
  const firstMount = useRef(true);

  const [quotes, setQuotes] = useState([]);

  const [selection, setSelection] = useState([]);

  const [snippet, setSnippet] = useState("");

  const [userText, setUserText] = useState("");

  const INITIAL_GAME_STATE = { victory: false, startTime: null, endTime: null };

  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);

  const updateUserText = event => {
    if (gameState.startTime === null) {
      setGameState({ ...gameState, startTime: new Date().getTime() })
    }
    setUserText(event.target.value);
    // need to do this with event.target.value, not userText
    if (event.target.value === selection[0].trim()) {
      let finishTime = new Date().getTime();
      let totalTime = finishTime - gameState.startTime;
      setGameState({ ...gameState, victory: true, endTime: finishTime, totalTime: totalTime })
      console.log(`it took you ${totalTime} to win this game`)
    }
  }

  const ready = () => {
    setGameState({ ...gameState, readyMessage: "Clock starts when you start typing...", prepared: true })
  };

  // THIS IS HOW YOU DO ASYNCHRONOUS THINGS- useEffect fires at the refresh of component
  // BY HAVING [], THIS MIMICS componentDidMount, meaning it will only fire once
  useEffect(() => {
    axios.get("/scrape").then((response) => setQuotes(response.data)
    )
  }, [])

  useEffect(() => {
    // CONDITIONAL AND firstMount USEREF prevent this effect from firing on initial render
    if (firstMount.current === true) {
      console.log(`not doing anything`)
      firstMount.current = false;
      return;
    }
    if (quotes) {
      // randomize the index of the quotes array to select a quote
      console.log(`this shouldn't fire on initial mount`)
      let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      console.log(randomQuote);
      setSelection([randomQuote.quote, randomQuote.author]);
      ready();
    }
      
  }, [quotes])

  // useEffect(() => {
  //   console.log(`your quote is ${selection}`);
  // }, [selection])

  return (
    <div>
      <h2>Type Race</h2>
      {gameState.readyMessage}
      <br></br><br></br>
      <p>Your quote to type is:<br></br><span id="fadeIn">{selection[0]}<br></br>{selection[1]}</span></p>
      
      {gameState.prepared === true ? <input id="textbox" value={userText} onChange={updateUserText}></input> : null}

      {gameState.victory ? <h1>Game finished in {gameState.totalTime} milliseconds</h1> : ""}

      {/* 

      DON'T USE this HERE- App IS A FUNCTION, AND this DEFAULTS TO WINDOW

      <input value={this.userText} onChange={this.updateUserText}></input> 
      
      One main advantage of using hooks is that it does NOT use this, whether 
      called in props or inside the function itself
      
      */}
    </div>
  )
}

export default Game;