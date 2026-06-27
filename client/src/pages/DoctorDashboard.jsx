import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiCalendar, FiClock, FiUsers, FiStar,
  FiUser, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments } from '../services/api';
import { toast } from 'react-toastify';
import './PatientDashboard.css';
import './DoctorDashboard.css';

const SAMPLE_APPOINTMENTS = [
  { id: '1', patientName: 'Rahul Mehta', patientEmail: 'rahul@email.com', date: '2026-07-02', time: '09:00 AM', status: 'pending', reason: 'Chest pain for 2 weeks' },
  { id: '2', patientName: 'Priya Kumar', patientEmail: 'priya@email.com', date: '2026-07-02', time: '10:00 AM', status: 'pending', reason: 'Follow-up on blood pressure' },
  { id: '3', patientName: 'Deepak Joshi', patientEmail: 'deepak@email.com', date: '2026-07-02', time: '11:30 AM', status: 'approved', reason: 'Annual health checkup' },
  { id: '4', patientName: 'Sneha Rao', patientEmail: 'sneha@email.com', date: '2026-07-01', time: '02:00 PM', status: 'completed', reason: 'Breathing difficulties' },
  { id: '5', patientName: 'Amit Sharma', patientEmail: 'amit@email.com', date: '2026-06-30', time: '03:30 PM', status: 'completed', reason: 'Heart palpitations' },
  { id: '6', patientName: 'Kavita Singh', patientEmail: 'kavita@email.com', date: '2026-06-28', time: '09:30 AM', status: 'cancelled', reason: 'Regular checkup' },
];

const TODAY_SCHEDULE = [
  { time: '09:00 AM', patient: 'Rahul Mehta', reason: 'Chest pain' },
  { time: '10:00 AM', patient: 'Priya Kumar', reason: 'BP Follow-up' },
  { time: '11:30 AM', patient: 'Deepak Joshi', reason: 'Health checkup' },
  { time: '02:00 PM', patient: 'Sneha Rao', reason: 'Breathing difficulties' },
];

export default function DoctorDashboard() {
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

  const pending = appointments.filter(a => a.status === 'pending');
  const todayAppts = appointments.filter(a => a.status === 'approved' || a.status === 'pending');
  const totalPatients = new Set(appointments.map(a => a.patientName || a.patient?.name)).size;

  const handleAction = async (action, id, file = null) => {
    if (action === 'upload_prescription' && file) {
      const toastId = toast.loading('Uploading prescription...');
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('appointmentId', id);
        
        const api = await import('../services/api');
        await api.uploadPrescription(formData);
        
        toast.update(toastId, { render: 'Prescription uploaded successfully!', type: 'success', isLoading: false, autoClose: 3000 });
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to upload prescription';
        toast.update(toastId, { render: errorMsg, type: 'error', isLoading: false, autoClose: 4000 });
      }
      return;
    }

    if (action === 'view') {
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
      return;
    }

    try {
      if (['approved', 'rejected', 'completed'].includes(action)) {
        const { updateAppointment } = await import('../services/api');
        await updateAppointment(id, { status: action });
      }
    } catch {
      // Demo mode fallback
    }

    setAppointments(prev =>
      prev.map(a => (a.id === id || a._id === id) ? { ...a, status: action } : a)
    );
    const msg = action === 'approved' ? 'Appointment approved!' : action === 'rejected' ? 'Appointment rejected' : action === 'completed' ? 'Appointment marked completed' : 'Updated';
    toast.success(msg);
  };

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div className="dashboard-welcome glass-card animate-fadeInUp">
          <h1>Good morning, <span className="gradient-text-secondary">{user?.name || 'Doctor'}</span>! 🩺</h1>
          <p>Here's your practice overview for today</p>
        </div>

        <div className="dashboard-stats">
          <StatsCard icon={<FiCalendar />} value={todayAppts.length} label="Today's Appointments" gradient="var(--gradient-primary)" index={0} />
          <StatsCard icon={<FiClock />} value={pending.length} label="Pending Approval" gradient="var(--gradient-warm)" index={1} />
          <StatsCard icon={<FiUsers />} value={totalPatients} label="Total Patients" gradient="var(--gradient-secondary)" index={2} />
          <StatsCard icon={<FiStar />} value="4.9" label="Average Rating" gradient="var(--gradient-purple)" index={3} />
        </div>

        {pending.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>⏳ Pending Approvals</h2>
              <Link to="/appointments" className="btn btn-ghost">View All <FiArrowRight size={14} /></Link>
            </div>
            <div className="dashboard-appointments-list">
              {pending.slice(0, 3).map((apt, i) => (
                <AppointmentCard key={apt._id || apt.id} appointment={apt} role="doctor" onAction={handleAction} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>📅 Today's Schedule</h2>
          </div>
          <div className="schedule-timeline glass-card" style={{ padding: 'var(--space-4)' }}>
            {TODAY_SCHEDULE.map((item, i) => (
              <div key={i} className="schedule-item animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}>
                <span className="schedule-time">{item.time}</span>
                <div className="schedule-patient">
                  <h4>{item.patient}</h4>
                  <p>{item.reason}</p>
                </div>
                <span className="badge badge-approved">Confirmed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="dashboard-quick-actions">
            <div className="quick-action-card glass-card glass-card-hover" onClick={() => navigate('/appointments')}>
              <div className="quick-action-icon" style={{ background: 'var(--gradient-primary)' }}><FiCalendar /></div>
              <h4>All Appointments</h4>
              <p>Manage your schedule</p>
            </div>
            <div className="quick-action-card glass-card glass-card-hover" onClick={() => navigate('/profile')}>
              <div className="quick-action-icon" style={{ background: 'var(--gradient-secondary)' }}><FiUser /></div>
              <h4>My Profile</h4>
              <p>Update your details</p>
            </div>
            <div className="quick-action-card glass-card glass-card-hover" onClick={() => navigate('/doctor/reports')}>
              <div className="quick-action-icon" style={{ background: 'var(--gradient-purple)' }}><FiCheckCircle /></div>
              <h4>Reports</h4>
              <p>View practice analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
