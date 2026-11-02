const express = require('express');
const router = express.Router();
const {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getReservations)
  .post(protect, createReservation);

router.patch('/:id/status', protect, updateReservationStatus);
router.delete('/:id', protect, deleteReservation);

module.exports = router;
