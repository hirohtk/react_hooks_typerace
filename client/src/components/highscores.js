import React, { useState, useEffect } from 'react';
import "./userstats.css"

const HighScores = (props) => {

    return (
        <div>
            {(props.firstRender === true) ? "" :
          <h2 className="centerAlign">High scores on this quote:</h2>
        }
        {
          (props.firstRender === false && props.scores.name === "No Scores yet on this quote!") ?
            <h2 className="centerAlign">No Scores yet on this quote</h2> :
            ((props.firstRender === false) ?
              <table >
                <tbody>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score (milliseconds)</th>
                  </tr>
                  {props.scores.map((each, index) =>
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
        </div>
    )
}

export default HighScores;
