/**
 * server/routes/products.js
 * GET    /api/products            -> list all products
 * POST   /api/products             -> add a new product (admin)
 * PUT    /api/products/:id         -> update a product (admin)
 * DELETE /api/products/:id         -> delete a product (admin)
 * POST   /api/products/:id/stock   -> add stock to a product (admin)
 */
const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  res.json(store.getProducts());
});

router.post('/', (req, res) => {
  const { name, category, price, mrp, stock, desc, lowStockThreshold } = req.body;
  if (!name || !price || !mrp || stock === undefined) {
    return res.status(400).json({ message: 'name, price, mrp and stock are required' });
  }
  const product = store.addProduct({ name, category, price, mrp, stock, desc, lowStockThreshold });
  res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const updated = store.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Product not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  store.deleteProduct(req.params.id);
  res.json({ message: 'Product deleted' });
});

router.post('/:id/stock', (req, res) => {
  const { qty } = req.body;
  if (qty === undefined) return res.status(400).json({ message: 'qty is required' });
  const updated = store.addStockToProduct(req.params.id, qty);
  if (!updated) return res.status(404).json({ message: 'Product not found' });
  res.json(updated);
});

module.exports = router;
