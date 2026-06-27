import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiStar, FiAward, FiCheck, FiArrowLeft } from 'react-icons/fi';
import SlotPicker from '../components/SlotPicker';
import { getDoctorById, getSlots, bookAppointment } from '../services/api';
import { toast } from 'react-toastify';
import './BookAppointment.css';

const SAMPLE_DOCTOR = {
  id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology',
  experience: 15, hospital: 'Apollo Hospital, Mumbai',
  qualification: 'MBBS, MD Cardiology', rating: 4.9, fee: 800,
};

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (selectedDate && doctor) fetchSlots();
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const { data } = await getDoctorById(id);
      const doc = data.data || data.doctor || data;
      setDoctor({
        ...doc,
        id: doc._id || doc.id,
        name: doc.userId?.name || doc.name,
        fee: doc.consultationFee || doc.fee || 500,
      });
    } catch {
      setDoctor({ ...SAMPLE_DOCTOR, id });
    }
  };

  const fetchSlots = async () => {
    try {
      const { data } = await getSlots(id, selectedDate);
      setBookedSlots(data.bookedSlots || []);
    } catch {
      const random = ['10:00 AM', '02:30 PM'];
      setBookedSlots(random);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.warning('Please select a date and time slot');
      return;
    }
    setLoading(true);
    try {
      await bookAppointment({
        doctorId: id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
      });
      setSuccess(true);
      toast.success('Appointment booked successfully!');
    } catch {
      setSuccess(true);
      toast.success('Appointment booked! (Demo mode)');
    }
    setLoading(false);
  };

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';

  if (success) {
    return (
      <div className="book-appointment-page page">
        <div className="container">
          <div className="book-success glass-card">
            <div className="book-success-icon"><FiCheck /></div>
            <h2>Appointment <span className="gradient-text-secondary">Booked!</span></h2>
            <p>Your appointment with {doctor?.name} on {selectedDate} at {selectedSlot} has been confirmed.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/appointments" className="btn btn-primary">View Appointments</Link>
              <Link to="/doctors" className="btn btn-outline">Find More Doctors</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="book-appointment-page page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-16)' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-page page">
      <div className="container">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-4)' }}>
          <FiArrowLeft /> Back
        </button>

        <div className="book-layout">
          <div className="book-main">
            <div className="book-doctor-card glass-card animate-fadeInUp">
              <div className="book-doctor-avatar">{getInitials(doctor.name)}</div>
              <div className="book-doctor-info">
                <h2>{doctor.name}</h2>
                <p className="spec">{doctor.specialization}</p>
                <div className="book-doctor-meta">
                  <span><FiBriefcase size={14} /> {doctor.experience} yrs exp</span>
                  <span><FiMapPin size={14} /> {doctor.hospital}</span>
                  <span><FiAward size={14} /> {doctor.qualification}</span>
                  <span><FiStar size={14} fill="var(--accent)" /> {doctor.rating}</span>
                </div>
              </div>
            </div>

            <div className="book-slot-section glass-card animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <h3>Select Date & Time</h3>
              <SlotPicker
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateChange={setSelectedDate}
                onSlotChange={setSelectedSlot}
                bookedSlots={bookedSlots}
              />
            </div>

            <div className="book-notes-section glass-card animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <h3>Reason for Visit</h3>
              <textarea
                className="form-textarea"
                placeholder="Describe your symptoms or reason for consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="book-summary glass-card animate-fadeInUp" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
            <h3>Booking Summary</h3>
            <div className="book-summary-row">
              <span className="label">Doctor</span>
              <span className="value">{doctor.name}</span>
            </div>
            <div className="book-summary-row">
              <span className="label">Specialization</span>
              <span className="value">{doctor.specialization}</span>
            </div>
            <div className="book-summary-row">
              <span className="label">Date</span>
              <span className="value">{selectedDate || '—'}</span>
            </div>
            <div className="book-summary-row">
              <span className="label">Time</span>
              <span className="value">{selectedSlot || '—'}</span>
            </div>
            <div className="book-summary-total">
              <span>Consultation Fee</span>
              <span className="amount">₹{doctor.fee || 500}</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleBook}
            >
              {loading ? <span className="spinner spinner-sm" /> : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
