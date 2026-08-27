import React, { useState } from 'react';
import { FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import './topbar.css';

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

const getUserInitials = (user) => {
  if (user?.full_name) {
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
  if (user?.username) return user.username.charAt(0).toUpperCase();
  if (user?.email) return user.email.charAt(0).toUpperCase();
  return 'U';
};

const TopBar = ({
  onToggleSidebar,
  user,
  darkMode,
  toggleDarkMode,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onViewNotification,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter((item) => !item.is_read);

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          type="button"
          className="app-topbar-menu-btn"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
        >
          <FiMenu />
        </button>
        <div className="app-topbar-logo">
          <img src="/Logo.png" alt="MURI Logo" className="app-topbar-logo-image" />
        </div>
      </div>

      <div className="app-topbar-right">
        <button
          type="button"
          className="app-topbar-icon-btn"
          aria-label="Toggle notifications"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <FaBell />
          {unreadNotifications.length > 0 && (
            <span className="app-topbar-badge">{unreadNotifications.length}</span>
          )}
        </button>
        <button
          type="button"
          className="app-topbar-icon-btn"
          aria-label="Toggle theme"
          onClick={toggleDarkMode}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        {user && (
          <div className="app-topbar-user">
            <div className="app-topbar-avatar">{getUserInitials(user)}</div>
            <div className="app-topbar-user-info">
              <div className="app-topbar-user-name">
                {user.full_name || user.username || user.email}
              </div>
              <div className="app-topbar-user-role">
                {user.department && `${user.department} • `}{user.role || 'User'}
              </div>
            </div>
          </div>
        )}
      </div>

      {showNotifications && (
        <div className="app-topbar-notification-panel">
          <div className="app-topbar-notification-header">
            <h4>Notifications</h4>
            {unreadNotifications.length > 0 && onMarkAllNotificationsRead && (
              <button type="button" className="mark-all-btn" onClick={onMarkAllNotificationsRead}>
                Mark all as read
              </button>
            )}
          </div>
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <div key={notification.id} className="notification-item is-unread">
                <div className="notification-text">{formatNotificationMessage(notification)}</div>
                <div className="notification-actions-row">
                  {onViewNotification && (
                    <button
                      type="button"
                      className="view-ticket-btn"
                      onClick={() => onViewNotification(notification)}
                    >
                      View
                    </button>
                  )}
                  {onMarkNotificationRead && (
                    <button
                      type="button"
                      className="mark-single-btn"
                      onClick={() => onMarkNotificationRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="notifications-empty">No new notifications</p>
          )}
        </div>
      )}
    </header>
  );
};

export default TopBar;
