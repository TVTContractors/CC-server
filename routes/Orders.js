const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Create a new order
router.post('/create', async (req, res) => {
  const { userId, items, totalAmount,
    orderType, customizations
  } = req.body;
  
  try {
    const newOrder = new Order({ userId, items, totalAmount, orderType, customizations });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error creating the order' });
  }
});

// Get all orders for a user
router.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Review an order
router.post('/:orderId/review', async (req, res) => {
  const { orderId } = req.params;
  const { rating, reviewText } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.rating = rating;
    order.reviewText = reviewText;
    await order.save();

    res.status(200).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting review' });
  }
});

// Dashboard

// calculate processing times for each order type
const getProcessingTime = (order) => {
  // in minutes
  let processingTime = 0;
  switch (order.orderType) {
    case 'dine-in':
      processingTime += 30;
    case 'takeaway':
      processingTime += 15;
    case 'delivery':
      processingTime += 20;
    default:
      processingTime += 10;
  }

  // based on number of items
  processingTime += order.items.length * 5;

  return processingTime;
};

// get all orders with complex scheduling algorithm choices
router.get('/', async (req, res) => {
  try {
    const { algorithm } = req.query;

    // fetch all orders and calculate processing time for each
    const orders = await Order.find();
    const ordersWithProcessingTimes = orders.map(order => {
      const processingTime = getProcessingTime(order);
      return {
        ...order.toObject(),
        processingTime,
        completionTime: new Date(order.orderDate.getTime() + processingTime * 60000) // adds processing time in milliseconds
      };
    });

    // apply the selected scheduling algorithm
    let sortedOrders;
    switch (algorithm) {
      case 'priority':
        // priority scheduling by effective completion time (earlier completion times prioritized)
        sortedOrders = ordersWithProcessingTimes.sort((a, b) => a.completionTime - b.completionTime);
        break;
      case 'sjf':
        // sjf: orders with shorter processing times are prioritized
        sortedOrders = ordersWithProcessingTimes.sort((a, b) => a.processingTime - b.processingTime);
        break;
      case 'round-robin':
        // simulate round-robin: group orders by userid and then by orderdate within each group
        sortedOrders = ordersWithProcessingTimes.sort((a, b) => {
          if (a.userId === b.userId) {
            return a.orderDate - b.orderDate;
          }
          return a.userId.localeCompare(b.userId);
        });
        break;
      case 'fifo':
        // fifo: orders with earlier order dates are prioritized
        sortedOrders = ordersWithProcessingTimes.sort((a, b) => a.orderDate - b.orderDate);
        break;
      case 'lifo':
        // lifo: orders with later order dates are prioritized
        sortedOrders = ordersWithProcessingTimes.sort((a, b) => b.orderDate - a.orderDate);
        break;
      default:
        // default to priority scheduling if no valid algorithm is specified
        sortedOrders = ordersWithProcessingTimes.sort((a, b) => a.completionTime - b.completionTime);
        break;
    }

    // keep order: preparing, completed
    sortedOrders = sortedOrders.sort((a, b) => {
      const orderStatuses = ['Preparing', 'Completed'];
      return orderStatuses.indexOf(a.status) - orderStatuses.indexOf(b.status);
    });

    res.status(200).json(sortedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Update an order status
router.put('/:id/status', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order' });
  }
});

module.exports = router;
