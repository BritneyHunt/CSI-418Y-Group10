import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PageStyle from './PageStyle';

const CheckoutPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const fetchOrderAndUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;

        // Fetch order
        const orderResponse = await axios.get(`http://localhost:9000/api/orders/${orderId}`);
        setOrder(orderResponse.data);

        // Fetch user
        const userResponse = await axios.get(`http://localhost:9000/api/customers/home`, {
          params: { userId },
        });
        setUser(userResponse.data);

        // Calculate discounted total
        const discount = userResponse.data.points >= 500 ? 5 : 0;
        setFinalTotal(orderResponse.data.total - discount);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load checkout details.');
      }
    };

    fetchOrderAndUser();
  }, [orderId, navigate]);

  const handlePay = async () => {
    try {
      // Calculate earned points
      const earnedPoints = finalTotal * 10;

      // Update order status to "Confirmed" and user points
      await axios.post(`http://localhost:9000/api/orders/${orderId}/pay`, {
        points: earnedPoints,
      });

      alert('Payment successful! Your order has been confirmed.');
      navigate('/HomePage'); // Redirect to home page
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Failed to process payment.');
    }
  };

  if (error) return <p>{error}</p>;
  if (!order || !user) return <p>Loading...</p>;

  return (
    <PageStyle>
    <div>
      <h2>Checkout</h2>
      <p>Total: ${order.total.toFixed(2)}</p>
      <p>Discount: ${user.points >= 500 ? 5 : 0}</p>
      <p>Final Total: ${finalTotal.toFixed(2)}</p>
      <p>Your Current Points: {user.points}</p>
      <button onClick={handlePay}>Pay</button>
    </div>
    </PageStyle>
  );
};

export default CheckoutPage;