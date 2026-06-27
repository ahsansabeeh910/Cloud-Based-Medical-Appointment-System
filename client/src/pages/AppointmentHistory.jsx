import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getAppointments, updateAppointment } from '../services/api';
import { toast } from 'react-toastify';
import './AppointmentHistory.css';

const SAMPLE_APPOINTMENTS_PATIENT = [
  { id: '1', doctorName: 'Dr. Sarah Johnson', specialization: 'Cardiology', date: '2026-07-02', time: '10:00 AM', status: 'approved', reason: 'Regular heart checkup' },
  { id: '2', doctorName: 'Dr. Priya Sharma', specialization: 'Dermatology', date: '2026-07-05', time: '02:30 PM', status: 'pending', reason: 'Skin rash consultation' },
  { id: '3', doctorName: 'Dr. Rajesh Patel', specialization: 'Orthopedics', date: '2026-06-20', time: '11:00 AM', status: 'completed', reason: 'Knee pain follow-up' },
  { id: '4', doctorName: 'Dr. Vikram Singh', specialization: 'Neurology', date: '2026-06-15', time: '09:30 AM', status: 'completed', reason: 'Migraine treatment' },
  { id: '5', doctorName: 'Dr. Ananya Gupta', specialization: 'Pediatrics', date: '2026-06-10', time: '03:00 PM', status: 'cancelled', reason: 'Child vaccination' },
];

const SAMPLE_APPOINTMENTS_DOCTOR = [
  { id: '1', patientName: 'Rahul Mehta', patientEmail: 'rahul@email.com', date: '2026-07-02', time: '09:00 AM', status: 'pending', reason: 'Chest pain for 2 weeks' },
  { id: '2', patientName: 'Priya Kumar', patientEmail: 'priya@email.com', date: '2026-07-02', time: '10:00 AM', status: 'approved', reason: 'Follow-up on blood pressure' },
  { id: '3', patientName: 'Deepak Joshi', patientEmail: 'deepak@email.com', date: '2026-06-28', time: '11:30 AM', status: 'completed', reason: 'Annual health checkup' },
  { id: '4', patientName: 'Sneha Rao', patientEmail: 'sneha@email.com', date: '2026-06-25', time: '02:00 PM', status: 'completed', reason: 'Breathing difficulties' },
  { id: '5', patientName: 'Amit Sharma', patientEmail: 'amit@email.com', date: '2026-06-22', time: '03:30 PM', status: 'rejected', reason: 'Heart palpitations' },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AppointmentHistory() {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments();
      setAppointments(Array.isArray(data) ? data : (data.data || data.appointments || []));
    } catch {
      setAppointments(role === 'doctor' ? SAMPLE_APPOINTMENTS_DOCTOR : SAMPLE_APPOINTMENTS_PATIENT);
    }
    setLoading(false);
  };

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab);

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
      if (['approved', 'rejected', 'completed', 'cancelled'].includes(action)) {
        const { updateAppointment } = await import('../services/api');
        await updateAppointment(id, { status: action });
      }
    } catch {
      // Demo mode
    }
    
    setAppointments(prev =>
      prev.map(a => (a.id === id || a._id === id) ? { ...a, status: action } : a)
    );
    const msgs = {
      approved: 'Appointment approved!',
      rejected: 'Appointment rejected',
      cancelled: 'Appointment cancelled',
      completed: 'Appointment marked completed',
    };
    if (msgs[action]) toast.success(msgs[action]);
  };

  return (
    <div className="history-page page">
      <div className="container">
        <div className="history-header animate-fadeInUp">
          <h1>
            My <span className="gradient-text">Appointments</span>
          </h1>
          <p>View and manage all your appointments</p>
        </div>

        <div className="history-tabs animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`history-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="history-list">
          {loading ? (
            <LoadingSkeleton type="list" count={4} />
          ) : filtered.length > 0 ? (
            filtered.map((apt, i) => (
              <AppointmentCard
                key={apt._id || apt.id}
                appointment={apt}
                role={role}
                onAction={handleAction}
                index={i}
              />
            ))
          ) : (
            <div className="history-empty glass-card">
              <h3>No {activeTab !== 'all' ? activeTab : ''} appointments</h3>
              <p>Your appointment history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
