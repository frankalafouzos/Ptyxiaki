import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import SearchBar from './components/SearchBar';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Restaurants from './components/Restaurants'
import RestaurantPage from './components/RestaurantPage'
import './App.css';

function App() {

  return (
    
    <Router>
        
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>} /> 
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/search" element={<SearchBar/>} />
          <Route path="/restaurants" element={<Restaurants/>} />
          <Route path="/restaurant/:id" element={<RestaurantPage/>} />
        </Routes>
        
    </Router>
    
  );
}

export default App;
