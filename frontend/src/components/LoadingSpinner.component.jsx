import React from 'react';

const LoadingSpinner = ({ message = "Loading...", fadeOut = false }) => {
  return (
    <div>
      <style>
        {`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem 0;
            background: transparent;
            transition: opacity 0.5s ease-in-out;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(36, 30, 226, 0.2);
            border-top: 3px solid #241ee2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-text {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            text-align: center;
            margin: 0;
          }

          .fade-out {
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
          }
        `}
      </style>
      <div className={`loading-container ${fadeOut ? "fade-out" : ""}`}>
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;