import { FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import './AppointmentCard.css';

export default function AppointmentCard({ appointment, role = 'patient', onAction, index = 0 }) {
  const status = appointment.status || 'pending';
  const medHist = appointment.patientId?.medicalHistory;
  const hasMedHist = medHist && (medHist.bloodGroup || medHist.allergies || medHist.chronicConditions || medHist.bloodPressure || medHist.weight);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const personName = role === 'patient'
    ? (appointment.doctorName || appointment.doctorId?.userId?.name || appointment.doctor?.name || 'Doctor')
    : (appointment.patientName || appointment.patientId?.name || appointment.patient?.name || 'Patient');

  const personSub = role === 'patient'
    ? (appointment.specialization || appointment.doctorId?.specialization || appointment.doctor?.specialization || '')
    : (appointment.patientEmail || appointment.patientId?.email || appointment.patient?.email || '');

  const gradients = [
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #10b981, #0ea5e9)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
  ];

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div
      className={`appointment-card glass-card glass-card-hover status-${status} animate-fadeInUp`}
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}
    >
      <div className="appointment-card-top">
        <div className="appointment-card-person">
          <div className="appointment-card-avatar" style={{ background: gradients[index % 4] }}>
            {getInitials(personName)}
          </div>
          <div className="appointment-card-person-info">
            <h4>{personName}</h4>
            <p>{personSub}</p>
          </div>
        </div>
        <span className={`badge badge-${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="appointment-card-body">
        <div className="appointment-card-field">
          <FiCalendar size={14} />
          <span>{formatDate(appointment.date)}</span>
        </div>
        <div className="appointment-card-field">
          <FiClock size={14} />
          <span>{appointment.timeSlot || appointment.time || appointment.slot || 'N/A'}</span>
        </div>
      </div>

      {appointment.reason && (
        <div className="appointment-card-reason">
          <FiFileText size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          {appointment.reason}
        </div>
      )}

      {role === 'doctor' && hasMedHist && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            fontSize: '0.8rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--primary-light)', width: '100%' }}>
            🩺 Patient Medical Summary:
          </span>
          {medHist.bloodGroup && <span><strong>Blood:</strong> {medHist.bloodGroup}</span>}
          {medHist.weight && <span><strong>Weight:</strong> {medHist.weight}</span>}
          {medHist.bloodPressure && <span><strong>BP:</strong> {medHist.bloodPressure}</span>}
          {medHist.allergies && <span><strong>Allergies:</strong> {medHist.allergies}</span>}
          {medHist.chronicConditions && <span><strong>Conditions:</strong> {medHist.chronicConditions}</span>}
        </div>
      )}

      {onAction && (
        <div className="appointment-card-actions">
          {role === 'doctor' && status === 'pending' && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => onAction('approved', appointment._id || appointment.id)}>
                Approve
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onAction('rejected', appointment._id || appointment.id)}>
                Reject
              </button>
            </>
          )}
          {role === 'doctor' && status === 'approved' && (
            <button className="btn btn-primary btn-sm" onClick={() => onAction('completed', appointment._id || appointment.id)}>
              Mark Completed
            </button>
          )}
          {role === 'doctor' && status === 'completed' && (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onAction('write_prescription', appointment._id || appointment.id, appointment)}
              >
                ✍️ Write Digital Rx
              </button>
              <input 
                type="file" 
                id={`upload-${appointment._id || appointment.id}`} 
                style={{ display: 'none' }} 
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onAction('upload_prescription', appointment._id || appointment.id, e.target.files[0]);
                  }
                }}
              />
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => document.getElementById(`upload-${appointment._id || appointment.id}`).click()}
              >
                Upload File
              </button>
            </>
          )}
          {role === 'patient' && (status === 'pending' || status === 'approved') && (
            <button className="btn btn-outline btn-sm" onClick={() => onAction('cancelled', appointment._id || appointment.id)}>
              Cancel
            </button>
          )}
          {status === 'completed' && (
            <button className="btn btn-ghost btn-sm" onClick={() => onAction('view', appointment._id || appointment.id)}>
              View Prescription
            </button>
          )}
        </div>
      )}
    </div>
  );
}
