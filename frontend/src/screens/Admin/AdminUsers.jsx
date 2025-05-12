import React, { useState, useEffect } from "react";
import { Button, Table, InputGroup, FormControl } from "react-bootstrap";
import {
  FaSearch,
  FaTrash,
  FaUserShield,
  FaUserAltSlash,
} from "react-icons/fa";
import "../../css/Admin/AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusChange, setStatusChange] = useState(false);

  // Fetch users whenever search, filter, or sort options change
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, sortField, sortOrder, statusChange]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        searchQuery,
        role: roleFilter,
        sortField,
        sortOrder,
      }).toString();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/allUsers?${queryParams}`
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/user/${userId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId));
        console.log("User deleted successfully");
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/user/${userId}/toggleAdmin`,
        {
          method: "PATCH",
        }
      );
      const data = await response.json();

      if (response.ok) {
        // Update the user role in the local state
        const updatedUsers = users.map((user) =>
          user._id === userId
            ? { ...user, role: isAdmin ? "User" : "Admin" }
            : user
        );
        setUsers(updatedUsers);
        setStatusChange(!statusChange);
        console.log(data.message);
      } else {
        console.error("Failed to toggle admin status");
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
    }
  };

  return (
    <div className="admin-users-container">
      <h1 className="admin-users-header">Admin User Management</h1>

      <div className="controls-container">
        {/* Search Bar */}
        <InputGroup className="search-bar">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="User">User</option>
          <option value="Owner">Owner</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Sort Field */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="sort-select"
        >
          <option value="">Sort By</option>
          <option value="firstname">First Name</option>
          <option value="lastname">Last Name</option>
          <option value="email">Email</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-order-select"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <Table bordered hover responsive className="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{`${user.firstname} ${user.lastname}`}</td>
                <td>{user.email}</td>
                <td>{user.location || "N/A"}</td>
                <td>{user.role}</td>
                <td>
                  <Button
                    variant="danger"
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <FaTrash /> Delete
                  </Button>
                  {user.role !== "Owner" && (
                    <Button
                      variant={user.role === "Admin" ? "warning" : "success"}
                      className={`action-btn ${
                        user.role === "Admin" ? "demote" : "promote"
                      }`}
                      onClick={() =>
                        handleToggleAdmin(user._id, user.role === "Admin")
                      }
                    >
                      {user.role === "Admin" ? (
                        <FaUserAltSlash />
                      ) : (
                        <FaUserShield />
                      )}
                      {user.role === "Admin" ? " Demote" : " Promote"}
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminUsers;
