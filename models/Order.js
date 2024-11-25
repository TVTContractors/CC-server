const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    required: true
  },
  customizations: {
    addOns: {
      type: String,
      default: ''
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'spicy'],
      default: 'medium'
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  reviewText: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Preparing', 'Completed'],
    default: 'Preparing'
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
