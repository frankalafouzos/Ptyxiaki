import React, { useState } from "react";
import Profile from "../components/Profile.component";
import UserBookings from "../components/UserBookings.component";
import LoadingSpinner from "../components/LoadingSpinner.component";

const ProfilePage = () => {
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  const handleBookingsLoaded = () => {
    setBookingsLoaded(true);
  };

  return (
    <div>
        
      {bookingsLoaded ? (
        <>
          <Profile />
        </>
      ):(<div></div>)}
      <UserBookings display={5} onLoadingComplete={handleBookingsLoaded} />
    </div>
  );
};

export default ProfilePage;