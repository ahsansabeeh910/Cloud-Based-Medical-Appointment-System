import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiCalendar, FiClock, FiUsers,
  FiUser, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import DigitalPrescriptionModal from '../components/DigitalPrescriptionModal';
import { getAppointments, getProfile, updateDoctorProfile } from '../services/api';
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



export default function DoctorDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.doctorProfile?.isAvailable !== false);
  const [doctorProfileId, setDoctorProfileId] = useState(user?.doctorProfile?._id || null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [rxModalAppointment, setRxModalAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctorStatus();
  }, []);

  const fetchDoctorStatus = async () => {
    try {
      const { data } = await getProfile();
      const docProf = data?.data?.doctorProfile;
      if (docProf) {
        setDoctorProfileId(docProf._id);
        setIsAvailable(docProf.isAvailable !== false);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleAvailability = async () => {
    if (!doctorProfileId) {
      toast.error('Doctor profile not found');
      return;
    }
    setTogglingStatus(true);
    const nextState = !isAvailable;
    try {
      await updateDoctorProfile(doctorProfileId, { isAvailable: nextState });
      setIsAvailable(nextState);
      if (user?.doctorProfile) {
        updateUser({
          ...user,
          doctorProfile: { ...user.doctorProfile, isAvailable: nextState },
        });
      }
      toast.success(
        nextState
          ? '🟢 You are now Available for new patient bookings!'
          : '🟠 Status set to On Leave / Busy. Patients will be suggested available specialists.'
      );
    } catch {
      toast.error('Failed to update availability status');
    }
    setTogglingStatus(false);
  };

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
    if (action === 'write_prescription') {
      setRxModalAppointment(file);
      return;
    }

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
        <div
          className="dashboard-welcome glass-card animate-fadeInUp"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
        >
          <div>
            <h1>Good morning, <span className="gradient-text-secondary">{user?.name || 'Doctor'}</span>! 🩺</h1>
            <p>Here's your practice overview for today</p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isAvailable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
              padding: '10px 16px',
              borderRadius: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Practice Status</div>
              <div style={{ fontWeight: 700, color: isAvailable ? '#10b981' : '#f59e0b' }}>
                {isAvailable ? '🟢 Available for Bookings' : '🟠 On Leave / Busy'}
              </div>
            </div>
            <button
              className={`btn btn-sm ${isAvailable ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleToggleAvailability}
              disabled={togglingStatus}
            >
              {togglingStatus ? 'Updating...' : isAvailable ? 'Set On Leave' : 'Set Available'}
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatsCard icon={<FiCalendar />} value={todayAppts.length} label="Today's Appointments" gradient="var(--gradient-primary)" index={0} />
          <StatsCard icon={<FiClock />} value={pending.length} label="Pending Approval" gradient="var(--gradient-warm)" index={1} />
          <StatsCard icon={<FiUsers />} value={totalPatients} label="Total Patients" gradient="var(--gradient-secondary)" index={2} />
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
            {appointments.filter(a => a.status === 'approved').length > 0 ? (
              appointments.filter(a => a.status === 'approved').map((item, i) => (
                <div key={item._id || i} className="schedule-item animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}>
                  <span className="schedule-time">{item.timeSlot || item.time || 'N/A'}</span>
                  <div className="schedule-patient">
                    <h4>{item.patientName || item.patient?.name || 'Patient'}</h4>
                    <p>{item.reason}</p>
                  </div>
                  <span className="badge badge-approved">Confirmed</span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', opacity: 0.7 }}>No confirmed appointments for today.</p>
            )}
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
        {rxModalAppointment && (
          <DigitalPrescriptionModal
            appointment={rxModalAppointment}
            onClose={() => setRxModalAppointment(null)}
            onSuccess={fetchAppointments}
          />
        )}
      </div>
    </div>
  );
}
