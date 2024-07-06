import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import App from './App';
// import 'bootstrap/dist/css/bootstrap.css'; // import bootstrap css
import "bootstrap/dist/js/bootstrap.min.js"
import './customBootstrap/bootstrap.custom.css'; // import custom bootstrap css
import './css/Home.css';
// import { AuthProvider } from './context/AuthProvider';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById('root');
const root = createRoot(container);

const store = createStore({
  authName: '_auth',
  authType: 'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:'
});

root.render(
  <>
    <ToastContainer />
    <AuthProvider store={store}>
      <App />
    </AuthProvider>
  </>,
);
