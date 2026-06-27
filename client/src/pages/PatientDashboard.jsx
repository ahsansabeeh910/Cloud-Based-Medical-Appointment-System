import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiCalendar, FiClock, FiCheckCircle, FiFileText,
  FiSearch, FiUser, FiArrowRight
} from 'react-icons/fi';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments, updateAppointment } from '../services/api';
import { toast } from 'react-toastify';
import './PatientDashboard.css';

const SAMPLE_APPOINTMENTS = [
  { id: '1', doctorName: 'Dr. Sarah Johnson', specialization: 'Cardiology', date: '2026-07-02', time: '10:00 AM', status: 'approved', reason: 'Regular heart checkup' },
  { id: '2', doctorName: 'Dr. Priya Sharma', specialization: 'Dermatology', date: '2026-07-05', time: '02:30 PM', status: 'pending', reason: 'Skin rash consultation' },
  { id: '3', doctorName: 'Dr. Rajesh Patel', specialization: 'Orthopedics', date: '2026-06-20', time: '11:00 AM', status: 'completed', reason: 'Knee pain follow-up' },
  { id: '4', doctorName: 'Dr. Vikram Singh', specialization: 'Neurology', date: '2026-06-15', time: '09:30 AM', status: 'completed', reason: 'Migraine treatment' },
  { id: '5', doctorName: 'Dr. Ananya Gupta', specialization: 'Pediatrics', date: '2026-06-10', time: '03:00 PM', status: 'cancelled', reason: 'Child vaccination' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments();
      setAppointments(Array.isArray(data) ? data : (data.data || data.appointments || []));
    } catch {
      setAppointments(SAMPLE_APPOINTMENTS);
    }
    setLoading(false);
  };

  const upcoming = appointments.filter(a => {
    if (a.status === 'cancelled' || a.status === 'rejected') return false;
    if (!a.date) return ['approved', 'pending'].includes(a.status);
    const aptDate = new Date(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today;
  });
  const completed = appointments.filter(a => a.status === 'completed');
  const total = appointments.length;

  const handleAction = async (action, id) => {
    if (action === 'cancelled') {
      try {
        await updateAppointment(id, { status: 'cancelled' });
      } catch {
        // Demo mode fallback
      }
      setAppointments(prev => prev.map(a => (a.id === id || a._id === id) ? { ...a, status: 'cancelled' } : a));
      toast.info('Appointment cancelled');
    } else if (action === 'view') {
      try {
        const { getPrescriptionsByAppointment, downloadPrescription } = await import('../services/api');
        const { data: presData } = await getPrescriptionsByAppointment(id);
        
        if (presData?.data && presData.data.length > 0) {
          const presId = presData.data[0]._id;
          const { data } = await downloadPrescription(presId);
          if (data?.data?.downloadUrl) {
            window.open(data.data.downloadUrl, '_blank');
          } else {
            toast.error('Could not load prescription');
          }
        } else {
          toast.error('No prescription found for this appointment');
        }
      } catch (err) {
        console.error(err);
        toast.error('No prescription found for this appointment');
      }
    }
  };

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div className="dashboard-welcome glass-card animate-fadeInUp">
          <h1>Welcome back, <span className="gradient-text">{user?.name || 'Patient'}</span>! 👋</h1>
          <p>Here's an overview of your healthcare activity</p>
        </div>

        <div className="dashboard-stats">
          <StatsCard icon={<FiCalendar />} value={total} label="Total Appointments" gradient="var(--gradient-primary)" index={0} />
          <StatsCard icon={<FiClock />} value={upcoming.length} label="Upcoming" gradient="var(--gradient-secondary)" index={1} />
          <StatsCard icon={<FiCheckCircle />} value={completed.length} label="Completed" gradient="var(--gradient-purple)" index={2} />
          <StatsCard icon={<FiFileText />} value={completed.length} label="Prescriptions" gradient="var(--gradient-warm)" index={3} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/appointments" className="btn btn-ghost">View All <FiArrowRight size={14} /></Link>
          </div>
          <div className="dashboard-appointments-list">
            {upcoming.length > 0 ? (
              upcoming.slice(0, 3).map((apt, i) => (
                <AppointmentCard key={apt._id || apt.id} appointment={apt} role="patient" onAction={handleAction} index={i} />
              ))
            ) : (
              <div className="dashboard-empty glass-card">
                <p>No upcoming appointments. <Link to="/doctors" style={{ color: 'var(--primary-light)' }}>Find a doctor</Link> to book one!</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="dashboard-quick-actions">
            <div className="quick-action-card glass-card glass-card-hover" onClick={() => navigate('/doctors')}>
              <div className="quick-action-icon" style={{ background: 'var(--gradient-primary)' }}><FiSearch /></div>
              <h4>Find a Doctor</h4>
              <p>Search specialists near you</p>
            </div>
            <div className="quick-action-card glass-card glass-card-hover" onClick={() => navigate('/appointments')}>
              <div className="quick-action-icon" style={{ background: 'var(--gradient-secondary)' }}><FiCalendar /></div>
              <h4>My Appointments</h4>
              <p>View all your appointments</p>
            </div>
            <div className="quick-action-card glass-card glass-card-hover" onClick={() => navigate('/profile')}>
              <div className="quick-action-icon" style={{ background: 'var(--gradient-purple)' }}><FiUser /></div>
              <h4>My Profile</h4>
              <p>Update your information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
