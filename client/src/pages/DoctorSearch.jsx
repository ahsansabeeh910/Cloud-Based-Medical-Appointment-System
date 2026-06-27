import { useState, useEffect } from 'react';
import { FiSearch, FiUserX } from 'react-icons/fi';
import DoctorCard from '../components/DoctorCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getDoctors } from '../services/api';
import './DoctorSearch.css';

const SAMPLE_DOCTORS = [
  { id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology', experience: 15, hospital: 'Apollo Hospital, Mumbai', qualification: 'MBBS, MD Cardiology', rating: 4.9, fee: 800, available: true },
  { id: '2', name: 'Dr. Rajesh Patel', specialization: 'Orthopedics', experience: 12, hospital: 'Fortis Healthcare, Delhi', qualification: 'MBBS, MS Ortho', rating: 4.7, fee: 700, available: true },
  { id: '3', name: 'Dr. Priya Sharma', specialization: 'Dermatology', experience: 8, hospital: 'Max Hospital, Bangalore', qualification: 'MBBS, MD Dermatology', rating: 4.8, fee: 600, available: true },
  { id: '4', name: 'Dr. Vikram Singh', specialization: 'Neurology', experience: 20, hospital: 'AIIMS, Delhi', qualification: 'MBBS, DM Neurology', rating: 4.9, fee: 1200, available: true },
  { id: '5', name: 'Dr. Ananya Gupta', specialization: 'Pediatrics', experience: 10, hospital: 'Manipal Hospital, Chennai', qualification: 'MBBS, MD Pediatrics', rating: 4.6, fee: 500, available: true },
  { id: '6', name: 'Dr. Mohammed Ali', specialization: 'General Medicine', experience: 18, hospital: 'Medanta, Gurgaon', qualification: 'MBBS, MD Medicine', rating: 4.8, fee: 600, available: false },
  { id: '7', name: 'Dr. Kavitha Nair', specialization: 'Gynecology', experience: 14, hospital: 'Kokilaben Hospital, Mumbai', qualification: 'MBBS, MS OBG', rating: 4.7, fee: 900, available: true },
  { id: '8', name: 'Dr. Arjun Reddy', specialization: 'Psychiatry', experience: 9, hospital: 'NIMHANS, Bangalore', qualification: 'MBBS, MD Psychiatry', rating: 4.5, fee: 700, available: true },
  { id: '9', name: 'Dr. Sneha Iyer', specialization: 'Ophthalmology', experience: 11, hospital: 'Sankara Nethralaya, Chennai', qualification: 'MBBS, MS Ophthalmology', rating: 4.8, fee: 650, available: true },
  { id: '10', name: 'Dr. Amit Verma', specialization: 'Endocrinology', experience: 16, hospital: 'Lilavati Hospital, Mumbai', qualification: 'MBBS, DM Endocrinology', rating: 4.6, fee: 850, available: true },
];

const SPECIALIZATIONS = [
  'All Specializations', 'Cardiology', 'Dermatology', 'Endocrinology',
  'General Medicine', 'Gynecology', 'Neurology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry',
];

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await getDoctors();
      const rawDoctors = Array.isArray(data) ? data : (data.data || data.doctors || []);
      const formatted = rawDoctors.map(doc => ({
        ...doc,
        id: doc._id || doc.id,
        name: doc.userId?.name || doc.name,
        fee: doc.consultationFee || doc.fee || 500,
      }));
      setDoctors(formatted);
    } catch {
      setDoctors(SAMPLE_DOCTORS);
    }
    setLoading(false);
  };

  const filtered = doctors.filter((d) => {
    const matchesSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase());
      
    if (!specialization || specialization === 'All Specializations') {
      return matchesSearch;
    }
    
    const dbSpec = d.specialization?.toLowerCase() || '';
    const filterSpec = specialization.toLowerCase();
    
    // Match exact or by root word (e.g. Cardiolo matches Cardiologist and Cardiology)
    // General Medicine should match General Physician
    const rootWord = filterSpec.split(' ')[0].substring(0, 6); 
    const matchesSpec = dbSpec === filterSpec || dbSpec.includes(rootWord);
    
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="doctor-search-page page">
      <div className="container">
        <div className="doctor-search-header animate-fadeInUp">
          <h1>
            Find Your <span className="gradient-text">Doctor</span>
          </h1>
          <p>Search from our network of 1,200+ verified medical professionals</p>
        </div>

        <div className="doctor-search-bar animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="doctor-search-input-wrap">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, specialization, or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="doctor-search-select">
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {!loading && (
          <p className="doctor-search-count">
            Showing <strong>{filtered.length}</strong> doctor{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        <div className="doctors-grid">
          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : filtered.length > 0 ? (
            filtered.map((doc, i) => <DoctorCard key={doc._id || doc.id} doctor={doc} index={i} />)
          ) : (
            <div className="doctor-search-empty">
              <div className="doctor-search-empty-icon"><FiUserX /></div>
              <h3>No doctors found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
