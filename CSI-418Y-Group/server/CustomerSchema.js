const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  points: { type: Number, default: 0 }, // Customer reward points
  orders: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      status: { type: String, enum: ['Pending', 'Processing', 'Completed'], default: 'Pending' },
    },
  ],
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;