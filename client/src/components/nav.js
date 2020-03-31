import React, { useState, useEffect } from 'react';

const Nav = () => {

    return (
        <div>
            <nav class="navbar navbar-light bg-light">
                <a class="navbar-brand">Type Race</a>
                <form class="form-inline">
                    <button class="btn btn-primary my-2 my-sm-0" type="submit">Login</button>
                </form>
            </nav>
        </div>
    )
}

export default Nav;
