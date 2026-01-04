// client/src/components/Admin/CreateUserPage.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

function CreateUserPage() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
  });

  const handleCreate = async () => {
    try {
      await authFetch(
        "http://localhost:5000/api/admin/users",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        user
      );
      alert("Account Created");
    } catch (err) {
      alert("Invalid User Data or Account Already Exists");
    }
  };

  return (
    <div className="form-container">
      <h2>Create User Account</h2>
      <input
        placeholder="Email"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <input
        placeholder="First Name"
        onChange={(e) =>
          setFormData({ ...formData, firstName: e.target.value })
        }
      />
      <input
        placeholder="Last Name"
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      />
      <select
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleCreate}>Create New Account</button>
    </div>
  );
}
export default CreateUserPage;
