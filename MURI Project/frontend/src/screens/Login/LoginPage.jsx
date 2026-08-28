// src/pages/Login/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardPathForRole } from '../../utils/roles';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The backend only accepts organization accounts; check it here too so the
// user gets a clear message instead of a round-trip rejection.
const ORG_DOMAIN = '@icttoolsasm.com';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!email.toLowerCase().endsWith(ORG_DOMAIN)) {
      setError(`Use your organization email (${ORG_DOMAIN})`);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // REMOVED: "as LoginResponse" - this was causing the error
      const result = await login(email, password);
      
      if (result.success) {
        const role = result.data?.user?.role;
        navigate(dashboardPathForRole(role));
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

              <button
                type="submit"
                className={`submit-btn signin-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;