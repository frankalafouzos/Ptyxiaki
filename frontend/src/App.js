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
import OwnerHeader from './components/Owner/OwnerHeader.component';
import Footer from './components/Footer.component';
import Restaurants from './screens/Restaurants';
import RestaurantPage from './screens/Restaurant';
import ProfilePage from './screens/ProfilePage';
import EditProfile from './screens/EditProfile';
import EditPassword from './screens/EditPassword';
import UserProtectedRoute from './components/UserProtectedRoute.component';
import OwnerProtectedRoute from './components/Owner/OwnerProtectedRoute.component';
import ConfirmBooking from './screens/ConfirmBooking';
import MakeABooking from './screens/MakeABooking';
import UserBookings from './components/UserBookings.component';
import ThankYouForBooking from './screens/ThankYouForBooking';
import EditBooking from './screens/EditBooking';
import OwnerHome from './screens/Owner/OwnerHome';
import Logout from './components/Owner/Logout.component';
import './App.css';
import './css/Header.css';

function App() {
  const role = localStorage.getItem('role');

  return (
    <Router>
      {role === 'owner' ? <OwnerHeader /> : <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signout" element={<Logout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/owner-signup" element={<OwnerSignup />} />
          <Route path="/owner-signin" element={<OwnerSignIn />} />
          <Route path="/search" element={<SearchBar />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/bookingThankYou/:bookingid" element={<ThankYouForBooking />} />

          {/* User Protected Routes */}
          <Route path="/booking/:id" element={<UserProtectedRoute element={<MakeABooking />} />} />
          <Route path="/profilePage" element={<UserProtectedRoute element={<ProfilePage />} />} />
          <Route path="/editProfile" element={<UserProtectedRoute element={<EditProfile />} />} />
          <Route path="/editPassword" element={<UserProtectedRoute element={<EditPassword />} />} />
          <Route path="/userBookings" element={<UserProtectedRoute element={<UserBookings />} />} />
          <Route path="/restaurant/:id/confirmBooking" element={<UserProtectedRoute element={<ConfirmBooking />} />} />
          <Route path="/editBooking/:id" element={<UserProtectedRoute element={<EditBooking />} />} />

          {/* Owner Protected Routes */}
          <Route path="/owner-home" element={<OwnerProtectedRoute element={<OwnerHome />} />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
