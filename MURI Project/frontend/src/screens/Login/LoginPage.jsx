// src/pages/Login/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!acceptedPolicies) {
      setError('You must accept the Terms of Reference and Policies before continuing.');
      return;
    }

    setLoading(true);

    try {
      // REMOVED: "as LoginResponse" - this was causing the error
      const result = await login(email, password);
      
      if (result.success) {
        // Get user role from response
        const userRole = (result.data?.user?.role || 'user').toLowerCase();
        
        // Redirect based on role
        if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (userRole === 'manager' || userRole === 'it') {
          navigate('/it-dashboard');
        } else if (userRole === 'virtual') {
          navigate('/virtual-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoError = (e) => {
    e.currentTarget.style.display = 'none';
    const fallback = document.getElementById('login-logo-fallback');
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className="login-page-root">
      <div className="glass-container">
        {/* Left: Hero section */}
        <div className="hero-side">
          <div className="logo-display">
            <div className="logo-3d">
              <img
                src="/Logo.png"
                alt="MURI Logo"
                className="logo-img"
                onError={handleLogoError}
              />
              <div
                className="logo-fallback"
                id="login-logo-fallback"
                style={{ display: 'none' }}
              >
                MURI
              </div>
            </div>

            <div className="hero-title">
              <h1>MURI</h1>
              <div className="acronym">
                MANAGEMENT OF UNIVERSITY RESOURCES &amp; INFORMATION
              </div>
            </div>
          </div>

          {/*<p className="hero-text">
            A modern support and logistics workspace for tickets, assets,
            documents, and service requests.
          </p>*/}

          <div className="hero-pill-row" aria-label="MURI features">
            <span className="hero-pill">Pending-first support</span>
            <span className="hero-pill">Appointments</span>
            <span className="hero-pill">Assets & documents</span>
          </div>
        </div>

        {/* Right: Login section */}
        <div className="login-side">
          <div className="login-header">
            <h2>LOG IN</h2>
          </div>

          <div className="form-container">
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#ffe6e6',
                color: '#cc0000',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '20px',
                border: '1px solid #ffcccc'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"      
                    name="email" 
                    className="form-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"       
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🔒' : '👁️'}
                  </button>
                </div>
              </div>

             <div className="terms-acceptance-box">
                <label className="terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptedPolicies}
                    onChange={(e) => setAcceptedPolicies(e.target.checked)}
                    disabled={loading}
                  />
                  <span>
                      I accept the <strong>Terms of Reference</strong> and <strong>Policies</strong> to operate MURI as
                    either a User or IT Personnel.
                  </span>
                </label>
                <button
                  type="button"
                  className="terms-link-btn"
                  onClick={() => setShowPoliciesModal(true)}
                >
                  Read Terms & Policies
                </button>
              </div>

              <button
                type="submit"
                className={`submit-btn signin-btn ${loading ? 'loading' : ''}`}
                disabled={loading || !acceptedPolicies}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPoliciesModal && (
        <div className="policy-modal-overlay" role="dialog" aria-modal="true" aria-label="Terms and Policies">
          <div className="policy-modal-content">
            <div className="policy-modal-header">
              <h3>Terms of Reference & Policies</h3>
              <button type="button" className="policy-close-btn" onClick={() => setShowPoliciesModal(false)}>
                Close
              </button>
            </div>

            <div className="policy-modal-body">
              <h4>1. Scope of Use</h4>
              <p>
                MURI is for authorized operational use by approved User and IT Personnel accounts only. Access is role-
                based and must align with assigned responsibilities.
              </p>

              <h4>2. Account Responsibility</h4>
              <p>
                You are responsible for all activity performed under your account. Password sharing is prohibited.
                Report suspected unauthorized access immediately.
              </p>

              <h4>3. Data Handling and Compliance</h4>
              <p>
                Asset, ticket, and document records must be accurate, lawful, and policy-compliant. Sensitive
                information must not be disclosed to unauthorized parties.
              </p>

              <h4>4. IT Personnel Duties</h4>
              <p>
                IT Personnel must process assignments, update ticket status correctly, and manage records with
                professionalism and audit readiness.
              </p>

              <h4>5. User Duties</h4>
              <p>
                Users must provide complete issue descriptions, maintain truthful records, and avoid misuse of ticketing
                and request channels.
              </p>

              <h4>6. Enforcement</h4>
              <p>
                Violations may result in restricted access, account suspension, or disciplinary escalation according to
                institutional policy.
              </p>

              <p className="policy-note">
                Official source document:
                {' '}
                <a
                  href="https://docs.google.com/document/d/1KyaDIMSdX4WoLciCt6j1FGWyCbiT97gGavaaygbSNQo/edit?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms of Reference & Policies (Google Doc)
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;