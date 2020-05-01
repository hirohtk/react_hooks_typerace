import React, { useState, useEffect } from 'react';
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";

const GameButton = (props) => {

    return (
        <div id="gameButton">
            {props.firstRender === true ? <AwesomeButton type="primary" onPress={props.startGame}>Start!</AwesomeButton>
                :
                props.gameState.startTime === null ? <AwesomeButton type="primary" onPress={props.setup}>Change quote</AwesomeButton> : ""}
        </div>
    )
}

export default GameButton;
