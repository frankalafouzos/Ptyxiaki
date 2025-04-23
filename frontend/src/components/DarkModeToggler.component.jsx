import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const DarkModeToggle = () => {
    // Use localStorage to persist dark mode state
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "enabled"
    );

    // Apply dark mode class to body when toggled
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    }, [darkMode]);

    // Toggle function
    const handleToggle = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return ReactDOM.createPortal(
        <div className="toggle-container">
            <span className="toggle-label">{darkMode ? "Dark" : "Light"}</span>
            <label className="toggle-switch">
                <input type="checkbox" checked={darkMode} onChange={handleToggle} />
                <span className="slider"></span>
            </label>
        </div>,
        document.body // Attach it to the <body> outside of React's component tree
    );
};

export default DarkModeToggle;
