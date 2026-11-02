const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// GET /api/tables
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({ success: true, count: tables.length, tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tables (Admin)
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, location, status, features } = req.body;

    const exists = await Table.findOne({ tableNumber });
    if (exists) {
      return res.status(400).json({ success: false, message: `Table #${tableNumber} already exists` });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      location: location || 'Indoor',
      status: status || 'Available',
      features: Array.isArray(features)
        ? features
        : typeof features === 'string' && features.trim() !== ''
        ? features.split(',').map((s) => s.trim())
        : [],
    });

    res.status(201).json({ success: true, message: 'Table created', table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/tables/:id (Admin)
const updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, location, status, features } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (tableNumber !== undefined) table.tableNumber = tableNumber;
    if (capacity !== undefined) table.capacity = capacity;
    if (location !== undefined) table.location = location;
    if (status !== undefined) table.status = status;
    if (features !== undefined) {
      table.features = Array.isArray(features)
        ? features
        : typeof features === 'string'
        ? features.split(',').map((s) => s.trim()).filter(Boolean)
        : table.features;
    }

    await table.save();
    res.json({ success: true, message: 'Table updated', table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/tables/:id (Admin)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    await Reservation.deleteMany({ table: table._id });
    await Table.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Table removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable };
