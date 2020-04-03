import React, { useState, useEffect } from 'react';

const Nav = (props) => {

    return (
        <div>
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand">Type Race</a>
                <ul class="nav justify-content-end">
                    <li class="nav-item">
                        <button className="btn btn-success my-2 my-sm-0" onClick={props.promptRegister}>Register</button>
                    </li>
                    <li class="nav-item">
                        {
                            props.loggedIn === true ?
                                <button className="btn btn-outline-dark my-2 my-sm-0 rightButton" onClick={props.logOut}>Log Out</button>
                                :
                                <button className="btn btn-primary my-2 my-sm-0 rightButton" onClick={props.promptLogin}>Login</button>
                        }
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Nav;
