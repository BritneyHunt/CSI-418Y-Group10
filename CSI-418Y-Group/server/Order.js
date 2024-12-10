const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        addOns: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
          },
        ],
      },
    ],
    total: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Confirmed'], default: 'Pending' },
  });
  
  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;
  
