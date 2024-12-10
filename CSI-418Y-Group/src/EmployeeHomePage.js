import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageStyle from './PageStyle';

const EmployeeHomePage = () => {
  const [employeeName, setEmployeeName] = useState('');
  const [orders, setOrders] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };

  const decodedToken = decodeToken(token);

  useEffect(() => {
    if (!decodedToken) {
      setError('Invalid session. Please log in again.');
      localStorage.removeItem('employeeToken');
      navigate('/EmployeeLogin');
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    if (decodedToken.exp < currentTime) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('employeeToken');
      navigate('/EmployeeLogin');
      return;
    }

    setEmployeeName(decodedToken.username || 'Employee'); // Fallback to "Employee" if username is unavailable

    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/orders/get', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        setError('Error fetching orders: ' + error);
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false); 
      }
    };

    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/inventory');
        const lowStock = response.data.filter((item) => item.stockStatus === 'Low');
        setLowStockItems(lowStock);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to fetch inventory: ' + error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBreaks = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/employees/shifts/breaks/unapproved');
        setBreaks(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to fetch inventory: ' + error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    fetchLowStockItems();
    fetchBreaks();
  }, [navigate]);

  const fulfillOrder = (order_id) => {
    try {
      axios.put(`http://localhost:9000/api/orders/fulfill/${order_id}`)
      document.getElementById(order_id).hidden = true;
    } catch (error) {
      console.error('Error fulfilling order:', error);
    } 
  }

  const approveBreak = (break_id) => {
    try {
      axios.patch(`http://localhost:9000/api/breaks/approve/${break_id}`)
      document.getElementById(break_id).hidden = true;
    } catch (error) {
      console.error('Error fulfilling order:', error);
    } 
  }

  const denyBreak = (break_id) => {
    try {
      axios.delete(`http://localhost:9000/api/employees/shifts/${break_id}`)
      document.getElementById(break_id).hidden = true;
    } catch (error) {
      console.error('Error fulfilling order:', error);
    } 
  }

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <PageStyle>
    
    {/* EMPLOYEE VERSION OF PAGE */}
    <> {!decodedToken.manager &&
    <div>
      <h2>Welcome, {employeeName}!</h2>
      <h3>Customer Orders</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id} id={order._id}>
              <h4>Order ID: {order._id}</h4>
              <p>Total: ${order.total.toFixed(2)}</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.itemName} x {item.quantity} - ${item.price.toFixed(2)} 
                    <button type="button" onClick={(e) => fulfillOrder(order._id)}>Fulfill</button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {/* Button to navigate to EmployeeShifts page */}
      <button onClick={() => navigate('/EmployeeShifts')} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px' }}>
        Create Shifts and Breaks
      </button>

      <br />

      {/* Button to navigate to Inventory Management page */}
      <button onClick={() => navigate('/InventoryPage')} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px' }}>
        Manage Inventory
      </button>
    </div>
    }
    </>
    {/* MANAGER VERSION OF PAGE */ }
    <>
    {
      decodedToken.manager &&
      <div>
        <h2>Welcome, {employeeName}!</h2>
        <div>
        {lowStockItems.length > 0 && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          <p>Alert: Low Stock Items</p>
          <ul>
            {lowStockItems.map((item) => (
              <li key={item._id}>
                {item.name} (Quantity: {item.currentQuantity})
              </li>
            ))}
          </ul>
        </div>)}
          <br />
          <h3> Break Requests: </h3>
          <ul>
            {breaks.map((schedule) => {
              return (<li key={schedule._id} id={schedule._id}>
                <h4> Employee {schedule.employeeId} </h4>
                <p> Date - {schedule.date}</p>
                <button onClick = {() => approveBreak(schedule._id)}> Approve </button>
                <button onClick = {() => denyBreak(schedule._id)}> Deny </button>
              </li>)
            })

            }
          </ul>
        </div>

      {/* Button to navigate to Inventory Management page */}
      <button onClick={() => navigate('/InventoryPage')} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px' }}>
        Manage Inventory
      </button>

      <br />

      {/* Button to navigate to Menu Management page */}
      <button onClick={() => navigate('/Menu')} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px' }}>
        Manage Menu
      </button>
      </div>
    }
    </>
    </PageStyle>
  );
};

export default EmployeeHomePage;


