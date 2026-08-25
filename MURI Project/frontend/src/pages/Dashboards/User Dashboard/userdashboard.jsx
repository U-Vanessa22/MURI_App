import React, { useState, useEffect } from 'react';
import {
  FaHome,
  FaLaptop,
  FaTicketAlt,
  FaRobot,
  FaUser,
  FaSignOutAlt,
  FaFile,
  FaChartBar,
} from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { voucherAPI } from '../../../services/api';
import './userdashboard.css';

const PENDING_STATUSES = ['open', 'assigned', 'in_progress'];
const DONE_STATUSES = ['resolved', 'closed'];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [activeNav, setActiveNav] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      JSON.parse(storedUser);
      setLoading(false);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // Load this user's own tickets — the backend doesn't filter by requester,
  // so we fetch everything and keep only tickets this user raised.
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    setTicketsLoading(true);
    setTicketsError('');

    voucherAPI
      .list()
      .then((allTickets) => {
        if (cancelled) return;
        const ownTickets = (allTickets || []).filter((ticket) => ticket.requester_id === user.id);
        setMyTickets(ownTickets);
      })
      .catch(() => {
        if (cancelled) return;
        setMyTickets([]);
        setTicketsError('Could not load your tickets. Try refreshing the page.');
      })
      .finally(() => {
        if (!cancelled) setTicketsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stats = {
    // Real device/asset inventory isn't built yet (Bundle B) — no backend
    // data exists to show here.
    totalAssets: 0,
    myTickets: myTickets.length,
    resolved: myTickets.filter((t) => DONE_STATUSES.includes(t.status)).length,
    pending: myTickets.filter((t) => PENDING_STATUSES.includes(t.status)).length,
  };

  const recentActivity = [...myTickets]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
    .map((ticket) => ({
      id: ticket.id,
      title: `${ticket.ticket_number}: ${ticket.title}`,
      time: formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true }),
      icon: <FaTicketAlt />,
    }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate initials for avatar
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`simple-dashboard-root ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="simple-header">
        <div className="simple-header-left">
          <button
            className="simple-menu-btn"
            aria-label="Toggle navigation"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          >
            <FiMenu />
          </button>
          <div className="simple-logo">
            <img
              src="/Logo.png"
              alt="MURI Logo"
              className="simple-logo-image"
            />
          </div>
        </div>

        <div className="simple-header-right">
          <button
            className="simple-icon-btn"
            aria-label="Toggle notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            🔔
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
          <button
            className="simple-icon-btn"
            aria-label="Toggle theme"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="simple-user">
            <div className="simple-avatar">
              {getUserInitials()}
            </div>
            <div className="simple-user-info">
              <div className="simple-user-name">
                {user.email}
              </div>
              <div className="simple-user-role">
                {user.role || 'User'}
              </div>
            </div>
          </div>
        </div>

        {showNotifications && (
          <div className="simple-notification-panel">
            <h4>Notifications</h4>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="notification-item">
                  {notification.message}
                </div>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        )}
      </header>

      <div className={`simple-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar */}
        <nav className={`simple-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <ul className="simple-nav-menu">
            <li
              className={`simple-nav-item ${
                activeNav === 'home' ? 'active' : ''
              }`}
              onClick={() => {
                setActiveNav('home');
                navigate('/user-dashboard');
              }}
            >
              <FaHome />
              <span className="simple-nav-label">Home</span>
            </li>

            <li
              className={`simple-nav-item ${
                activeNav === 'voucher' ? 'active' : ''
              }`}
              onClick={() => { setActiveNav('voucher'); navigate('/voucher'); }}
            >
              <FaTicketAlt />
              <span className="simple-nav-label">Ticket</span>
            </li>

            <li
              className={`simple-nav-item ${
                activeNav === 'chat' ? 'active' : ''
              }`}
              onClick={() => { setActiveNav('chat'); navigate('/chatbot'); }}
            >
              <FaRobot />
              <span className="simple-nav-label">Chatbot</span>
            </li>

            <li
              className={`simple-nav-item ${
                activeNav === 'document' ? 'active' : ''
              }`}
              onClick={() => { setActiveNav('document'); navigate('/document'); }}
            >
              <FaFile />
              <span className="simple-nav-label">Document</span>
            </li>

            <li
              className={`simple-nav-item ${
                activeNav === 'reports' ? 'active' : ''
              }`}
               onClick={() => { setActiveNav('reports'); navigate('/report'); }}
           >
             <FaChartBar />
              <span className="simple-nav-label">Reports</span>
            </li>

            <li
              className={`simple-nav-item ${
                activeNav === 'settings' ? 'active' : ''
              }`}
              onClick={() => { setActiveNav('settings'); navigate('/settings'); }}
            >
              <FaUser />
              <span className="simple-nav-label">Settings</span>
            </li>

            {/* Logout button */}
            <li
              className="simple-nav-item simple-logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span className="simple-nav-label">Sign Out</span>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="simple-main">
          {/* Welcome Section */}
          <section className="simple-welcome">
            <h1>Welcome back, {user.email.split('@')[0]}!</h1>
            <div className="welcome-subtitle">
              <p>Here's your dashboard overview.</p>
            </div>
          </section>

          {/* Stats Section */}
          <section className="simple-stats-section">
            {ticketsError && (
              <div style={{ marginBottom: '10px', color: '#b91c1c' }}>{ticketsError}</div>
            )}
            <div className="simple-stats-grid">
              <div className="simple-stat-card">
                <div className="simple-stat-value">{stats.totalAssets}</div>
                <div className="simple-stat-label">My Assets</div>
              </div>
              <div className="simple-stat-card">
                <div className="simple-stat-value">{ticketsLoading ? '—' : stats.myTickets}</div>
                <div className="simple-stat-label">My Tickets</div>
              </div>
              <div className="simple-stat-card">
                <div className="simple-stat-value">{ticketsLoading ? '—' : stats.resolved}</div>
                <div className="simple-stat-label">Resolved</div>
              </div>
              <div className="simple-stat-card">
                <div className="simple-stat-value">{ticketsLoading ? '—' : stats.pending}</div>
                <div className="simple-stat-label">Pending</div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="simple-actions-section">
            <h2 className="simple-section-title">Quick Actions</h2>
            <div className="simple-actions-grid">
              <div
                className="simple-action-card"
                onClick={() => navigate('/report')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaLaptop />
                </div>
                <h3>Reports</h3>
                <p>View your reports and history</p>
              </div>

              <div
                className="simple-action-card"
                onClick={() => navigate('/voucher')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaTicketAlt />
                </div>
                <h3>Submit Request</h3>
                <p>Create a new support ticket</p>
              </div>

              <div
                className="simple-action-card"
                onClick={() => navigate('/voucher')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaTicketAlt />
                </div>
                <h3>My Tickets</h3>
                <p>Check your ticket status</p>
              </div>

              <div
                className="simple-action-card"
                onClick={() => navigate('/chatbot')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaRobot />
                </div>
                <h3>AI Chatbot</h3>
                <p>Get instant help from our AI</p>
              </div>

              <div
                className="simple-action-card"
                onClick={() => navigate('/document')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaFile />
                </div>
                <h3>Document</h3>
                <p>Sign and manage documents</p>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="simple-activity-section">
            <h2 className="simple-section-title">Recent Activity</h2>
            <div className="simple-activity-list">
              {ticketsLoading && <p>Loading activity…</p>}
              {!ticketsLoading && recentActivity.length === 0 && <p>No recent ticket activity yet.</p>}
              {!ticketsLoading && recentActivity.map((item) => (
                <div key={item.id} className="simple-activity-item">
                  <div className="simple-activity-text">
                    <div className="simple-activity-icon">{item.icon}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <p className="simple-activity-time">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="simple-footer">
            © 2026. ASM - Asset Management System • Logged in as: {user.email}
          </footer>
        </main>
      </div>
    </div>
  );
};


export default UserDashboard;