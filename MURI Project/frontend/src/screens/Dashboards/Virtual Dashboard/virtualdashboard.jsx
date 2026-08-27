import { useCallback, useEffect, useRef, useState } from 'react';
import { FaTicketAlt, FaFileContract, FaChartBar, FaCheckCircle, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { reportAPI, voucherAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import UnifiedSidebar from '../../../components/layout/UnifiedSidebar';
import TopNavbar from '../../../components/layout/TopNavbar';

const UNRESOLVED_STATUSES = ['open', 'assigned', 'in_progress'];

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

const VirtualDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0,
    resolutionRate: 0,
  });
  const [queueSnapshot, setQueueSnapshot] = useState({
    open: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [slaHealth, setSlaHealth] = useState({ breached: 0, atRisk: 0 });
  const [workloadBoard, setWorkloadBoard] = useState([]);
  const [attentionTickets, setAttentionTickets] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const previousUnreadCountRef = useRef(null);

  // Check authentication on component mount, matching the other dashboards.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const playAlertSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.05;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
    } catch {
      // Ignore sound errors on restricted autoplay contexts
    }
  }, []);

  const maybeNotifyUnreadIncrease = useCallback((latestNotifications) => {
    const unreadCount = (latestNotifications || []).filter((item) => !item.is_read).length;
    const previousUnreadCount = previousUnreadCountRef.current;
    previousUnreadCountRef.current = unreadCount;

    if (previousUnreadCount === null || unreadCount <= previousUnreadCount) {
      return;
    }

    const soundEnabled = localStorage.getItem('asm_alert_sound_enabled');
    const toastEnabled = localStorage.getItem('asm_alert_toast_enabled');
    const shouldPlaySound = soundEnabled === null ? true : soundEnabled === 'true';
    const shouldShowToast = toastEnabled === null ? true : toastEnabled === 'true';

    if (shouldPlaySound) {
      playAlertSound();
    }

    if (shouldShowToast) {
      const newAlerts = unreadCount - previousUnreadCount;
      setToastMessage(`${newAlerts} new notification${newAlerts > 1 ? 's' : ''} received`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [playAlertSound]);

  const loadNotifications = useCallback(async () => {
    const latestNotifications = await reportAPI.getNotifications({
      limit: 100,
      target_email: user?.email || undefined,
    });
    setNotifications(latestNotifications || []);
    maybeNotifyUnreadIncrease(latestNotifications || []);
    return latestNotifications || [];
  }, [maybeNotifyUnreadIncrease, user?.email]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setDataError('');

        const [overview, vouchers] = await Promise.all([
          reportAPI.getOverview(),
          voucherAPI.list(),
        ]);

        await reportAPI.checkSla();
        const allNotifications = await loadNotifications();

        const resolvedCount = (overview.resolved || 0) + (overview.closed || 0);
        const unresolvedCount = (overview.open || 0) + (overview.assigned || 0) + (overview.in_progress || 0);
        const total = overview.total || (resolvedCount + unresolvedCount);

        setStats({
          total,
          resolved: resolvedCount,
          unresolved: unresolvedCount,
          resolutionRate: total > 0 ? Math.round((resolvedCount / total) * 100) : 0,
        });

        setQueueSnapshot({
          open: overview.open || 0,
          assigned: overview.assigned || 0,
          in_progress: overview.in_progress || 0,
          resolved: overview.resolved || 0,
          closed: overview.closed || 0,
        });

        setWorkloadBoard(overview.workload || []);

        const unreadForSla = allNotifications.filter((item) => !item.is_read);
        setSlaHealth({
          breached: unreadForSla.filter((item) => item.category === 'sla_breached').length,
          atRisk: unreadForSla.filter((item) => item.category === 'sla_at_risk').length,
        });

        const unresolvedTickets = (vouchers || []).filter((ticket) =>
          UNRESOLVED_STATUSES.includes(ticket.status)
        );
        const oldestUnresolved = [...unresolvedTickets]
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .slice(0, 6);
        setAttentionTickets(oldestUnresolved);

        const recent = [...(vouchers || [])]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 8)
          .map((item) => ({
            id: item.id,
            title: `${item.ticket_number} • ${item.title}`,
            time: new Date(item.updated_at).toLocaleString(),
            icon: <FaTicketAlt />,
          }));
        setRecentActivity(recent);
      } catch (error) {
        setDataError(error?.response?.data?.detail || 'Failed to load dashboard data');
      } finally {
        setDataLoading(false);
      }
    };

    loadDashboardData();

    const intervalId = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, loadNotifications]);

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await reportAPI.markNotificationRead(notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
    } catch {
      setDataError('Failed to mark notification as read');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await reportAPI.markAllNotificationsRead({ targetEmail: user?.email || null });
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch {
      setDataError('Failed to mark all notifications as read');
    }
  };

  const extractTicketNumber = (message = '') => {
    const match = String(message).match(/TKT-[A-Za-z0-9-]+/);
    return match ? match[0] : '';
  };

  const formatNotificationMessage = (notification) => {
    const ticketNumber = extractTicketNumber(notification?.message) || `ticket #${notification?.voucher_id}`;

    if (notification?.category === 'sla_breached') {
      return `You have ${ticketNumber} that needs immediate fixing because SLA is breached.`;
    }

    if (notification?.category === 'sla_at_risk') {
      return `You have ${ticketNumber} to work on now to prevent an SLA breach.`;
    }

    return `You have ${ticketNumber} that requires your attention.`;
  };

  const handleViewNotification = (notification) => {
    const query = new URLSearchParams();
    if (notification?.voucher_id) {
      query.set('voucher_id', String(notification.voucher_id));
    }

    const ticketNumber = extractTicketNumber(notification?.message);
    if (ticketNumber) {
      query.set('ticket', ticketNumber);
    }

    const queryString = query.toString();
    navigate(`/voucher${queryString ? `?${queryString}` : ''}`);
  };

  const daysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const diffMs = Date.now() - created.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days <= 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''} open`;
  };

  const unreadNotifications = notifications.filter((item) => !item.is_read);

  if (!user) {
    return null;
  }

  const getUserInitials = () => {
    if (user.full_name) {
      const names = user.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const notificationButton = (
    <button
      className="simple-icon-btn"
      aria-label="Toggle notifications"
      onClick={() => setShowNotifications((prev) => !prev)}
      type="button"
    >
      <FaBell aria-hidden="true" />
      {unreadNotifications.length > 0 && (
        <span className="notification-badge">{unreadNotifications.length}</span>
      )}
    </button>
  );

  return (
    <div className="simple-dashboard-root virtual-dashboard">
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 2000,
            background: '#111827',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: '10px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            fontSize: '14px',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="simple-header">
        <div className="simple-header-right">
          <button
            className="simple-icon-btn"
            aria-label="Toggle notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <FaBell aria-hidden="true" />
            {unreadNotifications.length > 0 && (
              <span className="notification-badge">{unreadNotifications.length}</span>
            )}
          </button>
          <div className="simple-user">
            <div className="simple-avatar">
              {getUserInitials()}
            </div>
            <div className="simple-user-info">
              <div className="simple-user-name">
                {user.full_name || user.username || user.email}
              </div>
              <div className="simple-user-role">
                {user.department && `${user.department} • `}{user.role || 'Virtual'}
              </div>
            </div>
          </div>
        </div>

        {showNotifications && (
          <div className="simple-notification-panel">
            <div className="simple-notification-header">
              <h4>Notifications</h4>
              {unreadNotifications.length > 0 && (
                <button
                  type="button"
                  className="mark-all-btn"
                  onClick={handleMarkAllNotificationsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? 'is-read' : 'is-unread'}`}
                >
                  <div className="notification-text">{formatNotificationMessage(notification)}</div>
                  <div className="notification-actions-row">
                    <button
                      type="button"
                      className="view-ticket-btn"
                      onClick={() => handleViewNotification(notification)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="mark-single-btn"
                      onClick={() => handleMarkNotificationRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="notifications-empty">No new notifications</p>
            )}
          </div>
        )}
      </header>

      <div className="simple-container">
        {/* Sidebar - shared across all pages */}
        <UnifiedSidebar activePath="/virtual-dashboard" />

        {/* Main Content */}
        <main className="simple-main">
          <TopNavbar title="Dashboard" rightExtra={notificationButton} />
          {showNotifications && (
            <div className="simple-notification-panel simple-notification-panel-visible">
              <div className="simple-notification-header">
                <h4>Notifications</h4>
                {unreadNotifications.length > 0 && (
                  <button
                    type="button"
                    className="mark-all-btn"
                    onClick={handleMarkAllNotificationsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.is_read ? 'is-read' : 'is-unread'}`}
                  >
                    <div className="notification-text">{formatNotificationMessage(notification)}</div>
                    <div className="notification-actions-row">
                      <button
                        type="button"
                        className="view-ticket-btn"
                        onClick={() => handleViewNotification(notification)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="mark-single-btn"
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="notifications-empty">No new notifications</p>
              )}
            </div>
          )}
          <div className="simple-dashboard-content">
          {/* Welcome Section */}
          <section className="simple-welcome">
            <h1>Welcome back, {user.full_name || user.username || 'there'}!</h1>
            <div className="welcome-subtitle">
              <p>Ticket progress overview — monitor resolution and SLA health across MURI.</p>
              {user.department && user.station && (
                <div className="user-context">
                  <span className="context-badge">{user.department}</span>
                  <span className="context-badge">{user.station}</span>
                </div>
              )}
            </div>
          </section>

          {/* Stats Section */}
          <section className="simple-stats-section">
            {dataError && (
              <div className="simple-data-error" style={{ marginBottom: '10px', color: '#b91c1c' }}>
                {dataError}
              </div>
            )}
            <div className="simple-stats-grid">
              <StatCard loading={dataLoading} value={stats.total} label="Total Tickets" onClick={() => navigate('/voucher')} />
              <StatCard loading={dataLoading} value={stats.resolved} label="Resolved" />
              <StatCard loading={dataLoading} value={stats.unresolved} label="Unresolved" onClick={() => navigate('/voucher')} />
              <StatCard loading={dataLoading} value={`${stats.resolutionRate}%`} label="Resolution Rate" />
            </div>
          </section>

          <section className="simple-stats-section">
            <h2 className="simple-section-title">SLA Health</h2>
            <div className="simple-stats-grid">
              <StatCard loading={dataLoading} value={slaHealth.breached} label="SLA Breached" />
              <StatCard loading={dataLoading} value={slaHealth.atRisk} label="SLA At Risk" />
            </div>
          </section>

          <section className="simple-stats-section">
            <h2 className="simple-section-title">Ticket Status Breakdown</h2>
            <div className="simple-stats-grid">
              <StatCard loading={dataLoading} value={queueSnapshot.open} label="Open" />
              <StatCard loading={dataLoading} value={queueSnapshot.assigned} label="Assigned" />
              <StatCard loading={dataLoading} value={queueSnapshot.in_progress} label="In Progress" />
              <StatCard loading={dataLoading} value={queueSnapshot.resolved} label="Resolved" />
              <StatCard loading={dataLoading} value={queueSnapshot.closed} label="Closed" />
            </div>
          </section>

          {/* Quick Actions */}
          <section className="simple-actions-section">
            <h2 className="simple-section-title">Quick Actions</h2>
            <div className="simple-actions-grid">
              <div
                className="simple-action-card"
                onClick={() => navigate('/voucher')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaTicketAlt />
                </div>
                <h3>All Tickets</h3>
                <p>Review every ticket and its current progress</p>
              </div>

              <div
                className="simple-action-card"
                onClick={() => navigate('/document')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaFileContract />
                </div>
                <h3>Documents</h3>
                <p>Check linked receiving/return documents</p>
              </div>

              <div
                className="simple-action-card"
                onClick={() => navigate('/report')}
                style={{ cursor: 'pointer' }}
              >
                <div className="simple-action-icon">
                  <FaChartBar />
                </div>
                <h3>Reports</h3>
                <p>System-wide analytics and SLA history</p>
              </div>
            </div>
          </section>

          <section className="simple-activity-section">
            <h2 className="simple-section-title">IT Workload Board</h2>
            {dataLoading && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {[0, 1, 2].map((key) => (
                  <div key={key} className="simple-activity-item skeleton-row-block" />
                ))}
              </div>
            )}
            {!dataLoading && workloadBoard.length === 0 && <p>No active IT personnel detected.</p>}
            {!dataLoading && workloadBoard.length > 0 && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {workloadBoard.map((member) => (
                  <div
                    key={member.user_id}
                    className="simple-activity-item"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <h4>{member.email}</h4>
                      <p className="simple-activity-time">IT Personnel #{member.user_id}</p>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {member.active_tickets} active tickets
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="simple-activity-section">
            <h2 className="simple-section-title">Tickets Needing Attention</h2>
            {dataLoading && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {[0, 1, 2].map((key) => (
                  <div key={key} className="simple-activity-item skeleton-row-block" />
                ))}
              </div>
            )}
            {!dataLoading && attentionTickets.length === 0 && (
              <p><FaCheckCircle style={{ marginRight: '6px' }} />Nothing unresolved — all caught up.</p>
            )}
            {!dataLoading && attentionTickets.length > 0 && (
              <div className="simple-activity-list">
                {attentionTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="simple-activity-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/voucher?voucher_id=${ticket.id}&ticket=${ticket.ticket_number}`)}
                  >
                    <div className="simple-activity-text">
                      <div className="simple-activity-icon"><FaTicketAlt /></div>
                      <div>
                        <h4>{ticket.ticket_number} • {ticket.title}</h4>
                        <p className="simple-activity-time">
                          {daysOpen(ticket.created_at)} • {ticket.status.replace('_', ' ')} • {ticket.priority} priority
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="simple-activity-section">
            <h2 className="simple-section-title">Recent Ticket Activity</h2>
            <div className="simple-activity-list">
              {dataLoading && [0, 1, 2].map((key) => (
                <div key={key} className="simple-activity-item skeleton-row-block" />
              ))}
              {!dataLoading && recentActivity.length === 0 && <p>No ticket activity yet.</p>}
              {!dataLoading && recentActivity.map((item) => (
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
            © 2026. MURI • Logged in as: {user.email}
          </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VirtualDashboard;
