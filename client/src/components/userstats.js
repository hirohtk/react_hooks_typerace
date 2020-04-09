import React, { useState, useEffect } from 'react';
import "./userstats.css"

const UserStats = (props) => {

    return (
        <div>
            {props.firstRender === true || props.loggedIn === false ? "" :
                <div id="userSection">
                    <h2>Your Top Scores!</h2>
                    <table >
                        <tbody>
                            <tr>
                                <th>Rank</th>
                                <th>Quote</th>
                                <th>Score (milliseconds)</th>
                            </tr>
                            {props.history.map((each, index) =>
                                    <tr key={index}><td>{index + 1}</td><td>{each.quote}</td><td>{each.score}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}

export default UserStats;
