import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaBoxOpen,
  FaChartBar,
  FaCog,
  FaExchangeAlt,
  FaFileContract,
  FaHeadset,
  FaHome,
  FaRobot,
  FaSignOutAlt,
  FaTicketAlt,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const UnifiedSidebar = ({ activePath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const isIT = ['admin', 'manager', 'it'].includes(role);

  useEffect(() => {
    if (location.pathname === '/user-dashboard' || location.pathname === '/it-dashboard') {
      localStorage.setItem('asm_home_dashboard', location.pathname);
    }
  }, [location.pathname]);

  const dashboardPath = useMemo(() => {
    const savedDashboard = localStorage.getItem('asm_home_dashboard');
    if (savedDashboard === '/user-dashboard' || savedDashboard === '/it-dashboard') return savedDashboard;
    return isIT ? '/it-dashboard' : '/user-dashboard';
  }, [isIT]);

  const items = isIT
    ? [
        { name: 'Dashboard', icon: FaHome, path: dashboardPath },
        { name: 'Tickets', icon: FaTicketAlt, path: '/voucher' },
        { name: 'Assets', icon: FaBoxOpen, path: '/data-assets' },
        { name: 'Asset Issuance', icon: FaExchangeAlt, path: '/asset-issuance' },
        { name: 'Disposal', icon: FaHeadset, path: '/disposal' },
        { name: 'Documents', icon: FaFileContract, path: '/document' },
        { name: 'Reports', icon: FaChartBar, path: '/report' },
        { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
      ]
    : [
        { name: 'Dashboard', icon: FaHome, path: dashboardPath },
        { name: 'My Tickets', icon: FaTicketAlt, path: '/voucher' },
        { name: 'Documents', icon: FaFileContract, path: '/document' },
        { name: 'Reports', icon: FaChartBar, path: '/report' },
        { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
      ];

  const settingsPath = isIT ? '/settings/it' : '/settings';
  const isActive = (path) => activePath ? activePath === path : location.pathname === path;
  const getInitials = () => (user?.full_name || user?.username || user?.email || 'U')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout?.();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <aside className="unified-sidebar" aria-label="Main navigation">
      <div className="unified-sidebar-brand">
        <img src="/Logo.png" alt="MURI logo" className="unified-sidebar-logo" />
        <div>
          <strong>MURI</strong>
          <span>Asset &amp; Support</span>
        </div>
      </div>

      <nav className="unified-sidebar-nav">
        {items.map(({ name, icon: Icon, path }) => (
          <button
            className={`unified-sidebar-item ${isActive(path) ? 'active' : ''}`}
            type="button"
            key={path}
            onClick={() => navigate(path)}
          >
            <Icon aria-hidden="true" />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="unified-sidebar-footer">
        <button className={`unified-sidebar-item ${isActive(settingsPath) ? 'active' : ''}`} type="button" onClick={() => navigate(settingsPath)}>
          <FaCog aria-hidden="true" />
          <span>Settings</span>
        </button>
        <div className="unified-sidebar-user">
          <span className="unified-sidebar-avatar">{getInitials()}</span>
          <span>{user?.full_name || user?.username || user?.email || 'User'}</span>
        </div>
        <button className="unified-sidebar-item unified-sidebar-signout" type="button" onClick={handleLogout}>
          <FaSignOutAlt aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default UnifiedSidebar;
