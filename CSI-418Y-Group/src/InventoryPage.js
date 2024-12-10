import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [currentQuantities, setCurrentQuantities] = useState({});
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Fetch inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/inventory');
        setInventory(response.data);

        // Initialize current quantities for editing
        const initialQuantities = response.data.reduce((acc, item) => {
          acc[item._id] = item.currentQuantity; // Set the initial value to the last checked quantity
          return acc;
        }, {});
        setCurrentQuantities(initialQuantities);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to fetch inventory.');
      }
    };

    fetchInventory();
  }, []);

  // Handle changes to the current quantity
  const handleQuantityChange = (id, value) => {
    setCurrentQuantities((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Add a new inventory item
  const handleAddItem = async () => {
    if (!newItemName || newItemQuantity === '') {
      alert('Please enter both name and quantity.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9000/api/inventory', {
        name: newItemName,
        currentQuantity: parseInt(newItemQuantity, 10),
      });
      setInventory((prev) => [...prev, response.data]);
      setNewItemName('');
      setNewItemQuantity('');
      alert('Item added successfully!');
    } catch (err) {
      console.error('Error adding inventory item:', err);
      alert('Failed to add item.');
    }
  };

  // Delete an inventory item
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/api/inventory/${id}`);
      setInventory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      alert('Failed to delete item.');
    }
  };

  // Save updated quantities
  const handleSaveChanges = async () => {
    try {
      const updates = Object.entries(currentQuantities).map(async ([id, quantity]) => {
        await axios.put(`http://localhost:9000/api/inventory/${id}`, {
          currentQuantity: parseInt(quantity, 10),
        });
      });

      await Promise.all(updates);
      alert('Inventory updated successfully!');
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('Failed to save changes.');
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div style = {{'background-color': 'white'}}>
      <h2>Inventory Management</h2>

      {/* Add new inventory item */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Add New Item</h3>
        <input
          type="text"
          placeholder="Item Name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(e.target.value)}
        />
        <button
          onClick={handleAddItem}
          style={{
            padding: '5px 10px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Add Item
        </button>
      </div>

      {/* Inventory table */}
      <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Quantity Check</th>
            <th>Update Current Quantity</th>
            <th>Stock Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.currentQuantity}</td> {/* Last checked quantity */}
              <td>
                <input
                  type="number"
                  value={currentQuantities[item._id] || ''}
                  onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                  placeholder="Enter new quantity"
                />
              </td>
              <td
                style={{
                  color: item.stockStatus === 'Low' ? 'red' : 'green',
                  fontWeight: 'bold',
                }}
              >
                {item.stockStatus}
              </td>
              <td>
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: 'red',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Save changes */}
      <button
        onClick={handleSaveChanges}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Save Changes
      </button>

      {/* Navigate to Home Page */}
      <button
        onClick={(e) => navigate('/EmployeeHomePage')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Home
      </button>
    </div>
  );
};

export default InventoryPage;



