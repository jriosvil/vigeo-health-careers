import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import vigeoLogo from '../../assets/images/vigeo-health-logo.png';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={vigeoLogo} alt="VIGEO Health" className="navbar-logo-img" />
          <div className="navbar-title">Careers</div>
        </Link>

        <div className={`navbar-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/jobs" className="nav-link">
            Browse Jobs
          </Link>
          
          {currentUser && (
            <Link to="/my-applications" className="nav-link">
              My Applications
            </Link>
          )}
          
          {userDetails?.role === 'admin' && (
            <>
              <Link to="/admin" className="nav-link">
                Review Applications
              </Link>
              <Link to="/admin/jobs" className="nav-link">
                Manage Jobs
              </Link>
            </>
          )}

          <div className="navbar-cta">
            <div className="user-info">
              <span className="user-name">
                {userDetails?.firstName} {userDetails?.lastName}
              </span>
              <span className="user-email">{currentUser?.email}</span>
            </div>
            <button onClick={handleLogout} className="navbar-btn">
              Sign Out
            </button>
          </div>
        </div>

        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;