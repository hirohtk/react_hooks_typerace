import React, { useState } from 'react';
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

  const updateUserText = event => {
    setUserText(event.target.value);
    console.log(`current userText is ${userText}`);
  }

  const chooseSnippet = snippetIndex => {
    console.log('setSnippet', snippetIndex);
    setSnippet(SNIPPETS[snippetIndex]);
  };

  return (
    <div>
      <h2>Type Race</h2>
      {snippet}
      <input value={userText} onChange={updateUserText}></input>

      {SNIPPETS.map( (each, index) => {
        // NEED callback to call chooseSnippet
        <button onClick={() => chooseSnippet(index)} key={index}>
          {/* key Is used during .map so that you can have unique identifiers for 
      all of that which you are mapping.  Index comes inherently with array */}
          {each}
        </button>
      })}

      

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
