import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageStyle from './PageStyle';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    manager: false, // Default to non-manager
    role: 'customer', // Default to customer
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
//handle signup
const handleSignup = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password) {
        alert('Please fill in all required fields.');
        return;
    }
    if (formData.username.length < 3 || formData.username.length > 20) {
        alert('Username must be between 3 and 20 characters.');
        return;
    }
    if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    try {
        const apiUrl = `http://localhost:9000/api/${formData.role}s/signup`; // Dynamic endpoint based on role

        console.log('Sending formData to backend:', formData); // Log form data for debugging

        await axios.post(apiUrl, formData);

        alert('Signup Successful. Please login.');

        // Redirect based on role after signup
        if (formData.role === 'employee') {
            navigate('/EmployeeLogin'); // Redirect to EmployeeLogin if role is employee
        } else {
            navigate('/login'); // Otherwise, go to regular login page
        }
    } catch (error) {
        // Enhanced error handling
        if (error.response) {
            console.error('Backend error:', error.response.data);

            // Display specific backend error message if available
            alert(`Signup failed: ${error.response.data.message || 'Please check your details and try again.'}`);
        } else if (error.request) {
            console.error('No response from server:', error.request);
            alert('No response from the server. Please check your connection.');
        } else {
            console.error('Error setting up request:', error.message);
            alert(`An error occurred: ${error.message}`);
        }
    }
};



  return (
    <PageStyle>
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        {/* First Name */}
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Username */}
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <small>
            Username must be unique and contain 3-20 characters (letters, numbers, or underscores).
          </small>
        </div>

        {/* Password */}
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <small>
            Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
          </small>
        </div>

        {/* Manager Checkbox (only for employees) */}
        {formData.role === 'employee' && (
          <div>
            <label>
              <input
                type="checkbox"
                name="manager"
                checked={formData.manager}
                onChange={handleChange}
              />
              Manager
            </label>
            <small>(Check if this account is for a manager.)</small>
          </div>
        )}

        {/* Role Selector */}
        <div>
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <button type="submit">Signup</button>
      </form>
    </div>
</PageStyle>
  );
};

export default Signup;