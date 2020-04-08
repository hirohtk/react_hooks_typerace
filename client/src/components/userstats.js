import React, { useState, useEffect } from 'react';
import "./userstats.css"

const UserStats = (props) => {

    return (
        <div>
            {props.firstRender === true ? "" : 
            <div id="userSection">

            </div>
            }
        </div>
    )
}

export default UserStats;
