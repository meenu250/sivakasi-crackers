/**
 * server/routes/notifications.js
 * GET  /api/notifications/user/:userId        -> all notifications for a user
 * GET  /api/notifications/user/:userId/unread -> unread count for a user
 * POST /api/notifications/user/:userId/read   -> mark all as read for a user
 */
const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/user/:userId', (req, res) => {
  res.json(store.getNotificationsForUser(req.params.userId));
});

router.get('/user/:userId/unread', (req, res) => {
  res.json({ count: store.getUnreadCountForUser(req.params.userId) });
});

router.post('/user/:userId/read', (req, res) => {
  store.markAllNotificationsRead(req.params.userId);
  res.json({ message: 'Marked as read' });
});

module.exports = router;
