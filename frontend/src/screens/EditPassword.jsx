import React, { useState } from "react";
import "../css/AuthForm.css";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const authUser = useAuthUser();
  const email = authUser.email;

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/users/editpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email : email,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message || "Failed to edit profile");
      }

      console.log("Profile edited successfully");
      toast.success("Profile edited successfully", {
        position: "top-center",
        autoClose: 2000,
        // onClose: () =>
        //   window.location.replace("http://localhost:3000/profilePage"),
      });
    } catch (error) {
      console.error("Edit profile error:", error.message);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        // onClose: () => window.location.replace("http://localhost:3000/editPassword"),
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="auth-form">
        <h1 className="title">Edit Password</h1>
        <div>
          <label htmlFor="currentPassword">Current Password:</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
          />
        </div>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
          />
          {newPassword === currentPassword && <div className="error-message">Password cannot be the same with the existing one!</div>}
        
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {newPassword !== confirmPassword && <div className="error-message">Passwords do not match!</div>}
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

export default EditPassword;
