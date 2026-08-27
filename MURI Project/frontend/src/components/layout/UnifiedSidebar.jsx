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
  FaUsers,
  FaUserCircle,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './unifiedSidebar.css';

const DASHBOARD_PATHS = ['/user-dashboard', '/it-dashboard', '/admin-dashboard', '/virtual-dashboard'];

const UnifiedSidebar = ({ activePath, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin';
  const isIT = role === 'it';
  const isVirtual = role === 'virtual';

  useEffect(() => {
    if (DASHBOARD_PATHS.includes(location.pathname)) {
      localStorage.setItem('asm_home_dashboard', location.pathname);
    }
  }, [location.pathname]);

  const dashboardPath = useMemo(() => {
    const savedDashboard = localStorage.getItem('asm_home_dashboard');
    if (DASHBOARD_PATHS.includes(savedDashboard)) {
      return savedDashboard;
    }
    if (isAdmin) return '/admin-dashboard';
    if (isIT) return '/it-dashboard';
    if (isVirtual) return '/virtual-dashboard';
    return '/user-dashboard';
  }, [isAdmin, isIT, isVirtual]);

  const userItems = [
    { name: 'Dashboard', icon: FaHome, path: dashboardPath },
    { name: 'Ticket', icon: FaTicketAlt, path: '/voucher' },
    { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
    { name: 'Document', icon: FaFileContract, path: '/document' },
    { name: 'Reports', icon: FaChartBar, path: '/report' },
    { name: 'Settings', icon: FaCog, path: '/settings' },
  ];

  const itItems = [
    { name: 'Dashboard', icon: FaHome, path: dashboardPath },
    { name: 'Ticket', icon: FaTicketAlt, path: '/voucher' },
    { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
    { name: 'Disposal', icon: FaHeadset, path: '/disposal' },
    { name: 'Report', icon: FaChartBar, path: '/report' },
    { name: 'Document', icon: FaFileContract, path: '/document' },
    { name: 'Asset', icon: FaBoxOpen, path: '/data-assets' },
    { name: 'Settings', icon: FaCog, path: '/settings/it' },
  ];

  const adminItems = [
    { name: 'Dashboard', icon: FaHome, path: dashboardPath },
    { name: 'Ticket', icon: FaTicketAlt, path: '/voucher' },
    { name: 'Users', icon: FaUsers, path: '/admin/users' },
    { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
    { name: 'Disposal', icon: FaHeadset, path: '/disposal' },
    { name: 'Report', icon: FaChartBar, path: '/report' },
    { name: 'Document', icon: FaFileContract, path: '/document' },
    { name: 'Asset', icon: FaBoxOpen, path: '/data-assets' },
    { name: 'Settings', icon: FaCog, path: '/settings/it' },
  ];

  const virtualItems = [
    { name: 'Dashboard', icon: FaHome, path: dashboardPath },
    { name: 'Ticket', icon: FaTicketAlt, path: '/voucher' },
    { name: 'Chatbot', icon: FaRobot, path: '/chatbot' },
    { name: 'Report', icon: FaChartBar, path: '/report' },
    { name: 'Document', icon: FaFileContract, path: '/document' },
    { name: 'Settings', icon: FaCog, path: '/settings' },
  ];

  const items = isAdmin ? adminItems : isIT ? itItems : isVirtual ? virtualItems : userItems;

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
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="app-sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.path}
              className={`app-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.name : undefined}
            >
              <span className="icon"><Icon /></span>
              <span className="text">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar-footer">
        <div className="user-info">
          <span className="user-avatar"><FaUserCircle /></span>
          <div className="user-details">
            <span className="user-name">{user?.full_name || user?.username || 'User'}</span>
            <span className="user-email">{user?.email || 'No email'}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="signout-btn" type="button" title={collapsed ? 'Sign Out' : undefined}>
          <span className="icon"><FaSignOutAlt /></span>
          <span className="text">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default UnifiedSidebar;
