import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import vigeoLogo from '../../../assets/images/vigeo-health-logo.png';

const MobileSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    try {
      await signup(email, password, { firstName, lastName });
      navigate('/mobile/jobs');
    } catch (error) {
      console.error('Signup error:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/mobile/jobs');
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-page">
      <div className="mobile-content mobile-content-full">
        <div className="mobile-container">
          {/* Logo Section */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--mobile-spacing-2xl)',
            paddingTop: 'var(--mobile-spacing-md)'
          }}>
            <img 
              src={vigeoLogo} 
              alt="VIGEO Health" 
              style={{ height: '80px', marginBottom: 'var(--mobile-spacing-lg)' }}
            />
            <h1 style={{ 
              fontSize: 'var(--mobile-text-3xl)', 
              fontWeight: '700',
              color: 'var(--mobile-primary)',
              marginBottom: 'var(--mobile-spacing-sm)'
            }}>
              VIGEO Health
            </h1>
            <p style={{ 
              fontSize: 'var(--mobile-text-lg)',
              color: 'var(--mobile-secondary)',
              fontWeight: '600'
            }}>
              Careers Portal
            </p>
          </div>

          {/* Signup Form */}
          <div className="mobile-card mobile-fade-in">
            <div className="mobile-card-header">
              <h2 style={{ 
                fontSize: 'var(--mobile-text-xl)', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Create Your Account
              </h2>
            </div>

            <div className="mobile-card-body">
              {error && (
                <div className="mobile-alert error mobile-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--mobile-spacing-md)' }}>
                  <div className="mobile-form-group">
                    <label className="mobile-form-label">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mobile-form-input"
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="mobile-form-group">
                    <label className="mobile-form-label">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mobile-form-input"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="mobile-form-group">
                  <label className="mobile-form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mobile-form-input"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mobile-form-group">
                  <label className="mobile-form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mobile-form-input"
                    placeholder="Create a password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="mobile-form-group">
                  <label className="mobile-form-label">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mobile-form-input"
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mobile-btn mobile-btn-primary mobile-btn-lg"
                  style={{ marginBottom: 'var(--mobile-spacing-lg)' }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="mobile-spinner" style={{ width: '20px', height: '20px' }}></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: 'var(--mobile-spacing-lg) 0',
                gap: 'var(--mobile-spacing-md)'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ color: 'var(--mobile-gray)', fontSize: 'var(--mobile-text-sm)' }}>
                  or
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mobile-btn mobile-btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--mobile-spacing-sm)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mobile-card-footer">
              <p style={{ 
                textAlign: 'center',
                color: 'var(--mobile-gray)',
                fontSize: 'var(--mobile-text-sm)'
              }}>
                Already have an account?{' '}
                <Link 
                  to="/mobile/login" 
                  style={{ 
                    color: 'var(--mobile-primary)', 
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'var(--mobile-spacing-2xl)',
            paddingBottom: 'var(--mobile-spacing-xl)'
          }}>
            <p style={{ 
              color: 'var(--mobile-gray)', 
              fontSize: 'var(--mobile-text-sm)'
            }}>
              Find your next opportunity in home healthcare
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSignup;