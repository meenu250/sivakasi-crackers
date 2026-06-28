const express = require('express');
const router = express.Router();
const store = require('../data/store');
router.get('/', (req, res) => res.json(store.getIncomes ? store.getIncomes() : []));
router.post('/', (req, res) => {
  const { title, amount, category, note, date } = req.body;
  if (!title || !amount) return res.status(400).json({ message: 'Title and amount required' });
  const inc = store.addIncome({ title, amount: parseFloat(amount), category: category || 'Other', note: note || '', date: date || new Date().toISOString() });
  res.status(201).json(inc);
});
router.delete('/:id', (req, res) => {
  if (store.deleteIncome) store.deleteIncome(Number(req.params.id));
  res.json({ success: true });
});
module.exports = router;
