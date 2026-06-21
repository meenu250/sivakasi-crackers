/**
 * src/api/notifications.js
 * Replaces the notification-related functions from utils/storage.js.
 */
import client from './client';

export const getNotificationsForUser = async (userId) => {
  const { data } = await client.get(`/notifications/user/${userId}`);
  return data;
};

export const getUnreadCountForUser = async (userId) => {
  const { data } = await client.get(`/notifications/user/${userId}/unread`);
  return data.count;
};

export const markAllNotificationsRead = async (userId) => {
  await client.post(`/notifications/user/${userId}/read`);
};
