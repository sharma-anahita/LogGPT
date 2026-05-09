import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000/api';
// console.log(API_BASE_URL);

// Register user
export async function registerUser(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
  });
  return response.data;
}

// Login user
export async function loginUser(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
}

// Sign in / register via Google id_token
export async function googleSignIn(idToken) {
  const response = await axios.post(`${API_BASE_URL}/auth/google`, {
    id_token: idToken,
  });
  return response.data;
}

// Save token to localStorage
export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

// Get token from localStorage
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Remove token from localStorage
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getToken();
}
