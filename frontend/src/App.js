// Imports
import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import './App.css';
import './css/Header.css';


// Generic Screens
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import OwnerSignup from './screens/Owner/OwnerSignup';
import OwnerSignIn from './screens/Owner/OwnerSignIn';
import SearchBar from './components/SearchBar.component';
import Home from './screens/Home';
import Header from './components/Header.component';
import Footer from './components/Footer.component';
import Restaurants from './screens/Restaurants';
import RestaurantPage from './screens/Restaurant';

// User
import ProfilePage from './screens/ProfilePage';
import EditProfile from './screens/EditProfile';
import EditPassword from './screens/EditPassword';
import UserProtectedRoute from './components/UserProtectedRoute.component';
import ConfirmBooking from './screens/ConfirmBooking';
import MakeABooking from './screens/MakeABooking';
import UserBookings from './components/UserBookings.component';
import ThankYouForBooking from './screens/ThankYouForBooking';
import EditBooking from './screens/EditBooking';
import RateBooking from './screens/RateBooking';

// Owner
import OwnerHome from './screens/Owner/OwnerHome';
import AddRestaurant from './screens/Owner/OwnerAddRestaurant';
import EditRestaurant from './screens/Owner/OwnerEditRestaurant';
import OwnerDashboard from './screens/Owner/OwnerDashboard';
import OwnerMyRestaurants from './screens/Owner/OwnerMyRestaurants';
import RestaurantDashboard from './screens/Owner/OwnerRestaurantDashboard';
import Logout from './components/Owner/Logout.component';
import OwnerProtectedRoute from './components/Owner/OwnerProtectedRoute.component';
import OwnerHeader from './components/Owner/OwnerHeader.component';
import OwnerProfile from './screens/Owner/OwnerProfile';
import OwnerEditProfile from './screens/Owner/OwnerEditProfile';
import OwnerEditPassword from './screens/Owner/OwnerEditPassword';
import OwnerRestaurantCalendar from './screens/Owner/OwnerRestaurantCalendar';



// Admin
import AdminHome from './screens/Admin/AdminHome';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute.component';
import AdminAdministrator from './screens/Admin/AdminAddAdministrator';
import AdminProfile from './screens/Admin/AdminProfile';
import AdminUsers from './screens/Admin/AdminUsers';
import AdminRestaurants from './screens/Admin/AdminRestaurants';
import AdminHeader from './components/Admin/AdminHeader.component';
import AdminEditProfile from './screens/Admin/AdminEditProfile';
import AdminEditPassword from './screens/Admin/AdminEditPassword';



function App() {
  const now = new Date();
  const { auth } = useContext(AuthContext);
  let role = localStorage.getItem('role');
  console.log(role)

  // localStorage.removeItem('role');
  
  if (!role || role === 'owner' || role === 'admin' || role === 'user') {
    const item = { role: role || "user", expiry: 0 };
    role = localStorage.setItem("role", JSON.stringify(item));
  }
  if (typeof role === 'string') {
    role = JSON.parse(role);
  }
  if(typeof role === 'object' && role !== null){
    if (now.getTime() > role.expiry) {
      const item = { role: role || "user", expiry: 0 };
      role = localStorage.setItem("role", JSON.stringify(item));
      role= {role: 'user', expiry: 0}
    }
  }
  
  return (
    <Router>
      {auth.isAuthenticated && role.role === 'owner' ? (
          <OwnerHeader />
        ) : auth.isAuthenticated && role.role === 'admin' ? (
          <AdminHeader />
        ) : auth.isAuthenticated && role.role === 'user' ?(
          <Header />
      ):(
          <Header />
      )}
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
          <Route path="/ratebooking/:bookingId" element={<UserProtectedRoute element={<RateBooking />} />} />

          {/* Owner Protected Routes */}
          <Route path="/owner/home" element={<OwnerProtectedRoute element={<OwnerHome />} />} />
          <Route path="/owner/dashboard" element={<OwnerProtectedRoute element={<OwnerDashboard />} />} />
          <Route path="/owner/restaurant-dashboard/:id" element={<OwnerProtectedRoute element={<RestaurantDashboard />} />} />
          <Route path="/owner/restaurants" element={<OwnerProtectedRoute element={<OwnerMyRestaurants />} />} />
          <Route path="/owner/add-restaurant" element={<OwnerProtectedRoute element={<AddRestaurant />} />} />
          <Route path="/owner/edit-restaurant/:id" element={<OwnerProtectedRoute element={<EditRestaurant />} />} />
          <Route path="/owner/profile" element={<OwnerProtectedRoute element={<OwnerProfile />} />} />
          <Route path="/owner/EditPassword" element={<OwnerProtectedRoute element={<OwnerEditPassword />} />} />
          <Route path="/owner/EditProfile" element={<OwnerProtectedRoute element={<OwnerEditProfile />} />} />
          <Route path="/owner/restaurant/:restaurantId/calendar" element={<OwnerProtectedRoute element={<OwnerRestaurantCalendar />} />} />


          {/* Admin Pages */}
          <Route path="/admin" element={<AdminProtectedRoute element={<AdminHome />} />} />
          <Route path="/admin/add-administrator" element={<AdminProtectedRoute element={<AdminAdministrator />} />} />
          <Route path="/admin/profile" element={<AdminProtectedRoute element={<AdminProfile />} />} />
          <Route path="/admin/EditPassword" element={<AdminProtectedRoute element={<AdminEditPassword />} />} />
          <Route path="/admin/EditProfile" element={<AdminProtectedRoute element={<AdminEditProfile />} />} />
          <Route path="/admin/users" element={<AdminProtectedRoute element={<AdminUsers />} />} />
          <Route path="/admin/restaurants" element={<AdminProtectedRoute element={<AdminRestaurants />} />} />





        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
