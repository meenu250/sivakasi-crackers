/**
 * src/api/auth.js
 * Replaces registerUser / getUserByPhone from utils/storage.js,
 * plus the admin credential check that used to live inline in
 * the login pages.
 *
 * Errors thrown here carry a `.message` from the server's JSON
 * response (e.g. "User not found", "Wrong password"), so call
 * sites can keep using the same try/catch or .catch() pattern.
 */
import client from './client';

function extractMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

export const registerUser = async (formData) => {
  try {
    const { data } = await client.post('/auth/register', formData);
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, 'Registration failed'));
  }
};

/**
 * Customer login. Resolves with the user object, or rejects
 * with an Error whose .message is suitable for display
 * (e.g. "User not found" / "Wrong password").
 */
export const loginUser = async (phone, password) => {
  try {
    const { data } = await client.post('/auth/login', { phone, password });
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, 'Login failed'));
  }
};

/**
 * Admin login. Completely separate endpoint from customer login —
 * no shared form, no shared code path.
 */
export const loginAdmin = async (username, password) => {
  try {
    const { data } = await client.post('/auth/admin-login', { username, password });
    return data;
  } catch (err) {
    throw new Error(extractMessage(err, 'Invalid admin credentials'));
  }
};
