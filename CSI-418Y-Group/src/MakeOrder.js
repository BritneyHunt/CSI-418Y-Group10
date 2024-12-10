import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageStyle from './PageStyle';

const MakeOrder = () => {
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/menu');
        setMenu(response.data);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to fetch menu.');
      }
    };
    fetchMenu();
  }, []);

  // Handle quantity changes
  const handleQuantityChange = (itemId, quantity) => {
    setQuantities((prev) => ({ ...prev, [itemId]: quantity }));
  };

  // Handle add-on selection
  const handleAddOnChange = (itemId, addOnName, isChecked) => {
    setSelectedAddOns((prev) => {
      const itemAddOns = prev[itemId] || {};
      if (isChecked) {
        itemAddOns[addOnName] = true;
      } else {
        delete itemAddOns[addOnName];
      }
      return { ...prev, [itemId]: itemAddOns };
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in first!');
      return;
    }

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const customerId = decodedToken.userId;

    const orderItems = menu
      .filter((item) => quantities[item._id] > 0)
      .map((item) => ({
        productId: item._id,
        itemName: item.name,
        quantity: quantities[item._id],
        price: item.price,
        addOns: Object.keys(selectedAddOns[item._id] || {}).map((addOnName) => ({
          name: addOnName,
          price: item.addOns.find((addOn) => addOn.name === addOnName).price,
        })),
      }));

    const total = orderItems.reduce(
      (sum, item) =>
        sum +
        item.quantity * (item.price +
        item.addOns.reduce((addOnSum, addOn) => addOnSum + addOn.price, 0)),
      0
    );

    try {
      const response = await axios.post('http://localhost:9000/api/orders', {
        customerId,
        items: orderItems,
        total,
      });
      alert('Order placed successfully!');
      setOrderId(response.data.order._id); // Save the new order ID for navigation
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <PageStyle>
    <div>
      <h2>Make an Order</h2>
      {menu.length === 0 ? (
        <p>Loading menu...</p>
      ) : (
        <ul>
          {menu.map((item) => (
            <li key={item._id}>
              <h3>{item.name} - ${item.price.toFixed(2)}</h3>
              <p>{item.description}</p>
              <input
                type="number"
                value={quantities[item._id] || 0}
                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                placeholder="Quantity"
              />
              <h4>Add-Ons:</h4>
              {item.addOns.map((addOn) => (
                <label key={addOn.name}>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleAddOnChange(item._id, addOn.name, e.target.checked)
                    }
                  />
                  {addOn.name} - ${addOn.price.toFixed(2)}
                </label>
              ))}
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleCheckout}>Place Order</button>
      {orderId && (
        <button onClick={() => navigate(`/CheckOutPage/${orderId}`)}>
          Go to Checkout
        </button>
      )}
    </div>
    </PageStyle>
  );
};

export default MakeOrder;