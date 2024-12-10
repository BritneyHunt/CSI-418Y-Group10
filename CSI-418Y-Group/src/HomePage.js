import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageStyle from './PageStyle';

const HomePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
        const response = await axios.get(`http://localhost:9000/api/customers/home`, {
          params: { userId: decodedToken.userId },
        });
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <PageStyle>
    <div>
      <h2>Welcome, {userData.name}!</h2>
      <p><strong>Your Points:</strong> {userData.points}</p> {/* Display Customer Points */}
      
      <h3>Your Orders</h3>
      {userData.orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul>
          {userData.orders.map((order, index) => (
            <li key={index}>
              {order.orderId ? (
                <>
                  Order #{order.orderId._id}: {order.orderId.status}
                </>
              ) : (
                <>
                  Order Received
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate('/MakeOrder')}>Make an Order</button>
      <br />
    </div>
    </PageStyle>
  );
};

export default HomePage;
