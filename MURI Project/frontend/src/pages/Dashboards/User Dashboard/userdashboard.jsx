import React, { useState, useEffect } from 'react';
import { FaLaptop, FaTicketAlt, FaRobot, FaFile } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { voucherAPI } from '../../../services/api';
import AppLayout from '../../../components/layout/AppLayout';
import './userdashboard.css';

const PENDING_STATUSES = ['open', 'assigned', 'in_progress'];
const DONE_STATUSES = ['resolved', 'closed'];

const StatCard = ({ loading, value, label, onClick }) => (
  <div
    className="simple-stat-card"
    style={onClick && !loading ? { cursor: 'pointer' } : undefined}
    onClick={loading ? undefined : onClick}
  >
    {loading ? (
      <>
        <span className="stat-skeleton-value" aria-hidden="true" />
        <span className="stat-skeleton-label" aria-hidden="true" />
      </>
    ) : (
      <>
        <div className="simple-stat-value">{value}</div>
        <div className="simple-stat-label">{label}</div>
      </>
    )}
  </div>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useThemeMode();
  const [notifications] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState('');

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

  if (!user) {
    return null;
  }

  return (
    <AppLayout activePath="/user-dashboard" notifications={notifications}>
    <div className={`simple-dashboard-root ${darkMode ? 'dark' : ''}`}>
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
              <StatCard loading={false} value={stats.totalAssets} label="My Assets" />
              <StatCard loading={ticketsLoading} value={stats.myTickets} label="My Tickets" />
              <StatCard loading={ticketsLoading} value={stats.resolved} label="Resolved" />
              <StatCard loading={ticketsLoading} value={stats.pending} label="Pending" />
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
              {ticketsLoading && [0, 1, 2].map((key) => (
                <div key={key} className="simple-activity-item skeleton-row-block" />
              ))}
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
    </AppLayout>
  );
};


export default UserDashboard;