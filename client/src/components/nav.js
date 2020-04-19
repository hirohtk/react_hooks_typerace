import React, { useState, useEffect } from 'react';
import "./nav.css"
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";

const Nav = (props) => {

    return (
        <div>
            <nav className="navbar navbar-light bg-dark">
                <a className="navbar-brand" style={{color:"white"}}><strong>Type Race</strong></a>

                <ul class="nav justify-content-end">
                    <li class="nav-item"><span>{props.currentUser != undefined ? `Welcome, ${props.currentUser}!` : ""}</span></li>
                    <li class="nav-item">
                    
                        <AwesomeButton type="secondary" ripple
                            onPress={
                                ()=> props.promptRegister()
                            }
                        >Register</AwesomeButton>
                        <div style={{width:"100px"}}></div>

                    </li>
                    <li class="nav-item">
                        {
                            props.loggedIn === true ?

                                <AwesomeButton type="primary" ripple
                                    onPress={
                                        () => props.logOut()
                                    }>Log Out</AwesomeButton>

                                :

                                <AwesomeButton type="primary" ripple
                                    onPress={
                                        () => props.promptLogin()
                                    }>Login</AwesomeButton>

                        }
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Nav;
