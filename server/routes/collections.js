/**
 * Collections: giftbox | combo | new_arrivals
 * Each collection stores a list of product-like items (with name, price, mrp, desc, image, stock)
 */
const express = require('express');
const router  = express.Router();

// In-memory store, seeded with starter products so Gift Boxes, Combos,
// and New Arrivals aren't empty on first run. Admin can add/edit/delete
// more from the Admin Dashboard → Collections tab.
let collections = {
  giftbox: [
    { id: 'col_1', name: 'Diwali Family Gift Box', desc: 'Assorted crackers for the whole family — rockets, fountains, flower pots & more', price: 999, mrp: 1299, stock: 40, image: '', createdAt: new Date().toISOString() },
    { id: 'col_2', name: 'Premium Celebration Box', desc: 'Our top-selling premium crackers in a gift-ready box', price: 1799, mrp: 2299, stock: 25, image: '', createdAt: new Date().toISOString() },
    { id: 'col_3', name: 'Kids Special Gift Box', desc: 'Safe sparklers and low-noise crackers for children', price: 599, mrp: 799, stock: 50, image: '', createdAt: new Date().toISOString() },
  ],
  combo: [
    { id: 'col_4', name: 'Starter Combo Pack', desc: 'Sparklers + Fountains + Wheels — perfect mini combo', price: 499, mrp: 650, stock: 60, image: '', createdAt: new Date().toISOString() },
    { id: 'col_5', name: 'Family Combo Pack', desc: 'Rockets, Bombettes, Fountains, Flower Pots — everything for the family', price: 1499, mrp: 1899, stock: 30, image: '', createdAt: new Date().toISOString() },
    { id: 'col_6', name: 'Mega Value Combo', desc: 'Our biggest combo — 12 varieties of crackers', price: 2499, mrp: 3199, stock: 18, image: '', createdAt: new Date().toISOString() },
  ],
  new_arrivals: [
    { id: 'col_7', name: 'Galaxy Glitter Rocket', desc: 'New! Multi-stage rocket with glitter trail effect', price: 280, mrp: 350, stock: 45, image: '', createdAt: new Date().toISOString() },
    { id: 'col_8', name: 'Rainbow Fountain Deluxe', desc: 'New! 7-color rainbow fountain, 90 seconds burn time', price: 220, mrp: 280, stock: 35, image: '', createdAt: new Date().toISOString() },
    { id: 'col_9', name: 'Twin Whistle Chakri', desc: 'New! Dual-tone whistling ground spinner', price: 90, mrp: 130, stock: 70, image: '', createdAt: new Date().toISOString() },
  ],
};
let nextId = 10;

// GET /api/collections/:type
router.get('/:type', (req, res) => {
  const list = collections[req.params.type];
  if (!list) return res.status(400).json({ message: 'Unknown collection' });
  res.json(list);
});

// POST /api/collections/:type  — add item
router.post('/:type', (req, res) => {
  const list = collections[req.params.type];
  if (!list) return res.status(400).json({ message: 'Unknown collection' });
  const { name, desc, price, mrp, stock, image } = req.body;
  if (!name || !price || !stock) return res.status(400).json({ message: 'name, price, stock required' });
  const item = { id: `col_${nextId++}`, name, desc: desc || '', price: parseFloat(price), mrp: parseFloat(mrp || price), stock: parseInt(stock), image: image || '', createdAt: new Date().toISOString() };
  list.unshift(item);
  res.status(201).json(item);
});

// PUT /api/collections/:type/:id — edit item
router.put('/:type/:id', (req, res) => {
  const list = collections[req.params.type];
  if (!list) return res.status(400).json({ message: 'Unknown collection' });
  const idx = list.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  const { name, desc, price, mrp, stock, image } = req.body;
  list[idx] = { ...list[idx], name: name || list[idx].name, desc: desc ?? list[idx].desc, price: parseFloat(price || list[idx].price), mrp: parseFloat(mrp || list[idx].mrp), stock: parseInt(stock ?? list[idx].stock), image: image !== undefined ? image : list[idx].image };
  res.json(list[idx]);
});

// DELETE /api/collections/:type/:id
router.delete('/:type/:id', (req, res) => {
  const list = collections[req.params.type];
  if (!list) return res.status(400).json({ message: 'Unknown collection' });
  collections[req.params.type] = list.filter(i => i.id !== req.params.id);
  res.json({ success: true });
});

/**
 * Reduces stock for a collection item by id, searching across all three
 * collection types (giftbox / combo / new_arrivals). Used by the orders
 * route so that ordering a Gift Box / Combo / New Arrival item actually
 * decrements its stock — the main product catalog and collection items
 * are stored separately, so this can't be done through store.js alone.
 * Returns true if a matching item was found and updated.
 */
function reduceCollectionStock(itemId, qty) {
  for (const type of Object.keys(collections)) {
    const item = collections[type].find((i) => i.id === itemId);
    if (item) {
      item.stock = Math.max(0, item.stock - qty);
      return true;
    }
  }
  return false;
}

module.exports = router;
module.exports.reduceCollectionStock = reduceCollectionStock;
