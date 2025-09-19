import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import vigeoLogo from '../../../assets/images/vigeo-health-logo.png';

const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userDetails, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logout();
        navigate('/mobile/login', { replace: true });
      } catch (error) {
        console.error('Failed to log out:', error);
        alert('Failed to sign out. Please try again.');
      }
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header mobile-header-safe">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={vigeoLogo} alt="VIGEO Health" className="mobile-logo" />
          <span className="mobile-logo-text">Careers</span>
        </div>
        
        {currentUser && (
          <button 
            onClick={handleLogout}
            className="mobile-btn-outline"
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.875rem',
              width: 'auto',
              minHeight: '36px'
            }}
          >
            Sign Out
          </button>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      {currentUser && (
        <nav className="mobile-nav">
          <Link 
            to="/mobile/jobs" 
            className={`mobile-nav-item ${isActive('/mobile/jobs') ? 'active' : ''}`}
          >
            <svg className="mobile-nav-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <span className="mobile-nav-label">Jobs</span>
          </Link>

          <Link 
            to="/mobile/applications" 
            className={`mobile-nav-item ${isActive('/mobile/applications') ? 'active' : ''}`}
          >
            <svg className="mobile-nav-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <span className="mobile-nav-label">My Apps</span>
          </Link>

          <Link 
            to="/mobile/profile" 
            className={`mobile-nav-item ${isActive('/mobile/profile') ? 'active' : ''}`}
          >
            <svg className="mobile-nav-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
            </svg>
            <span className="mobile-nav-label">Profile</span>
          </Link>
        </nav>
      )}
    </>
  );
};

export default MobileNavbar;