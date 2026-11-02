const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// GET /api/reservations
const getReservations = async (req, res) => {
  try {
    let query = {};
    // Standard users see their own reservations unless admin
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const reservations = await Reservation.find(query)
      .populate('table', 'tableNumber capacity location status')
      .populate('user', 'name email phone')
      .sort({ date: 1, timeSlot: 1, createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, tableId, date, timeSlot, guests, specialRequests } = req.body;

    if (!tableId || !date || !timeSlot || !guests) {
      return res.status(400).json({ success: false, message: 'Please provide table, date, time slot, and guest count' });
    }

    const tableDoc = await Table.findById(tableId);
    if (!tableDoc) {
      return res.status(404).json({ success: false, message: 'Selected table not found' });
    }

    if (Number(guests) > tableDoc.capacity) {
      return res.status(400).json({
        success: false,
        message: `Table #${tableDoc.tableNumber} has a maximum capacity of ${tableDoc.capacity} guests`,
      });
    }

    // Check if table is already reserved for the same date and timeSlot
    const conflicting = await Reservation.findOne({
      table: tableId,
      date,
      timeSlot,
      status: { $in: ['Confirmed', 'Pending', 'Seated'] },
    });

    if (conflicting) {
      return res.status(400).json({
        success: false,
        message: `Table #${tableDoc.tableNumber} is already booked on ${date} at ${timeSlot}`,
      });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      customerName: customerName || req.user.name,
      customerEmail: customerEmail || req.user.email,
      customerPhone: customerPhone || req.user.phone || 'N/A',
      table: tableId,
      date,
      timeSlot,
      guests: Number(guests),
      status: 'Confirmed',
      specialRequests: specialRequests || '',
    });

    // Update table status to Reserved if booking is for today
    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr && tableDoc.status === 'Available') {
      tableDoc.status = 'Reserved';
      await tableDoc.save();
    }

    const populated = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity location status')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed!',
      reservation: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/reservations/:id/status
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id).populate('table');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Only admin or the owner can cancel; only admin can mark Seated / Completed
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this reservation' });
    }

    reservation.status = status;
    await reservation.save();

    // Sync table status automatically when Seated, Completed, or Cancelled
    if (reservation.table) {
      const tableDoc = await Table.findById(reservation.table._id);
      if (tableDoc) {
        if (status === 'Seated') {
          tableDoc.status = 'Occupied';
          await tableDoc.save();
        } else if (status === 'Completed' || status === 'Cancelled') {
          tableDoc.status = 'Available';
          await tableDoc.save();
        } else if (status === 'Confirmed') {
          tableDoc.status = 'Reserved';
          await tableDoc.save();
        }
      }
    }

    const updated = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity location status')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: `Reservation marked as ${status}`,
      reservation: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/reservations/:id
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
};
