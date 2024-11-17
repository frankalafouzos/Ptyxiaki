import React, { useState, useEffect } from "react";
import styles from "../css/Form.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { fetchUser, fetchOwner } from '../scripts/fetchUser';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Initialize user as null
  const authUser = useAuthUser();
  const email = authUser.email;
  const role = JSON.parse(localStorage.getItem('role')).role;
  const [isUser, setIsUser] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  console.log("Role: ", role);
  console.log("Admin: ", user);
  console.log("Email: ", email);

  useEffect(() => {
    const fetchData = async () => {
      if (role === "user") {
         fetchUser(email, setLoading, setUser);
        setIsUser(true);
        console.log("User role found");
      } else if (role === "owner") {
         fetchOwner(email, setLoading, setUser);
        setIsOwner(true);
        console.log(isOwner ? "Owner role found" : "Owner role not found");
      } else if (role === "admin") {
         fetchUser(email, setLoading, setUser);
        setIsAdmin(true);
        console.log("Admin role found");
      } else {
        console.log("Role not found");
      }
    }

    // const fetchUser = async () => {
    //   console.log("Fetching user data for email:", email);

    //   try {
    //     const response = await fetch(
    //       `http://localhost:5000/users/userprofile`,
    //       {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ email: email }),
    //       }
    //     );

    //     if (!response.ok) {
    //       throw new Error("User not found");
    //     }

    //     let data = await response.json(); // Await the JSON conversion
    //     console.log("Received user data:", data);
    //     setUser(data);
    //     setFormData({
    //       firstname: data.firstname,
    //       lastname: data.lastname,
    //       email: data.email,
    //       location: data.location,
    //     });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };
    fetchData();
  }, [role, email]);

  useEffect(() => {
    if (user) {
      console.log("User data:", user);
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        location: user.location,
      });
    }
  }, [user]);

  if (loading) {
    return <div className="d-flex justify-content-center pt-5"><div className="loader"></div></div>
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (role === "owner") {
      try {
        const response = await fetch("http://localhost:5000/owners/editprofile", {
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
            window.location.replace("http://localhost:3000/owner-profile"),
        });
      } catch (error) {
        console.error("Edit profile error:", error);
        toast.error(error.message, {
          position: "top-center",
          autoClose: 2000,
          onClose: () => window.location.replace("http://localhost:3000/ownerEditProfile"),
        });
      }
    } else {
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
        if(role === "admin") {
          toast.success("Profile edited successfully", {
            position: "top-center",
            autoClose: 2000,
            onClose: () =>
              window.location.replace("http://localhost:3000/adminProfilePage"),
          });
        } else {
        toast.success("Profile edited successfully", {
          position: "top-center",
          autoClose: 2000,
          onClose: () =>
            window.location.replace("http://localhost:3000/profilePage"),
        });}
      } catch (error) {
        console.error("Edit profile error:", error);
        if(role === "admin") {
          toast.error(error.message, {
            position: "top-center",
            autoClose: 2000,
            onClose: () => window.location.replace("http://localhost:3000/adminEditProfile"),
          });
        } else {
        toast.error(error.message, {
          position: "top-center",
          autoClose: 2000,
          onClose: () => window.location.replace("http://localhost:3000/editProfile"),
        });}
      }
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
