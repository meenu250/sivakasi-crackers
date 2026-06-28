/**
 * server/routes/bills.js
 * GET  /api/bills   -> list all bills
 * POST /api/bills   -> create a new bill
 */
const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  res.json(store.getBills());
});

router.post('/', (req, res) => {
  const { items, subtotal, tax, taxPct, total, customerName, customerPhone } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Bill must contain at least one item' });
  }
  const bill = store.createBill({ items, subtotal, tax, taxPct, total, customerName, customerPhone });
  res.status(201).json(bill);
});

module.exports = router;
