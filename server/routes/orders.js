/**
 * server/routes/orders.js
 * GET   /api/orders                -> list all orders
 * POST  /api/orders                -> place a new order (reduces stock + sends "order placed" notification)
 * PUT   /api/orders/:id/status     -> update order status
 * POST  /api/orders/:id/ship       -> mark Shipped (sends "shipped" notification to the customer)
 */
const express = require('express');
const router = express.Router();
const store = require('../data/store');
const collectionsRoute = require('./collections');

router.get('/', (req, res) => {
  res.json(store.getOrders());
});

router.post('/', (req, res) => {
  const { userId, userName, userPhone, items, subtotal, delivery, total, shippingAddress, paymentLast4 } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }
  const order = store.addOrder({
    userId, userName, userPhone, items, subtotal, delivery, total, shippingAddress, paymentLast4,
  });

  // Stock is reduced immediately at checkout (matches existing frontend behavior).
  // Items can come from the main product catalog OR from a collection
  // (Gift Box / Combo / New Arrivals — ids like "col_1"). Both reducers
  // safely no-op for ids they don't recognize, so it's safe to try both
  // for every item rather than needing to know in advance which list an
  // item belongs to.
  store.reduceStockForOrder(items);
  items.forEach((item) => {
    collectionsRoute.reduceCollectionStock(item.productId, item.qty);
  });

  // Notify the customer that their order was placed successfully
  store.addNotification(`Your order ${order.id} has been placed successfully!`, 'order', userId);

  res.status(201).json(order);
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'status is required' });
  const updated = store.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ message: 'Order not found' });
  res.json(updated);
});

/**
 * Mark an order as Shipped.
 * NOTE: stock is reduced at the time of order placement (POST /api/orders),
 * matching the existing frontend behavior. This endpoint only:
 *   1. Sets order status to "Shipped"
 *   2. Creates a notification for the customer (so the user
 *      dashboard bell + banner can pick it up)
 */
router.post('/:id/ship', (req, res) => {
  const updated = store.updateOrderStatus(req.params.id, 'Shipped');
  if (!updated) return res.status(404).json({ message: 'Order not found' });

  store.addNotification(`Your order ${updated.id} has been shipped!`, 'shipping', updated.userId);

  res.json(updated);
});

module.exports = router;
