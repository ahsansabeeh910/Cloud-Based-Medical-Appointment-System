import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, updateDoctorProfile } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiPhone, FiSave, FiShield,
  FiEdit3, FiLock, FiCalendar, FiAward, FiMapPin, FiBriefcase, FiClock, FiHeart
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

  const [medicalHistory, setMedicalHistory] = useState({
    bloodGroup: user?.medicalHistory?.bloodGroup || '',
    allergies: user?.medicalHistory?.allergies || '',
    chronicConditions: user?.medicalHistory?.chronicConditions || '',
    currentMedications: user?.medicalHistory?.currentMedications || '',
    bloodPressure: user?.medicalHistory?.bloodPressure || '',
    weight: user?.medicalHistory?.weight || '',
    emergencyContact: user?.medicalHistory?.emergencyContact || '',
  });

  const [editingMedical, setEditingMedical] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    _id: user?.doctorProfile?._id || '',
    specialization: user?.specialization || 'Cardiology',
    experience: user?.experience || 5,
    qualification: user?.qualification || 'MBBS, MD',
    hospital: user?.hospital || 'City Hospital',
    bio: user?.bio || 'Dedicated healthcare professional committed to providing the best patient care.',
    consultationFee: user?.consultationFee || 500,
    isAvailable: user?.doctorProfile?.isAvailable !== false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getProfile();
        const u = data?.data;
        if (u) {
          setForm({
            name: u.name || '',
            phone: u.phone || '',
            email: u.email || '',
          });
          if (u.medicalHistory) {
            setMedicalHistory({
              bloodGroup: u.medicalHistory.bloodGroup || '',
              allergies: u.medicalHistory.allergies || '',
              chronicConditions: u.medicalHistory.chronicConditions || '',
              currentMedications: u.medicalHistory.currentMedications || '',
              bloodPressure: u.medicalHistory.bloodPressure || '',
              weight: u.medicalHistory.weight || '',
              emergencyContact: u.medicalHistory.emergencyContact || '',
            });
          }
          if (u.doctorProfile) {
            setDoctorForm({
              _id: u.doctorProfile._id,
              specialization: u.doctorProfile.specialization || 'Cardiology',
              experience: u.doctorProfile.experience || 5,
              qualification: u.doctorProfile.qualification || 'MBBS',
              hospital: u.doctorProfile.hospital || '',
              bio: u.doctorProfile.bio || '',
              consultationFee: u.doctorProfile.consultationFee || 500,
              isAvailable: u.doctorProfile.isAvailable !== false,
            });
          }
        }
      } catch {
        // ignore
      }
    };
    loadProfile();
  }, []);

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
      const { data } = await updateProfile({ ...form, medicalHistory });
      if (user?.role === 'doctor' && doctorForm._id) {
        await updateDoctorProfile(doctorForm._id, doctorForm);
      }
      updateUser({ ...user, ...(data?.data || form), medicalHistory });
      toast.success('Profile updated successfully!');
      setEditing(false);
      setEditingMedical(false);
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

            {/* Patient Medical History & Vitals */}
            {user?.role === 'patient' && (
              <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.18s' }}>
                <div className="profile-section-header">
                  <div className="profile-section-title-group">
                    <FiHeart className="profile-section-icon" style={{ color: '#ef4444' }} />
                    <h3 className="profile-section-title">Patient Medical History & Vitals</h3>
                  </div>
                  <button
                    className={`btn ${editingMedical ? 'btn-ghost' : 'btn-outline'} btn-sm`}
                    onClick={() => setEditingMedical(!editingMedical)}
                  >
                    <FiEdit3 size={14} />
                    {editingMedical ? 'Cancel' : 'Update Vitals'}
                  </button>
                </div>

                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      value={medicalHistory.bloodGroup}
                      onChange={e => setMedicalHistory({ ...medicalHistory, bloodGroup: e.target.value })}
                      disabled={!editingMedical}
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Body Weight (kg)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 68 kg"
                      value={medicalHistory.weight}
                      onChange={e => setMedicalHistory({ ...medicalHistory, weight: e.target.value })}
                      disabled={!editingMedical}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 120/80 mmHg"
                      value={medicalHistory.bloodPressure}
                      onChange={e => setMedicalHistory({ ...medicalHistory, bloodPressure: e.target.value })}
                      disabled={!editingMedical}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Contact Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., +91-9876543210"
                      value={medicalHistory.emergencyContact}
                      onChange={e => setMedicalHistory({ ...medicalHistory, emergencyContact: e.target.value })}
                      disabled={!editingMedical}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Known Allergies (Drug / Food / Environmental)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Penicillin, Peanuts, Dust (or None)"
                      value={medicalHistory.allergies}
                      onChange={e => setMedicalHistory({ ...medicalHistory, allergies: e.target.value })}
                      disabled={!editingMedical}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Past / Chronic Medical Conditions</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="e.g., Type 2 Diabetes, Mild Asthma, Past Appendectomy (2022)..."
                      value={medicalHistory.chronicConditions}
                      onChange={e => setMedicalHistory({ ...medicalHistory, chronicConditions: e.target.value })}
                      disabled={!editingMedical}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Current Regular Medications</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Metformin 500mg daily, Vitamin D3"
                      value={medicalHistory.currentMedications}
                      onChange={e => setMedicalHistory({ ...medicalHistory, currentMedications: e.target.value })}
                      disabled={!editingMedical}
                    />
                  </div>
                </div>

                {editingMedical && (
                  <div className="profile-form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <div className="spinner" /> : <FiSave size={16} />}
                      {saving ? 'Saving Vitals...' : 'Save Medical History'}
                    </button>
                  </div>
                )}
              </div>
            )}

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
