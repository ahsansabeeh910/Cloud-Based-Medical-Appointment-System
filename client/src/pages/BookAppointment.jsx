import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiStar, FiAward, FiCheck, FiArrowLeft } from 'react-icons/fi';
import SlotPicker from '../components/SlotPicker';
import { getDoctorById, getDoctors, getSlots, bookAppointment } from '../services/api';
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
  const [alternativeDoctors, setAlternativeDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSelectedDate('');
    setSelectedSlot(null);
    fetchDoctor();
    fetchAlternatives();
  }, [id]);

  useEffect(() => {
    if (selectedDate && doctor) fetchSlots();
  }, [selectedDate]);

  const fetchAlternatives = async () => {
    try {
      const { data } = await getDoctors({ limit: 50 });
      const list = Array.isArray(data) ? data : (data.data || data.doctors || []);
      const formatted = list
        .filter((d) => (d._id || d.id) !== id && d.isAvailable !== false && d.available !== false)
        .map((doc) => ({
          ...doc,
          id: doc._id || doc.id,
          name: doc.userId?.name || doc.name,
          fee: doc.consultationFee || doc.fee || 500,
        }));
      setAlternativeDoctors(formatted);
    } catch {
      setAlternativeDoctors([]);
    }
  };

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
      const slotData = data.data || data;
      setBookedSlots(slotData.bookedSlots || []);
    } catch {
      setBookedSlots([]);
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
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

  const isDoctorUnavailable = doctor.isAvailable === false || doctor.available === false;
  const sameSpecAlternatives = alternativeDoctors.filter(
    (d) =>
      d.specialization?.toLowerCase().slice(0, 6) ===
      doctor.specialization?.toLowerCase().slice(0, 6)
  );
  const otherSpecAlternatives = alternativeDoctors.filter(
    (d) =>
      d.specialization?.toLowerCase().slice(0, 6) !==
      doctor.specialization?.toLowerCase().slice(0, 6)
  );
  const recommendedList = [
    ...sameSpecAlternatives,
    ...otherSpecAlternatives,
  ].slice(0, 4);

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0 }}>{doctor.name}</h2>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      background: isDoctorUnavailable ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                      color: isDoctorUnavailable ? '#f59e0b' : '#10b981',
                      border: `1px solid ${isDoctorUnavailable ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                    }}
                  >
                    {isDoctorUnavailable ? '● Currently On Leave / Busy' : '● Available for Consultation'}
                  </span>
                </div>
                <p className="spec">{doctor.specialization}</p>
                <div className="book-doctor-meta">
                  <span><FiBriefcase size={14} /> {doctor.experience} yrs exp</span>
                  <span><FiMapPin size={14} /> {doctor.hospital}</span>
                  <span><FiAward size={14} /> {doctor.qualification}</span>
                </div>
              </div>
            </div>

            {isDoctorUnavailable && (
              <div
                className="glass-card animate-fadeInUp"
                style={{
                  padding: '20px 24px',
                  borderLeft: '4px solid #f59e0b',
                  background: 'rgba(245, 158, 11, 0.08)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>
                  ⚠️ {doctor.name} ({doctor.specialization}) is Currently On Leave / Busy
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', opacity: 0.9 }}>
                  {sameSpecAlternatives.length > 0
                    ? `We found other ${doctor.specialization} specialists and general doctors who are available right now:`
                    : `No other ${doctor.specialization} specialist is free right now, but these verified specialists from other departments & General Medicine are available for immediate booking:`}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                  {recommendedList.map((alt) => (
                    <div
                      key={alt.id}
                      className="glass-card"
                      style={{
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{alt.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>● Free Now</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                          {alt.specialization}
                        </div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '4px' }}>
                          {alt.hospital} • ₹{alt.fee}
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/doctors/${alt.id}/book`)}
                      >
                        Switch & Book {alt.name.split(' ').slice(0, 2).join(' ')} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="book-slot-section glass-card animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both', opacity: isDoctorUnavailable ? 0.5 : 1, pointerEvents: isDoctorUnavailable ? 'none' : 'auto' }}>
              <h3>Select Date & Time</h3>
              <SlotPicker
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateChange={setSelectedDate}
                onSlotChange={setSelectedSlot}
                bookedSlots={bookedSlots}
              />
            </div>

            {!isDoctorUnavailable && recommendedList.length > 0 && (
              <div
                className="glass-card animate-fadeInUp"
                style={{
                  padding: '16px 20px',
                  borderLeft: '4px solid #0ea5e9',
                  marginTop: 'var(--space-4)',
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary-light)' }}>
                  💡 Need a Different Time or Another Specialist?
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  If your preferred slot with {doctor.name} is busy, these available specialists are also accepting appointments today:
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {recommendedList.slice(0, 3).map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/doctors/${alt.id}/book`)}
                    >
                      🟢 {alt.name} ({alt.specialization})
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              disabled={loading || isDoctorUnavailable}
            >
              {isDoctorUnavailable
                ? 'Doctor Currently On Leave'
                : loading
                ? <span className="spinner spinner-sm" />
                : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
