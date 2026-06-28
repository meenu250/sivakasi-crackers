/**
 * src/api/orders.js
 * Replaces the order-related functions from utils/storage.js.
 */
import client from './client';

export const getOrders = async () => {
  const { data } = await client.get('/orders');
  return data;
};

export const addOrder = async (orderData) => {
  const { data } = await client.post('/orders', orderData);
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await client.put(`/orders/${orderId}/status`, { status });
  return data;
};

/**
 * Marks an order as Shipped on the server. The server handles
 * creating the customer notification — the frontend just needs
 * to call this single endpoint.
 */
export const shipOrder = async (orderId) => {
  const { data } = await client.post(`/orders/${orderId}/ship`);
  return data;
};
