import { Link } from 'react-router-dom';
import {
  FiSearch, FiCalendar, FiShield, FiClock,
  FiArrowRight, FiZap, FiHeart, FiUsers
} from 'react-icons/fi';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Cloud-Powered Healthcare Platform
          </div>

          <h1 className="hero-title">
            Your Health,<br />
            <span className="hero-title-gradient">Our Priority</span>
          </h1>

          <p className="hero-subtitle">
            Experience seamless healthcare with instant doctor discovery, smart appointment
            booking, and secure digital prescriptions — all in one platform.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/doctors" className="btn btn-outline btn-lg">
              <FiSearch size={18} /> Find Doctors
            </Link>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <div className="hero-stat-value gradient-text">1,200+</div>
              <div className="hero-stat-label">Verified Doctors</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value gradient-text">50K+</div>
              <div className="hero-stat-label">Appointments</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value gradient-text">99.9%</div>
              <div className="hero-stat-label">Uptime</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value gradient-text">4.9★</div>
              <div className="hero-stat-label">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Features</span>
            <h2 className="section-title">
              Everything You Need for{' '}
              <span className="gradient-text">Better Healthcare</span>
            </h2>
            <p className="section-subtitle">
              Our platform combines cutting-edge technology with healthcare expertise
              to deliver an unmatched experience.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: <FiSearch />,
                gradient: 'var(--gradient-primary)',
                title: 'Find Doctors',
                desc: 'Search from 1,200+ verified specialists across all medical fields with real-time availability.',
              },
              {
                icon: <FiCalendar />,
                gradient: 'var(--gradient-secondary)',
                title: 'Book Instantly',
                desc: 'Reserve your appointment in seconds with our smart scheduling system. No calls needed.',
              },
              {
                icon: <FiShield />,
                gradient: 'var(--gradient-purple)',
                title: 'Secure Records',
                desc: 'Your health data is encrypted and stored securely on cloud infrastructure with HIPAA compliance.',
              },
              {
                icon: <FiClock />,
                gradient: 'var(--gradient-warm)',
                title: '24/7 Access',
                desc: 'Manage appointments, view prescriptions, and access your health records anytime, anywhere.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="feature-card glass-card glass-card-hover animate-fadeInUp"
                style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
              >
                <div className="feature-icon" style={{ background: f.gradient }}>
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 0 }}>
            <span className="section-label">How It Works</span>
            <h2 className="section-title">
              Three Simple Steps to{' '}
              <span className="gradient-text-secondary">Better Health</span>
            </h2>
          </div>

          <div className="how-steps">
            {[
              {
                num: '1',
                gradient: 'var(--gradient-primary)',
                title: 'Search & Choose',
                desc: 'Browse our verified network of specialists. Filter by specialization, location, and availability.',
              },
              {
                num: '2',
                gradient: 'var(--gradient-secondary)',
                title: 'Book & Confirm',
                desc: 'Select your preferred time slot and book instantly. Get confirmation in real-time.',
              },
              {
                num: '3',
                gradient: 'var(--gradient-purple)',
                title: 'Visit & Heal',
                desc: 'Attend your appointment and receive digital prescriptions securely in your dashboard.',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="how-step animate-fadeInUp"
                style={{ animationDelay: `${i * 0.2}s`, animationFillMode: 'both' }}
              >
                <div className="how-step-number" style={{ background: s.gradient }}>
                  {s.num}
                </div>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-card animate-fadeIn">
            <h2 className="cta-title">
              Ready to Take Control of{' '}
              <span className="gradient-text">Your Health?</span>
            </h2>
            <p className="cta-subtitle">
              Join thousands of patients and doctors already using MediConnect
              for smarter healthcare management.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account <FiArrowRight />
              </Link>
              <Link to="/doctors" className="btn btn-outline btn-lg">
                Explore Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p>
            © 2026 <span className="gradient-text" style={{ fontWeight: 700 }}>MediConnect</span>. All rights reserved. Built with{' '}
            <FiHeart style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--error)' }} size={14} />
          </p>
        </div>
      </footer>
    </div>
  );
}
