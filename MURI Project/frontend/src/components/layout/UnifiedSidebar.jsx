import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaTicketAlt,
  FaRobot,
  FaChartBar,
  FaCog,
  FaBoxOpen,
  FaHeadset,
  FaFileContract,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './unifiedSidebar.css';

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
    if (savedDashboard === '/user-dashboard' || savedDashboard === '/it-dashboard') {
      return savedDashboard;
    }
    return isIT ? '/it-dashboard' : '/user-dashboard';
  }, [isIT]);

  const userItems = [
    { name: 'Dashboard', icon: FaHome, path: dashboardPath },
    { name: 'Voucher', icon: FaTicketAlt, path: '/voucher' },
    { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
    { name: 'Document', icon: FaFileContract, path: '/document' },
    { name: 'Reports', icon: FaChartBar, path: '/report' },
    { name: 'Settings', icon: FaCog, path: '/settings' },
  ];

  const itItems = [
    { name: 'Dashboard', icon: FaHome, path: dashboardPath },
    { name: 'Voucher', icon: FaTicketAlt, path: '/voucher' },
    { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
    { name: 'Disposal', icon: FaHeadset, path: '/disposal' },
    { name: 'Report', icon: FaChartBar, path: '/report' },
    { name: 'Document', icon: FaFileContract, path: '/document' },
    { name: 'Asset', icon: FaBoxOpen, path: '/data-assets' },
    { name: 'Settings', icon: FaCog, path: '/settings/it' },
  ];

  const items = isIT ? itItems : userItems;

  const isActive = (path) => {
    if (activePath) return activePath === path;
    if (path === '/data-assets') return location.pathname === '/data-assets';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (typeof logout === 'function') logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <aside className="sidebar-compact unified-sidebar">
      <div className="sidebar-header">
        <img
          src="/Logo.png"
          alt="MURI Logo"
          className="sidebar-logo-image"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon"><Icon /></span>
              <span className="text">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-avatar">👤</span>
          <div className="user-details">
            <span className="user-name">{user?.full_name || user?.username || 'User'}</span>
            <span className="user-email">{user?.email || 'No email'}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="signout-btn" type="button">
          <span className="icon"><FaSignOutAlt /></span>
          <span className="text">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default UnifiedSidebar;
