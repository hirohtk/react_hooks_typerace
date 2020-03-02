import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const App = () => {

  // hook that sets "" as the initial value for both userText, setUserText

  // HOOKS USE DESTRUCTURING HERE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  // ALWAYS TWO VALUES HERE... INDEX 0 REPRESENTS THE VALUE (i.e. key/value)
  // INDEX 1 REPRESENTS A FUNCTION TO UPDATE INDEX 0 (i.e. this.setState())
  // AKA... userText = this.state.userText & setUserText = this.setState({userText: "..."})  

  // Note to self:  the 0th index can be an array (which you can use to map)

  const SNIPPETS = [
    'Bears, beets, battlestar galactica',
    "What's Forrest Gump's password? 1Forrest1",
    'Where do programmers like to hangout? The Foo Bar'
  ];

  const [snippet, setSnippet] = useState("");

  const [userText, setUserText] = useState("");

  const INITIAL_GAME_STATE = { victory: false, startTime: null, endTime: null};

  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);

  const updateUserText = event => {
    if (gameState.startTime === null) {
      setGameState({...gameState, startTime: new Date().getTime()})
    }
    setUserText(event.target.value);
    console.log(`current userText is ${userText}`);
    console.log(`versus event target value which is ${event.target.value}`);
    console.log(`snippet is ${snippet}`)
    // need to do this with event.target.value, not userText
    if (event.target.value === snippet) {
      let finishTime = new Date().getTime();
      let totalTime = finishTime - gameState.startTime;
      setGameState({...gameState, victory: true, endTime: finishTime, totalTime: totalTime})
      console.log(`it took you ${totalTime} to win this game`)
    }
  }

  const chooseSnippet = snippetIndex => {
    console.log('setSnippet', snippetIndex);
    setSnippet(SNIPPETS[snippetIndex]);
    // Once snippet is chosen, begin the game, which includes everything in the current gamestate,/
    // but now, changing the startTime to now
    setGameState({ ...gameState, readyMessage: "Clock starts when you start typing...", prepared: true})
  };

  // THIS IS HOW YOU DO ASYNCHRONOUS THINGS- useEffect fires at the refresh of component
  useEffect(() => {
    console.log(`useEffect fired.  gameState with new Time is now ${gameState.startTime}`);
  }, [gameState.prepared])

  return (
    <div>
      <h2>Type Race</h2>
      {gameState.readyMessage}
      <br></br><br></br>
      {snippet}
      {gameState.prepared === true ? <input id="textbox" value={userText} onChange={updateUserText}></input> : null}

      {SNIPPETS.map((each, index) => (
        // NEED callback to call chooseSnippet
        <button onClick={() => chooseSnippet(index)} key={index}>
          {/* key Is used during .map so that you can have unique identifiers for 
      all of that which you are mapping.  Index comes inherently with array */}
          {each}
        </button>
      ))
      }

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

export default App;
