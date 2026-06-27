import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiStar, FiAward } from 'react-icons/fi';
import './DoctorCard.css';

export default function DoctorCard({ doctor, index = 0 }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`star ${i <= Math.round(rating) ? '' : 'empty'}`}
          fill={i <= Math.round(rating) ? 'var(--accent)' : 'none'}
          size={14}
        />
      );
    }
    return stars;
  };

  const gradients = [
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #10b981, #0ea5e9)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
  ];

  return (
    <div
      className="doctor-card glass-card glass-card-hover animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
    >
      <div className="doctor-card-header">
        <div
          className="doctor-card-avatar"
          style={{ background: gradients[index % gradients.length] }}
        >
          {getInitials(doctor.name)}
          {doctor.available !== false && <span className="availability-dot" />}
        </div>
        <div className="doctor-card-info">
          <h3 className="doctor-card-name">{doctor.name}</h3>
          <p className="doctor-card-specialization">{doctor.specialization}</p>
          <div className="doctor-card-rating">
            {renderStars(doctor.rating || 0)}
            <span>({doctor.rating?.toFixed(1) || '0.0'})</span>
          </div>
        </div>
      </div>

      <div className="doctor-card-details">
        <div className="doctor-card-detail">
          <FiBriefcase size={14} />
          <span>{doctor.experience || 0} years experience</span>
        </div>
        <div className="doctor-card-detail">
          <FiMapPin size={14} />
          <span>{doctor.hospital || 'Not specified'}</span>
        </div>
        <div className="doctor-card-detail">
          <FiAward size={14} />
          <span>{doctor.qualification || 'MBBS'}</span>
        </div>
      </div>

      <div className="doctor-card-footer">
        <div className="doctor-card-fee">
          <span className="doctor-card-fee-label">Consultation</span>
          <span className="doctor-card-fee-amount">₹{doctor.fee || 500}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/doctors/${doctor._id || doctor.id}/book`)}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
