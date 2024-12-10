import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageStyle from './PageStyle';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', addOns: [] });
  const [newAddOn, setNewAddOn] = useState({ name: '', price: '' });
  const [error, setError] = useState('');  // Error state for handling errors

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/menu');
      setMenuItems(response.data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to fetch menu items.');
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await axios.post('http://localhost:9000/api/menu', newItem);
      setMenuItems([...menuItems, response.data.item]); // Add new item to the list
      setNewItem({ name: '', price: '', description: '', addOns: [] }); // Clear form
    } catch (err) {
      console.error('Error adding menu item:', err);
      alert('Failed to add menu item.');
    }
  };

  const handleAddAddOn = () => {
    if (!newAddOn.name || !newAddOn.price) {
      alert('Add-on name and price are required.');
      return;
    }
    setNewItem((prev) => ({
      ...prev,
      addOns: [...prev.addOns, newAddOn],
    }));
    setNewAddOn({ name: '', price: '' }); // Clear add-on form
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/api/menu/${id}`);
      setMenuItems(menuItems.filter((item) => item._id !== id)); // Remove item from the list
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete menu item.');
    }
  };

  const handleDeleteAddOn = (index) => {
    setNewItem((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index),
    }));
  };

  return (
    <PageStyle>
    <div>
      <h2>Menu Management</h2>

      {/* Display error if it exists */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h3>Add New Item</h3>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />

        <div>
          <h4>Add Add-On</h4>
          <input
            type="text"
            placeholder="Add-On Name"
            value={newAddOn.name}
            onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Add-On Price"
            value={newAddOn.price}
            onChange={(e) => setNewAddOn({ ...newAddOn, price: e.target.value })}
          />
          <button onClick={handleAddAddOn}>Add Add-On</button>
        </div>

        <div>
          <h4>Current Add-Ons</h4>
          <ul>
            {newItem.addOns.map((addOn, index) => (
              <li key={index}>
                {addOn.name} - ${parseFloat(addOn.price).toFixed(2)}{' '}
                <button onClick={() => handleDeleteAddOn(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={handleAddItem}>Add Item</button>
      </div>

      <div>
        <h3>Menu Items</h3>
        {menuItems.length === 0 ? (
          <p>No menu items available.</p>
        ) : (
          <ul>
            {menuItems.map((item) => (
              <li key={item._id}>
                <strong>{item.name}</strong> - ${item.price.toFixed(2)}
                <br />
                <em>{item.description}</em>
                <h4>Add-Ons:</h4>
                <ul>
                  {item.addOns.map((addOn, idx) => (
                    <li key={idx}>
                      {addOn.name} - ${addOn.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </PageStyle>
  );
};

export default MenuManagement;

