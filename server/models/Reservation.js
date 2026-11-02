const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
  },
  customerPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: [true, 'Reservation date is required'],
  },
  timeSlot: {
    type: String, // e.g. "18:00", "19:30"
    required: [true, 'Time slot is required'],
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: 1,
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Seated', 'Completed', 'Cancelled'],
    default: 'Confirmed',
  },
  specialRequests: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Reservation', reservationSchema);
