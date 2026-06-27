import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorSearch from './pages/DoctorSearch';
import BookAppointment from './pages/BookAppointment';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AppointmentHistory from './pages/AppointmentHistory';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loader">
        <div className="app-loader-spinner">
          <div className="spinner spinner-lg"></div>
        </div>
        <p className="app-loader-text">Loading MediConnect...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />
          : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated
          ? <Navigate to={user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />
          : <Register />
      } />
      <Route path="/doctors" element={<DoctorSearch />} />

      {/* Protected Patient Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctors/:id/book" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <BookAppointment />
        </ProtectedRoute>
      } />

      {/* Protected Doctor Routes */}
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor/reports" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* Protected Shared Routes */}
      <Route path="/appointments" element={
        <ProtectedRoute>
          <AppointmentHistory />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="app-main">
            <AppRoutes />
          </main>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
