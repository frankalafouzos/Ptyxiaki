import React from "react"; 
import Profile from "../components/Profile.component";
import UserBookings from "../components/UserBookings.component";

const profilePage = () => {
    return (
        <div>
            <Profile />
            <UserBookings display={5}/>
        </div>
    );
}

export default profilePage;