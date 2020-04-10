import React, { useState, useEffect } from 'react';
import "./nav.css"
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";

const Nav = (props) => {

    return (
        <div>
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand">Type Race</a>

                <ul class="nav justify-content-end">
                    <li class="nav-item"><span>{props.currentUser != undefined ? `Welcome, ${props.currentUser}!` : ""}</span></li>
                    <li class="nav-item">
                    {/* <AwesomeButton type="primary">Primary</AwesomeButton> */}
                    
                        <AwesomeButton type="secondary" ripple
                            onPress={
                                ()=> props.promptRegister()
                            }
                        >Register</AwesomeButton>
                        <div style={{width:"100px"}}></div>

                        {/* <button className="btn btn-success my-2 my-sm-0" onClick={props.promptRegister}>Register</button> */}
                    </li>
                    <li class="nav-item">
                        {
                            props.loggedIn === true ?
                            // <AwesomeButton type="primary">Primary</AwesomeButton>

                                <AwesomeButton type="primary" ripple
                                    onPress={
                                        () => props.logOut()
                                    }>Log Out</AwesomeButton>

                                // <button className="btn btn-outline-dark my-2 my-sm-0 rightButton" onClick={props.logOut}>Log Out</button>
                                :

                                // <AwesomeButton type="primary">Primary</AwesomeButton>

                                <AwesomeButton type="primary" ripple
                                    onPress={
                                        () => props.promptLogin()
                                    }>Login</AwesomeButton>

                            // <button className="btn btn-primary my-2 my-sm-0 rightButton" onClick={props.promptLogin}>Login</button>
                        }
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Nav;
