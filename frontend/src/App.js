import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import SearchBar from './components/SearchBar';
import Home from './components/Home';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  console.log('Home component rendering')
  return (
    
    <Router>
        
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>} /> 
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/search" element={<SearchBar/>} />
          
        </Routes>
        
    </Router>
    
  );
}

export default App;
