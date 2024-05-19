import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import OwnerSignup from './screens/Owner/OwnerSignup';
import OwnerSignIn from './screens/Owner/OwnerSignIn';
import SearchBar from './components/SearchBar.component';
import Home from './screens/Home';
import Header from './components/Header.component';
import Footer from './components/Footer.component';
import Restaurants from './screens/Restaurants'
import RestaurantPage from './screens/Restaurant'
import ProfilePage from './screens/ProfilePage'
import EditProfile from './screens/EditProfile'
import EditPassword from './screens/EditPassword';
import ProtectedRoute from './components/ProtectedRoute.component';
import ConfirmBooking from './screens/ConfirmBooking';
import MakeABooking from './screens/MakeABooking';
import UserBookings from './components/UserBookings.component';
import ThankYouForBooking from './screens/ThankYouForBooking';
import EditBooking from './screens/EditBooking';
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
            <Route path="/owner-signup" element={<OwnerSignup/>} />
            <Route path="/owner-signin" element={<OwnerSignIn/>} />
            <Route path="/search" element={<SearchBar/>} />
            <Route path="/restaurants" element={<Restaurants/>} />
            <Route path="/restaurant/:id" element={<RestaurantPage/>} />
            <Route path="/bookingThankYou/:bookingid" element={<ThankYouForBooking/>} />


            {/* User Protected Routes */}
            <Route path="/booking/:id" element={<ProtectedRoute element={<MakeABooking/>}/>} />
            <Route path="/profilePage" element={<ProtectedRoute element={<ProfilePage/>} />} />
            <Route path="/editProfile" element={<ProtectedRoute element={<EditProfile/>} />} />
            <Route path="/editPassword" element={<ProtectedRoute element={<EditPassword/>} />} />
            <Route path="/userBookings" element={<ProtectedRoute element={<UserBookings/>} />} />
            <Route path="/restaurant/:id/confirmBooking" element={<ProtectedRoute element={<ConfirmBooking/>} />} />
            <Route path="/editBooking/:id" element={<ProtectedRoute element={<EditBooking/>} />} />

          </Routes>
          
        </main>
        <Footer/>
    </Router>
    
  );
}

export default App;
