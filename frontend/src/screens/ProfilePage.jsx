import React, { useState } from "react";
import Profile from "../components/Profile.component";
import UserBookings from "../components/UserBookings.component";
import LoadingSpinner from "../components/LoadingSpinner.component";

const ProfilePage = () => {
  return (
    <div>

          <Profile />
          <UserBookings display={5}/>

    </div>
  );
};

export default ProfilePage;