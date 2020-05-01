import React, { useState, useEffect } from 'react';


const Card = (props) => {

    return (
        <div className="card">
          <div className="card-body">
            <div className="row">

              
            {props.gameState.prepared === true && props.gameState.victory === false ?
          <div className="innerMost">
            <blockquote className="blockquote mb-0">
              <p>Your quote to type is:</p>
              <p className="line-1 anim-typewriter">{props.selection[0]}</p>
            </blockquote>
            <br></br>
            <textarea id="textbox" class="blockquote mb-0"
              value={props.userText} onChange={() => props.updateUserText()} autoComplete="off" size={props.selection[0].length - 10} maxLength={props.selection[0].length}>
            </textarea>
            {props.gameState.timer === true ?
              <div>
                
                {/*  if you have two characters, the array will render two each's, and so forth */}
                <p style={{ position: "relative", left: "2px" }}>{props.checker.map((each) => each.includes("_") ? <span className="err">{each}</span> : <span className="correct">{each}</span>)}</p>
                {/* <CircularProgressbar value={progress} text={`${progress}%`}/> */}
                <Timer
                  startImmediately={false}>
                  {({ start, resume, pause, stop, reset, timerState }) => (

                    <React.Fragment>
                      {new Date().getTime() - props.gameState.startTime > 60000 ? <span><Timer.Minutes></Timer.Minutes> Minutes and <Timer.Seconds /> seconds have elapsed!</span>
                       : <span><Timer.Seconds /> seconds have elapsed!</span>} 
                {start()}
                    </React.Fragment>

                  )}
                </Timer>
              </div>
              : <div style={{ height: "3.6rem" }}>{props.gameState.readyMessage}</div>}
          </div> 
          : props.gameState.victory === true ? <p style={{fontSize:"20px", fontWeight:"bold"}}>{props.selection[0]}</p> : <div>
            <p style={{fontWeight: "bold", fontSize: "20px"}}>Welcome to Type Race!</p>
            <ul>
            <li>You will be presented with randomized quotes scraped from <a href="https://www.universalclass.com/articles/self-help/keyboarding-practice-sentence-repetition.htm">this website.</a></li><br></br>
            <li>This game will time how long it takes for you to type out each quote, and record each time as your score.</li><br></br>
            <li>Compete for the fastest scores!  Login to save your scores, or post your scores anonymously on each quote!</li>
            </ul>
            </div> 
            }
        <br></br>
            </div>
          </div>
        </div>
    )
}

export default Card;
