const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Get all reservations
router.get('/', async (req, res) => {
  try {
    const { algorithm } = req.query;

    const reservations = await Reservation.find();

    let sortedReservations;

    if (algorithm === 'fifo') {
      sortedReservations = reservations.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (algorithm === 'lifo') {
      sortedReservations = reservations.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      sortedReservations = reservations;
    }

    // keep order: pending, confirmed, cancelled
    sortedReservations = sortedReservations.sort((a, b) => {
      const order = ['Pending', 'Confirmed', 'Cancelled'];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });

    res.status(200).json(sortedReservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new reservation
router.post('/', async (req, res) => {
  const reservation = new Reservation(req.body);
  try {
    const savedReservation = await reservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reservation status
router.put('/:id/status', async (req, res) => {
  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(500).json({ error: 'Error updating reservation' });
  }
});

module.exports = router;
