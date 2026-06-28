/**
 * server/routes/expenses.js
 * GET  /api/expenses      -> list all expenses
 * POST /api/expenses      -> add a new expense entry
 * DELETE /api/expenses/:id -> remove an expense
 */
const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  res.json(store.getExpenses());
});

router.post('/', (req, res) => {
  const { title, amount, category, note, date } = req.body;
  if (!title || !amount) return res.status(400).json({ message: 'Title and amount are required' });
  if (isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ message: 'Amount must be a positive number' });
  const exp = store.addExpense({ title, amount: parseFloat(amount), category: category || 'Other', note: note || '', date: date || new Date().toISOString() });
  res.status(201).json(exp);
});

router.delete('/:id', (req, res) => {
  store.deleteExpense(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
