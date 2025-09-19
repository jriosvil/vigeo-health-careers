import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  initializeDatabase, 
  createSampleJobPostings, 
  checkDatabaseInitialization 
} from '../../firebase/initializeDatabase';

const DatabaseSetup = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const initialized = await checkDatabaseInitialization();
      setIsInitialized(initialized);
      if (initialized) {
        setMessage('Database is already initialized!');
      }
    } catch (error) {
      setError('Error checking database status');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const success = await initializeDatabase();
      if (success) {
        setMessage('Database structure created successfully!');
        setIsInitialized(true);
      } else {
        setError('Failed to initialize database');
      }
    } catch (error) {
      setError('Error initializing database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleJobs = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const success = await createSampleJobPostings();
      if (success) {
        setMessage('Sample job postings created successfully!');
      } else {
        setError('Failed to create sample jobs');
      }
    } catch (error) {
      setError('Error creating sample jobs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper" style={{ maxWidth: '600px' }}>
        <div className="auth-card glass-card">
          <div className="auth-header">
            <div className="logo-container">
              <div className="logo-icon">VH</div>
              <h1 className="logo-text">VIGEO Health</h1>
            </div>
            <h2 className="auth-title">Database Setup</h2>
            <p className="auth-subtitle">Initialize Firestore Collections</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Collection Structure:
            </h3>
            <div style={{ 
              background: 'var(--bg-light)', 
              padding: '1.5rem', 
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <p style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                <strong>📁 VIGEO Health Careers Website</strong> (Top Collection)
              </p>
              <div style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <p>├── 📄 config (configuration document)</p>
                <p>├── 📂 users (user profiles)</p>
                <p>├── 📂 jobPostings (job listings)</p>
                <p>├── 📂 applications (job applications)</p>
                <p>├── 📂 departments (departments)</p>
                <p>└── 📂 savedJobs (saved jobs)</p>
              </div>
            </div>
          </div>

          {message && (
            <div style={{ 
              background: 'var(--brand-teal-light)', 
              color: 'var(--healthcare-teal)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleInitialize}
              disabled={loading || isInitialized}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Processing...' : 
               isInitialized ? 'Database Already Initialized' : 
               'Initialize Database Structure'}
            </button>

            {isInitialized && (
              <button
                onClick={handleCreateSampleJobs}
                disabled={loading}
                className="btn btn-secondary btn-full"
              >
                {loading ? 'Creating Jobs...' : 'Create Sample Job Postings'}
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary btn-full"
              style={{ marginTop: '1rem' }}
            >
              Go to Home Page
            </button>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'var(--brand-red-lighter)',
            borderRadius: '12px'
          }}>
            <h4 style={{ color: 'var(--brand-red)', marginBottom: '0.5rem' }}>
              ⚠️ Important Notes:
            </h4>
            <ul style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.9rem',
              paddingLeft: '1.5rem'
            }}>
              <li>Make sure you have configured Firebase in src/firebase/config.js</li>
              <li>Firestore must be enabled in your Firebase project</li>
              <li>The top collection will be named "VIGEO Health Careers Website"</li>
              <li>Sample jobs are optional and for demonstration purposes</li>
            </ul>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="diagonal-wave"></div>
          <div className="blob-1"></div>
          <div className="blob-2"></div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;