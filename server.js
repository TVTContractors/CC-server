const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const paymentRoutes = require('./routes/payment');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mern-auth-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define routes here
app.use('/api', require('./routes/auth'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/Orders'));
app.use('/api/payment', paymentRoutes);


app.listen(7001, () => console.log('Server running on port 7001'));
