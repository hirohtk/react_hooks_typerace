import React, { useState, useEffect } from 'react';

const Nav = (props) => {

    return (
        <div>
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand">Type Race</a>
                    <button className="btn btn-primary my-2 my-sm-0" onClick={props.promptLogin}>Login</button>
            </nav>
        </div>
    )
}

export default Nav;
