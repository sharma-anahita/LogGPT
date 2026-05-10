import axios from "axios";

// On Vercel: set NEXT_PUBLIC_API_URL to your Render backend URL
// e.g. https://loggpt-backend.onrender.com/api
// Locally: falls back to localhost:5000
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function registerUser(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
  });
  return response.data;
}

export async function loginUser(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
}

export async function googleSignIn(idToken) {
  const response = await axios.post(`${API_BASE_URL}/auth/google`, {
    id_token: idToken,
  });
  return response.data;
}

export function saveToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
}

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
}

export function isAuthenticated() {
  return !!getToken();
}