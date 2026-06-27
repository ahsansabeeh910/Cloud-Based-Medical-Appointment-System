import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiPhone, FiSave, FiShield,
  FiEdit3, FiLock, FiCalendar, FiAward, FiMapPin, FiBriefcase, FiClock
} from 'react-icons/fi';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const [doctorForm, setDoctorForm] = useState({
    specialization: user?.specialization || 'Cardiology',
    experience: user?.experience || 5,
    qualification: user?.qualification || 'MBBS, MD',
    hospital: user?.hospital || 'City Hospital',
    bio: user?.bio || 'Dedicated healthcare professional committed to providing the best patient care.',
    consultationFee: user?.consultationFee || 500,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      updateUser({ ...user, ...form });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Password changed successfully!');
      setChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to change password');
    }
    setSaving(false);
  };

  const isDoctor = user?.role === 'doctor';

  // Sample data for display
  const profileStats = isDoctor
    ? [
        { label: 'Total Patients', value: '128', icon: <FiUser /> },
        { label: 'Appointments', value: '342', icon: <FiCalendar /> },
        { label: 'Experience', value: `${doctorForm.experience} yrs`, icon: <FiClock /> },
        { label: 'Rating', value: '4.8★', icon: <FiAward /> },
      ]
    : [
        { label: 'Appointments', value: '12', icon: <FiCalendar /> },
        { label: 'Prescriptions', value: '8', icon: <FiBriefcase /> },
        { label: 'Doctors Visited', value: '5', icon: <FiUser /> },
        { label: 'Member Since', value: '2025', icon: <FiClock /> },
      ];

  return (
    <div className="profile-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-header-title">
            My <span className="gradient-text">Profile</span>
          </h1>
          <p className="page-header-subtitle">Manage your account information and settings</p>
        </div>

        <div className="profile-layout">
          {/* Left — Profile Card */}
          <div className="profile-sidebar">
            <div className="profile-card glass-card animate-fadeInUp">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {getInitials(form.name)}
                </div>
                <h2 className="profile-card-name">{form.name || 'User'}</h2>
                <span className={`badge badge-${user?.role || 'patient'}`}>
                  {user?.role || 'Patient'}
                </span>
                <p className="profile-card-email">{form.email}</p>
              </div>

              {isDoctor && (
                <div className="profile-card-details">
                  <div className="profile-detail-item">
                    <FiAward size={16} />
                    <span>{doctorForm.specialization}</span>
                  </div>
                  <div className="profile-detail-item">
                    <FiMapPin size={16} />
                    <span>{doctorForm.hospital}</span>
                  </div>
                  <div className="profile-detail-item">
                    <FiBriefcase size={16} />
                    <span>{doctorForm.qualification}</span>
                  </div>
                </div>
              )}

              <div className="profile-stats-grid">
                {profileStats.map((stat, i) => (
                  <div key={i} className="profile-stat-item">
                    <div className="profile-stat-icon">{stat.icon}</div>
                    <div className="profile-stat-value">{stat.value}</div>
                    <div className="profile-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Forms */}
          <div className="profile-content">
            {/* Personal Info */}
            <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="profile-section-header">
                <div className="profile-section-title-group">
                  <FiUser className="profile-section-icon" />
                  <h3 className="profile-section-title">Personal Information</h3>
                </div>
                <button
                  className={`btn ${editing ? 'btn-ghost' : 'btn-outline'} btn-sm`}
                  onClick={() => setEditing(!editing)}
                >
                  <FiEdit3 size={14} />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="form-input-icon-wrapper">
                    <span className="form-input-icon"><FiUser size={16} /></span>
                    <input
                      type="text"
                      className="form-input"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-icon-wrapper">
                    <span className="form-input-icon"><FiMail size={16} /></span>
                    <input
                      type="email"
                      className="form-input"
                      value={form.email}
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="form-input-icon-wrapper">
                    <span className="form-input-icon"><FiPhone size={16} /></span>
                    <input
                      type="tel"
                      className="form-input"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      disabled={!editing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {editing && (
                <div className="profile-form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <div className="spinner" /> : <FiSave size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Doctor-specific fields */}
            {isDoctor && (
              <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="profile-section-header">
                  <div className="profile-section-title-group">
                    <FiAward className="profile-section-icon" />
                    <h3 className="profile-section-title">Professional Information</h3>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select
                      className="form-select"
                      value={doctorForm.specialization}
                      onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                      disabled={!editing}
                    >
                      {['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology',
                        'General Medicine', 'Gynecology', 'Ophthalmology', 'Psychiatry', 'ENT'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={doctorForm.experience}
                      onChange={e => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input
                      type="text"
                      className="form-input"
                      value={doctorForm.qualification}
                      onChange={e => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital</label>
                    <div className="form-input-icon-wrapper">
                      <span className="form-input-icon"><FiMapPin size={16} /></span>
                      <input
                        type="text"
                        className="form-input"
                        value={doctorForm.hospital}
                        onChange={e => setDoctorForm({ ...doctorForm, hospital: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-textarea"
                      value={doctorForm.bio}
                      onChange={e => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                      disabled={!editing}
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={doctorForm.consultationFee}
                      onChange={e => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Change Password */}
            <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="profile-section-header">
                <div className="profile-section-title-group">
                  <FiShield className="profile-section-icon" />
                  <h3 className="profile-section-title">Security</h3>
                </div>
                <button
                  className={`btn ${changingPassword ? 'btn-ghost' : 'btn-outline'} btn-sm`}
                  onClick={() => setChangingPassword(!changingPassword)}
                >
                  <FiLock size={14} />
                  {changingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {changingPassword ? (
                <div className="profile-password-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handlePasswordChange}
                      disabled={saving}
                    >
                      {saving ? <div className="spinner" /> : <FiLock size={16} />}
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-security-info">
                  <div className="profile-security-row">
                    <div className="profile-security-label">
                      <FiLock size={16} />
                      <span>Password</span>
                    </div>
                    <span className="profile-security-value">••••••••••</span>
                  </div>
                  <div className="profile-security-row">
                    <div className="profile-security-label">
                      <FiShield size={16} />
                      <span>Two-Factor Authentication</span>
                    </div>
                    <span className="badge badge-cancelled">Not Enabled</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
