import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiActivity, FiUserCheck, FiShield, FiTrash2 } from 'react-icons/fi';
import { getSystemStats, getAllUsers, deleteUser } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, completedAppointments: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        getSystemStats(),
        getAllUsers()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load admin dashboard data');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely remove ${name} from the system?`)) return;
    
    try {
      await deleteUser(id);
      toast.success(`${name} has been removed successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to remove user');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page page">
        <div className="container">
          <LoadingSkeleton type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page page">
      <div className="container">
        <div className="dashboard-welcome glass-card animate-fadeInUp">
          <h1>Welcome, <span className="gradient-text-secondary">System Admin</span>! <FiShield style={{ verticalAlign: 'middle', marginLeft: '10px' }} /></h1>
          <p>Here is the global overview of the MediConnect platform</p>
        </div>

        <div className="dashboard-stats">
          <StatsCard icon={<FiUsers />} value={stats.totalPatients} label="Total Patients" gradient="var(--gradient-primary)" index={0} />
          <StatsCard icon={<FiUserCheck />} value={stats.totalDoctors} label="Total Doctors" gradient="var(--gradient-secondary)" index={1} />
          <StatsCard icon={<FiCalendar />} value={stats.totalAppointments} label="Total Appointments" gradient="var(--gradient-purple)" index={2} />
          <StatsCard icon={<FiActivity />} value={stats.completedAppointments} label="Completed Appts" gradient="var(--gradient-warm)" index={3} />
        </div>

        <div className="dashboard-section animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="dashboard-section-header">
            <h2>Registered Users Directory</h2>
          </div>
          <div className="admin-users-table-container glass-card">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id || i}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-small">{u.name.charAt(0).toUpperCase()}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button 
                          className="btn btn-icon btn-ghost" 
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          title="Remove User"
                          style={{ color: 'var(--danger)' }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
