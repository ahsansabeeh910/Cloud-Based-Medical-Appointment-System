import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointments } from '../services/api';
import { FiTrendingUp, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Reports.css';

export default function Reports() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await getAppointments();
        setAppointments(Array.isArray(data) ? data : (data.data || data.appointments || []));
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="reports-page page container">
        <LoadingSkeleton type="list" count={3} />
      </div>
    );
  }

  // Calculate Metrics
  const totalAppointments = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const cancelledAppts = appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected');
  
  // Calculate Revenue
  // We assume the consultationFee is populated on the doctorId reference
  const totalRevenue = completedAppts.reduce((sum, apt) => {
    const fee = apt.doctorId?.consultationFee || 0;
    return sum + fee;
  }, 0);

  // Status breakdown
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const statuses = [
    { label: 'Completed', count: statusCounts['completed'] || 0, color: 'var(--success)' },
    { label: 'Approved', count: statusCounts['approved'] || 0, color: 'var(--primary)' },
    { label: 'Pending', count: statusCounts['pending'] || 0, color: 'var(--warning)' },
    { label: 'Cancelled/Rejected', count: (statusCounts['cancelled'] || 0) + (statusCounts['rejected'] || 0), color: 'var(--error)' }
  ];

  return (
    <div className="reports-page page">
      <div className="container">
        <div className="reports-header animate-fadeInUp">
          <h1>Practice <span className="gradient-text-secondary">Analytics</span></h1>
          <p>Detailed breakdown of your appointments and revenue</p>
        </div>

        <div className="reports-stats-grid">
          <div className="reports-stat-card glass-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="reports-stat-icon" style={{ background: 'var(--gradient-primary)' }}>
              <FiTrendingUp />
            </div>
            <div className="reports-stat-content">
              <h3>Total Revenue</h3>
              <div className="value">₹{totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          <div className="reports-stat-card glass-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="reports-stat-icon" style={{ background: 'var(--gradient-secondary)' }}>
              <FiCalendar />
            </div>
            <div className="reports-stat-content">
              <h3>Total Appointments</h3>
              <div className="value">{totalAppointments}</div>
            </div>
          </div>

          <div className="reports-stat-card glass-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="reports-stat-icon" style={{ background: 'var(--gradient-purple)' }}>
              <FiCheckCircle />
            </div>
            <div className="reports-stat-content">
              <h3>Completion Rate</h3>
              <div className="value">
                {totalAppointments > 0 ? Math.round((completedAppts.length / totalAppointments) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="reports-stat-card glass-card animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="reports-stat-icon" style={{ background: 'var(--gradient-warm)' }}>
              <FiXCircle />
            </div>
            <div className="reports-stat-content">
              <h3>Cancellation Rate</h3>
              <div className="value">
                {totalAppointments > 0 ? Math.round((cancelledAppts.length / totalAppointments) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="reports-charts-grid">
          <div className="reports-chart-card glass-card animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <h3>Appointment Status Breakdown</h3>
            <div className="css-bar-chart">
              {statuses.map((stat, idx) => {
                const percentage = totalAppointments > 0 ? Math.round((stat.count / totalAppointments) * 100) : 0;
                return (
                  <div className="bar-item" key={idx}>
                    <div className="bar-label">
                      <span>{stat.label}</span>
                      <span>{stat.count} ({percentage}%)</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${percentage}%`, background: stat.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
