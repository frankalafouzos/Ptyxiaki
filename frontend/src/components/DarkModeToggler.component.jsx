import React, { useEffect, useState } from "react";

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

    return (
        <button 
            onClick={handleToggle}
            style={{
                background: 'none',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '15px',
                fontSize: '14px',
                color: darkMode ? '#fff' : '#333',
                backgroundColor: darkMode ? '#343a40' : '#fff',
                transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
                e.target.style.opacity = '0.8';
            }}
            onMouseOut={(e) => {
                e.target.style.opacity = '1';
            }}
        >
            <span>{darkMode ? "🌙" : "☀️"}</span>
            <span>{darkMode ? "Dark" : "Light"}</span>
        </button>
    );
};

export default DarkModeToggle;