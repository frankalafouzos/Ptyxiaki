import React, { useState, useEffect } from 'react';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const AdminUsers = () => {



    return (
        <div className='Container'>
            <h1>Admin Users</h1>
            <div className="user-list">
                {/* User list will be rendered here */}
            </div>
            <div className="user-actions">
                {/* Actions like add, edit, delete user will be here */}
            </div>
        </div>
    );
};

export default AdminUsers;