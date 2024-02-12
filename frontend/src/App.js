import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import SearchBar from './components/SearchBar';
import Home from './screens/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Restaurants from './screens/Restaurants'
import RestaurantPage from './screens/Restaurant'
import './App.css';
import './css/Header.css'

function App() {

  return (
    
    <Router>
        
        <Header/>
        <main>
          <Routes>
            <Route path="/" element={<Home/>} /> 
            <Route path="/login" element={<Login/>} />
            <Route path="/signout" element={<Login/>} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/search" element={<SearchBar/>} />
            <Route path="/restaurants" element={<Restaurants/>} />
            <Route path="/restaurant/:id" element={<RestaurantPage/>} />
          </Routes>
          
        </main>
        <Footer/>
    </Router>
    
  );
}

export default App;
