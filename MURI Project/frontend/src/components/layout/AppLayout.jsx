import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import TopBar from './TopBar';
import UnifiedSidebar from './UnifiedSidebar';
import './appLayout.css';

const SIDEBAR_COLLAPSED_KEY = 'asm_sidebar_collapsed';

const AppLayout = ({
  activePath,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onViewNotification,
  children,
}) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`}>
      <TopBar
        onToggleSidebar={toggleSidebar}
        user={user}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        notifications={notifications}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onViewNotification={onViewNotification}
      />
      <div className="app-shell-body">
        <UnifiedSidebar activePath={activePath} collapsed={collapsed} />
        <main className="app-shell-main">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
