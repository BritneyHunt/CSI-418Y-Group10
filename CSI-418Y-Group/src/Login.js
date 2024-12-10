import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageStyle from './PageStyle';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer'); // State to track the user type (customer or employee)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const apiUrl = userType === 'customer' 
        ? 'http://localhost:9000/api/customers/login' 
        : 'http://localhost:9000/api/employees/login';

      const response = await axios.post(apiUrl, { username, password });

      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      alert('Login Successful');

      if (userType === 'customer') {
        navigate('/HomePage');
      } else {
        navigate('/EmployeeHomePage');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Invalid credentials. Please try again.');
      } else {
        alert('An error occurred during login. Please try again later.');
      }
    }
  };

  return (
    <PageStyle>
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>User Type:</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
            <option value="customer">Customer</option>
            <option value="employee">Employee (Barista)</option>
          </select>
        </div>

        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <p>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Signup here
          </button>
        </p>
      </div>
    </div>
    </PageStyle>
  );
};

export default Login;
