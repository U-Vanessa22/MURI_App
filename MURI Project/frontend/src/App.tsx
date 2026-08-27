// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeModeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login/LoginPage';
import './styles/global.css';
import UserDashboard from './pages/Dashboards/User Dashboard/userdashboard';
import VoucherPage from './pages/Voucherpage';
import Chatbot from './pages/Chatbot';
import Report from './pages/Report';
import Settings from '../src/pages/Settings';
import DataAssets from './pages/DataAssets';
import Disposal from './pages/Disposal';
import Document from './pages/Document';
import ITDashboard from './pages/Dashboards/IT Dashboard/itdashboard';
import AdminDashboard from './pages/Dashboards/Admin Dashboard/admindashboard';
import AdminUsers from './pages/AdminUsers';
import VirtualDashboard from './pages/Dashboards/Virtual Dashboard/virtualdashboard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2FA6B4',
      light: '#79D4E6',
      dark: '#1E4D57',
    },
    secondary: {
      main: '#1E4D57',
      light: '#BFEFFF',
    },
    background: {
      default: '#F2FCFF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Inter", sans-serif',
    h1: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 800,
    },
    h2: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ThemeModeProvider>
        <AuthProvider>
          <Router>
            <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/user-dashboard" element={
              <ProtectedRoute requiredRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/it-dashboard" element={
              <ProtectedRoute requiredRoles={['it']}>
                <ITDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin-dashboard" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />

            <Route path="/virtual-dashboard" element={
              <ProtectedRoute requiredRoles={['virtual']}>
                <VirtualDashboard />
              </ProtectedRoute>
            } />

            <Route path="/voucher" element={
              <ProtectedRoute requiredRoles={['*']}>
                <VoucherPage />
              </ProtectedRoute>
            } />
            
            <Route path="/chatbot" element={
              <ProtectedRoute requiredRoles={['*']}>
                <Chatbot />
              </ProtectedRoute>
            } />
            
            <Route path="/report" element={
              <ProtectedRoute requiredRoles={['*']}>
                <Report />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute requiredRoles={['*']}>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/settings/it" element={
              <ProtectedRoute requiredRoles={['admin', 'it']}>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/data-assets" element={
              <ProtectedRoute requiredRoles={['admin', 'it']}>
                <DataAssets />
              </ProtectedRoute>
            } />
            
            <Route path="/disposal" element={
              <ProtectedRoute requiredRoles={['admin', 'it']}>
                <Disposal />
              </ProtectedRoute>
            } />
            
            <Route path="/document" element={
              <ProtectedRoute requiredRoles={['*']}>
                <Document />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<LoginPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeModeProvider>
    </ThemeProvider>
  );
}

export default App;