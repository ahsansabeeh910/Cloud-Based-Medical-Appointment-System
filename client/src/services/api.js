import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Doctors
export const getDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => API.get(`/doctors/${id}`);

// Slots
export const getSlots = (doctorId, date) => API.get(`/doctors/${doctorId}/slots`, { params: { date } });

// Appointments
export const bookAppointment = (data) => API.post('/appointments', data);
export const getAppointments = (params) => API.get('/appointments', { params });
export const updateAppointment = (id, data) => API.patch(`/appointments/${id}`, data);
export const cancelAppointment = (id) => API.delete(`/appointments/${id}`);

// Prescriptions
export const uploadPrescription = async (data) => {
  const token = localStorage.getItem('token');
  const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/prescriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error('Upload failed');
    error.response = { data: json };
    throw error;
  }
  return { data: json };
};
export const getPrescriptionsByAppointment = (appointmentId) => API.get(`/prescriptions/appointment/${appointmentId}`);
export const downloadPrescription = (id) => API.get(`/prescriptions/${id}/download`);

export default API;
