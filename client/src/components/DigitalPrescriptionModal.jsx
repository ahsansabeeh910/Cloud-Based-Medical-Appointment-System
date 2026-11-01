import { useState } from 'react';
import { FiPlus, FiTrash2, FiX, FiFileText } from 'react-icons/fi';
import { generatePrescription } from '../services/api';
import { toast } from 'react-toastify';

export default function DigitalPrescriptionModal({ appointment, onClose, onSuccess }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500mg', frequency: '1-0-1 (After meals)', duration: '5 Days' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  if (!appointment) return null;

  const patientName =
    appointment.patientName || appointment.patientId?.name || appointment.patient?.name || 'Patient';

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (idx) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleChangeMedicine = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.warning('Please enter a clinical diagnosis');
      return;
    }
    const validMeds = medicines.filter((m) => m.name.trim() !== '');
    setSubmitting(true);
    try {
      await generatePrescription({
        appointmentId: appointment._id || appointment.id,
        diagnosis,
        medicines: validMeds,
        notes,
      });
      toast.success('Digital Prescription generated & saved to AWS S3!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate digital prescription');
    }
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="glass-card animate-fadeInUp"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          border: '1px solid rgba(14, 165, 233, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiFileText size={22} style={{ color: 'var(--primary-light)' }} />
            <div>
              <h3 style={{ margin: 0 }}>Digital Prescription Generator</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.75 }}>
                Patient: <strong>{patientName}</strong> • Auto-uploads to AWS S3
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Clinical Diagnosis *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Acute Viral Pharyngitis / Hypertension Stage 1"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>℞ Medications</label>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAddMedicine}>
                <FiPlus size={14} /> Add Medicine
              </button>
            </div>

            {medicines.map((med, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto',
                  gap: '8px',
                  marginBottom: '8px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Medicine Name (e.g. Paracetamol)"
                  value={med.name}
                  onChange={(e) => handleChangeMedicine(idx, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dosage (500mg)"
                  value={med.dosage}
                  onChange={(e) => handleChangeMedicine(idx, 'dosage', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Frequency (1-0-1)"
                  value={med.frequency}
                  onChange={(e) => handleChangeMedicine(idx, 'frequency', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Duration (5 Days)"
                  value={med.duration}
                  onChange={(e) => handleChangeMedicine(idx, 'duration', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemoveMedicine(idx)}
                  style={{ color: 'var(--danger)' }}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Doctor's Advice / Follow-up Instructions</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., Drink plenty of warm fluids, take rest, and review after 5 days."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Generating & Uploading to S3...' : 'Generate & Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
