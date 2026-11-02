const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    unique: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Table capacity is required'],
    min: 1,
    max: 20,
  },
  location: {
    type: String,
    enum: ['Indoor', 'Outdoor Patio', 'Window Side', 'Private Lounge'],
    default: 'Indoor',
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Occupied', 'Maintenance'],
    default: 'Available',
  },
  features: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Table', tableSchema);
