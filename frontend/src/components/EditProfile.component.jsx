import React, { useState, useEffect } from "react";
import styles from "../css/Form.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    location: "",
  });

  const [user, setUser] = useState(null); // Initialize user as null
  const authUser = useAuthUser();
  const email = authUser.email;

  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user data for email:", email);

      try {
        const response = await fetch(
          `http://localhost:5000/users/userprofile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        );

        if (!response.ok) {
          throw new Error("User not found");
        }

        let data = await response.json(); // Await the JSON conversion
        console.log("Received user data:", data);
        setUser(data);
        setFormData({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          location: data.location,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/users/editprofile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (response.status === 400) {
        throw new Error(data.message || "Failed to edit profile");
      }

      console.log("Profile edited successfully");
      toast.success("Profile edited successfully", {
        position: "top-center",
        autoClose: 2000,
        onClose: () =>
          window.location.replace("http://localhost:3000/profilePage"),
      });
    } catch (error) {
      console.error("Edit profile error:", error);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        onClose: () => window.location.replace("http://localhost:3000/editProfile"),
      });
    }
  };

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  if (user == null) {
    return <div>Loading...</div>;
  } else {
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Edit Profile</h1>
        <input
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          placeholder={user ? user.firstname : "First Name"}
          required
        />
        <input
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          placeholder={user ? user.lastname : "Last Name"}
          required
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
        />
        <button type="submit">Save Changes</button>
      </form>
    );
  }
};

export default EditProfile;
