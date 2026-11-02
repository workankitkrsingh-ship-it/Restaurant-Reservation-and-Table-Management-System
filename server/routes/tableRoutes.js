const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTables)
  .post(protect, adminOnly, createTable);

router.route('/:id')
  .put(protect, adminOnly, updateTable)
  .delete(protect, adminOnly, deleteTable);

module.exports = router;
