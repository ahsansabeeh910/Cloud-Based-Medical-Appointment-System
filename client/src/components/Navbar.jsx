import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiActivity, FiMenu, FiX, FiHome, FiSearch, FiCalendar,
  FiUser, FiLogOut, FiChevronDown, FiGrid, FiClock
} from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon"><FiActivity /></span>
            <span className="navbar-logo-text">MediConnect</span>
          </Link>

          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <FiHome size={16} /> Home
            </NavLink>
            <NavLink to="/doctors" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <FiSearch size={16} /> Find Doctors
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to={getDashboardPath()} className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <FiGrid size={16} /> Dashboard
                </NavLink>
                <NavLink to="/appointments" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <FiCalendar size={16} /> Appointments
                </NavLink>
              </>
            )}
          </div>

          <div className="navbar-right">
            {isAuthenticated ? (
              <div className="navbar-user" ref={dropdownRef}>
                <button
                  className={`navbar-user-btn ${dropdownOpen ? 'open' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="navbar-avatar">{getInitials(user?.name)}</div>
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user?.name || 'User'}</span>
                    <span className="navbar-user-role">{user?.role || 'patient'}</span>
                  </div>
                  <FiChevronDown className="navbar-chevron" />
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <Link
                      to={getDashboardPath()}
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiGrid size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser size={16} /> Profile
                    </Link>
                    <Link
                      to="/appointments"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiClock size={16} /> Appointments
                    </Link>
                    <div className="navbar-dropdown-divider" />
                    <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Login</Link>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
              </>
            )}

            <button
              className="navbar-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <FiHome size={18} /> Home
        </NavLink>
        <NavLink to="/doctors" className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <FiSearch size={18} /> Find Doctors
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to={getDashboardPath()} className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <FiGrid size={18} /> Dashboard
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <FiCalendar size={18} /> Appointments
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <FiUser size={18} /> Profile
            </NavLink>
            <button className="navbar-mobile-link" style={{ color: 'var(--error-light)' }} onClick={() => { handleLogout(); setMobileOpen(false); }}>
              <FiLogOut size={18} /> Logout
            </button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <NavLink to="/login" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiUser size={18} /> Login
            </NavLink>
            <NavLink to="/register" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiUser size={18} /> Register
            </NavLink>
          </>
        )}
      </div>
    </>
  );
}
