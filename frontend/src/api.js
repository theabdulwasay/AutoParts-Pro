import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export const signup = (data) => API.post('/auth/signup/', data);
export const login = (data) => API.post('/auth/login/', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password/', data);
export const verifyOtp = (data) => API.post('/auth/verify-otp/', data);
export const resetPassword = (data) => API.post('/auth/reset-password/', data);
export const getProfile = () => API.get('/auth/profile/');
export const updateProfile = (data) => API.put('/auth/profile/', data);

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => API.get('/categories/');
export const createCategory = (data) => API.post('/categories/', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}/`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}/`);

// ── Parts ─────────────────────────────────────────────────────────────────────
export const getParts = (params) => API.get('/parts/', { params });
export const getPart = (id) => API.get(`/parts/${id}/`);
export const createPart = (data) => API.post('/parts/', data);
export const updatePart = (id, data) => API.put(`/parts/${id}/`, data);
export const deletePart = (id) => API.delete(`/parts/${id}/`);

// ── Customers ─────────────────────────────────────────────────────────────────
export const getCustomers = (params) => API.get('/customers/', { params });
export const getCustomer = (id) => API.get(`/customers/${id}/`);
export const createCustomer = (data) => API.post('/customers/', data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}/`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}/`);

// ── Bookings ──────────────────────────────────────────────────────────────────
export const getBookings = (params) => API.get('/bookings/', { params });
export const getBooking = (id) => API.get(`/bookings/${id}/`);
export const createBooking = (data) => API.post('/bookings/', data);
export const updateBookingStatus = (id, status) =>
  API.patch(`/bookings/${id}/update_status/`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}/`);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => API.get('/dashboard/');

// ── Reviews ───────────────────────────────────────────────────────────────────
export const getReviews = (params) => API.get('/reviews/', { params });
export const createReview = (data) => API.post('/reviews/', data);
export const deleteReview = (id) => API.delete(`/reviews/${id}/`);

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const getWishlist = (params) => API.get('/wishlist/', { params });
export const createWishlistItem = (data) => API.post('/wishlist/', data);
export const deleteWishlistItem = (id) => API.delete(`/wishlist/${id}/`);

export default API;
