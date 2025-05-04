import React from "react";
import "./style.css";

function App() {
    return(
        <main>
            <div className="progress"> </div>
            {[ ...Array(10) ].map((arr) => (
                <div className="card">
                    This is My photo gallery
                </div>
            ))} 
        </main>
    )
}