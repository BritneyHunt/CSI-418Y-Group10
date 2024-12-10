const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentQuantity: { type: Number, required: true, default: 0 },
  stockStatus: { type: String, enum: ['Good', 'Low'], default: 'Good' },
});

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
