import React, { useState, useEffect } from 'react';
import "./userstats.css"

const UserStats = (props) => {

    return (
        <div>
            {props.firstRender === true || props.loggedIn === false ? "" :
                <div id="userSection">
                    <h2 className="centerAlign">Your Top Scores!</h2>
                    <table className="table table-dark">
                    <thead>
                                <th scope="col">Rank</th>
                                <th scope="col">Quote</th>
                                <th scope="col">Score (milliseconds)</th>
                            </thead>
                        <tbody>
                            {props.history.map((each, index) => (
                                each.changed === true ? 
                                    <tr key={index}><th scope="row" className="green">{index + 1}</th><td className="green">{each.quote}</td><td className="green">{each.score}</td></tr>
                                :
                                <tr key={index}><th scope="row" >{index + 1}</th><td>{each.quote}</td><td>{each.score}</td></tr>
                            )
                            )}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}

export default UserStats;
