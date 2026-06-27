import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiBriefcase, FiMapPin, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Register.css';

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'General Medicine', 'Gynecology', 'Neurology', 'Oncology',
  'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Pulmonology', 'Radiology', 'Urology',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', experience: '', qualification: '', hospital: '', fee: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '' };
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 8 && /[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p)) s++;
    const labels = ['', 'Weak', 'Medium', 'Strong'];
    const classes = ['', 'weak', 'medium', 'strong'];
    return { level: s, label: labels[s], cls: classes[s] };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (role === 'doctor' && (!form.specialization || !form.experience)) {
      setError('Please fill in doctor-specific fields');
      return;
    }

    setLoading(true);
    setError('');

    const payload = { ...form, role };
    if (role === 'patient') {
      delete payload.specialization;
      delete payload.experience;
      delete payload.qualification;
      delete payload.hospital;
      delete payload.fee;
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      <div className="register-card glass-card">
        <div className="register-header">
          <h1 className="register-title">
            Create Your <span className="gradient-text-secondary">Account</span>
          </h1>
          <p className="register-subtitle">Join MediConnect and experience better healthcare</p>
        </div>

        <div className="role-toggle">
          <div className={`role-toggle-slider ${role === 'doctor' ? 'doctor' : ''}`} />
          <button
            type="button"
            className={`role-toggle-btn ${role === 'patient' ? 'active' : ''}`}
            onClick={() => setRole('patient')}
          >
            I'm a Patient
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            I'm a Doctor
          </button>
        </div>

        {error && <div className="login-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrapper">
                <FiUser className="input-icon" />
                <input type="text" name="name" className="form-input" placeholder="John Doe"
                  value={form.name} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-icon-wrapper">
                <FiPhone className="input-icon" />
                <input type="tel" name="phone" className="form-input" placeholder="+91 9876543210"
                  value={form.phone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input type="email" name="email" className="form-input" placeholder="john@example.com"
                value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" />
              <input type="password" name="password" className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} />
            </div>
            {form.password && (
              <>
                <div className="password-strength">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`password-strength-bar ${i <= strength.level ? `active ${strength.cls}` : ''}`} />
                  ))}
                </div>
                <span className="password-strength-label">{strength.label}</span>
              </>
            )}
          </div>

          {role === 'doctor' && (
            <div className="register-doctor-fields">
              <span className="register-doctor-fields-title">Doctor Details</span>
              <div className="register-form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select name="specialization" className="form-select" value={form.specialization} onChange={handleChange}>
                    <option value="">Select...</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" name="experience" className="form-input" placeholder="5"
                    value={form.experience} onChange={handleChange} min="0" max="50" />
                </div>
              </div>
              <div className="register-form-row">
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <div className="input-icon-wrapper">
                    <FiAward className="input-icon" />
                    <input type="text" name="qualification" className="form-input" placeholder="MBBS, MD"
                      value={form.qualification} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input type="number" name="fee" className="form-input" placeholder="500"
                    value={form.fee} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hospital / Clinic</label>
                <div className="input-icon-wrapper">
                  <FiMapPin className="input-icon" />
                  <input type="text" name="hospital" className="form-input" placeholder="Apollo Hospital, Mumbai"
                    value={form.hospital} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          <div className="register-submit">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
