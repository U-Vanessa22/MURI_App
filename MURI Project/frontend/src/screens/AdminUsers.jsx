import React, { useCallback, useEffect, useState } from 'react';
import {
  FaSearch,
  FaTimes,
  FaPlus,
  FaPen,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
} from 'react-icons/fa';
import UnifiedSidebar from '../components/layout/UnifiedSidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';

const EMPTY_FORM = {
  full_name: '',
  username: '',
  email: '',
  department: '',
  station: '',
  role: 'USER',
  password: '',
  confirmPassword: '',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });
  const [targetUser, setTargetUser] = useState(null);
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id ?? null;

  const loadUsers = useCallback(async () => {
    try {
      setLoadError('');
      const data = await usersAPI.listUsers();
      setUsers(data || []);
    } catch (error) {
      setLoadError(error?.response?.data?.detail || 'Unable to load users from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    window.addEventListener('asm-users-updated', loadUsers);
    return () => window.removeEventListener('asm-users-updated', loadUsers);
  }, [loadUsers]);

  const showActionFeedback = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm =
      !term ||
      (user.full_name || '').toLowerCase().includes(term) ||
      (user.username || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      (user.department || '').toLowerCase().includes(term);

    const matchesRole = roleFilter === 'all' || (user.role || '').toLowerCase() === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? user.is_active : !user.is_active);

    return matchesTerm && matchesRole && matchesStatus;
  });

  const openCreateModal = () => {
    setFormMode('create');
    setEditingUser(null);
    setFormState(EMPTY_FORM);
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (user) => {
    setFormMode('edit');
    setEditingUser(user);
    setFormState({
      ...EMPTY_FORM,
      full_name: user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      department: user.department || '',
      station: user.station || '',
      role: user.role || 'USER',
    });
    setFormError('');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
    setFormState(EMPTY_FORM);
    setFormError('');
  };

  const handleCreateUser = async () => {
    if (!formState.full_name || !formState.email || !formState.username) {
      setFormError('Full name, username, and email are required.');
      return;
    }

    if (!formState.password || formState.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setFormError('');
    setFormSubmitting(true);
    try {
      await usersAPI.createUser({
        email: formState.email.trim().toLowerCase(),
        username: formState.username.trim().toLowerCase(),
        password: formState.password,
        role: (formState.role || 'USER').toUpperCase(),
        full_name: formState.full_name.trim(),
        department: formState.department || null,
        station: formState.station || null,
      });
      showActionFeedback('User created successfully.');
      closeFormModal();
      await loadUsers();
    } catch (error) {
      setFormError(error?.response?.data?.detail || 'Failed to create user.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!formState.full_name || !formState.email || !formState.username) {
      setFormError('Full name, username, and email are required.');
      return;
    }

    setFormError('');
    setFormSubmitting(true);
    try {
      await usersAPI.updateUser(editingUser.id, {
        email: formState.email.trim().toLowerCase(),
        username: formState.username.trim().toLowerCase(),
        full_name: formState.full_name.trim(),
        department: formState.department || null,
        station: formState.station || null,
        role: (formState.role || 'USER').toUpperCase(),
      });
      showActionFeedback('User updated successfully.');
      closeFormModal();
      await loadUsers();
    } catch (error) {
      setFormError(error?.response?.data?.detail || 'Failed to update user.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSubmitForm = () => {
    if (formMode === 'create') {
      handleCreateUser();
    } else {
      handleUpdateUser();
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const nextIsActive = !user.is_active;
      await usersAPI.updateUserStatus(user.id, nextIsActive);
      showActionFeedback(`User ${nextIsActive ? 'activated' : 'deactivated'} successfully.`);
      await loadUsers();
    } catch (error) {
      showActionFeedback(error?.response?.data?.detail || 'Failed to update user status.', 'error');
    }
  };

  const openResetModal = (user) => {
    setTargetUser(user);
    setResetForm({ newPassword: '', confirmPassword: '' });
    setResetError('');
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setTargetUser(null);
    setResetError('');
  };

  const handleResetPassword = async () => {
    if (!targetUser) return;

    if (!resetForm.newPassword || resetForm.newPassword.length < 8) {
      setResetError('New password must be at least 8 characters.');
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetError('');
    setResetSubmitting(true);
    try {
      await usersAPI.resetUserPassword(targetUser.id, resetForm.newPassword);
      showActionFeedback('Password reset successfully.');
      closeResetModal();
    } catch (error) {
      setResetError(error?.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    setDeleteError('');
    setDeleteSubmitting(true);
    try {
      await usersAPI.deleteUser(deleteTarget.id);
      showActionFeedback('User deleted successfully.');
      closeDeleteModal();
      await loadUsers();
    } catch (error) {
      setDeleteError(error?.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="simple-dashboard-root">
      <div className="simple-container">
        <UnifiedSidebar activePath="/admin/users" />

        <main className="simple-main">
          <TopNavbar title="User Management" />
          <div className="simple-dashboard-content">
            <div className="admin-users-main">
              <header className="admin-users-header">
                <h1>User Management</h1>
                <p>Create, update, and manage every account in the system.</p>
              </header>

              {actionMessage.text && (
                <div className={`admin-users-message ${actionMessage.type}`}>{actionMessage.text}</div>
              )}
              {loadError && <div className="admin-users-message error">{loadError}</div>}

              <div className="admin-users-toolbar">
                <div className="admin-users-search">
                  <span className="search-icon"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Search by name, username, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="it">IT</option>
                  <option value="virtual">Virtual</option>
                  <option value="user">User</option>
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button type="button" className="admin-users-add-btn" onClick={openCreateModal}>
                  <FaPlus /> Add User
                </button>
              </div>

              <div className="admin-users-table-container">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Station</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={`skeleton-${index}`} className="skeleton-row">
                          {Array.from({ length: 8 }).map((__, cellIndex) => (
                            <td key={cellIndex}><span className="skeleton-cell" /></td>
                          ))}
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="admin-users-empty">No users found</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.full_name || '-'}</td>
                          <td>{user.username || '-'}</td>
                          <td>{user.email}</td>
                          <td>{user.department || '-'}</td>
                          <td>{user.station || '-'}</td>
                          <td>
                            <span className={`role-pill role-${(user.role || '').toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="admin-users-actions">
                            <button type="button" className="row-action-btn" onClick={() => openEditModal(user)}>
                              <FaPen /> Edit
                            </button>
                            <button type="button" className="row-action-btn" onClick={() => openResetModal(user)}>
                              <FaKey /> Reset PW
                            </button>
                            <button
                              type="button"
                              className="row-action-btn"
                              onClick={() => handleToggleStatus(user)}
                              disabled={user.id === currentUserId}
                            >
                              {user.is_active ? <FaToggleOff /> : <FaToggleOn />}
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              className="row-action-btn danger"
                              onClick={() => openDeleteModal(user)}
                              disabled={user.id === currentUserId}
                            >
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {showFormModal && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>{formMode === 'create' ? 'Add New User' : `Edit ${editingUser?.full_name || editingUser?.email}`}</h3>
                      <button type="button" className="close-modal" onClick={closeFormModal} disabled={formSubmitting}><FaTimes /></button>
                    </div>

                    <div className="modal-body">
                      {formError && <div className="modal-error">{formError}</div>}

                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={formState.full_name}
                          onChange={(e) => setFormState((prev) => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={formState.username}
                          onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
                          placeholder="e.g. jane.doe"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={formState.email}
                          onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="name@icttoolsasm.com"
                        />
                        <p className="field-hint">Must be a company email ending in @icttoolsasm.com</p>
                      </div>

                      <div className="form-row">
                        <div className="form-group half">
                          <label>Department</label>
                          <input
                            type="text"
                            value={formState.department}
                            onChange={(e) => setFormState((prev) => ({ ...prev, department: e.target.value }))}
                            placeholder="Department"
                          />
                        </div>
                        <div className="form-group half">
                          <label>Station</label>
                          <input
                            type="text"
                            value={formState.station}
                            onChange={(e) => setFormState((prev) => ({ ...prev, station: e.target.value }))}
                            placeholder="Station"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Role</label>
                        <select
                          value={formState.role}
                          onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
                          disabled={formMode === 'edit' && editingUser?.id === currentUserId}
                        >
                          <option value="USER">User</option>
                          <option value="IT">IT</option>
                          <option value="ADMIN">Admin</option>
                          <option value="VIRTUAL">Virtual</option>
                        </select>
                        {formMode === 'edit' && editingUser?.id === currentUserId && (
                          <p className="field-hint">You cannot change your own role.</p>
                        )}
                      </div>

                      {formMode === 'create' && (
                        <div className="form-row">
                          <div className="form-group half">
                            <label>Password</label>
                            <input
                              type="password"
                              value={formState.password}
                              onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                              placeholder="At least 8 characters"
                            />
                          </div>
                          <div className="form-group half">
                            <label>Confirm Password</label>
                            <input
                              type="password"
                              value={formState.confirmPassword}
                              onChange={(e) => setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm password"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="cancel-btn" onClick={closeFormModal} disabled={formSubmitting}>Cancel</button>
                      <button type="button" className="save-btn" onClick={handleSubmitForm} disabled={formSubmitting}>
                        {formSubmitting && <span className="btn-spinner" aria-hidden="true" />}
                        {formSubmitting ? 'Saving...' : formMode === 'create' ? 'Create User' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showResetModal && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Reset Password</h3>
                      <button type="button" className="close-modal" onClick={closeResetModal} disabled={resetSubmitting}><FaTimes /></button>
                    </div>

                    <div className="modal-body">
                      {resetError && <div className="modal-error">{resetError}</div>}
                      <p className="modal-lead">
                        Reset password for <strong>{targetUser?.email}</strong>
                      </p>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={resetForm.newPassword}
                          onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          value={resetForm.confirmPassword}
                          onChange={(e) => setResetForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="cancel-btn" onClick={closeResetModal} disabled={resetSubmitting}>Cancel</button>
                      <button type="button" className="save-btn" onClick={handleResetPassword} disabled={resetSubmitting}>
                        {resetSubmitting && <span className="btn-spinner" aria-hidden="true" />}
                        {resetSubmitting ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteModal && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Delete User</h3>
                      <button type="button" className="close-modal" onClick={closeDeleteModal} disabled={deleteSubmitting}><FaTimes /></button>
                    </div>

                    <div className="modal-body">
                      {deleteError && <div className="modal-error">{deleteError}</div>}
                      <p className="modal-lead">
                        Are you sure you want to permanently delete <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>?
                      </p>
                      <p className="warning-text">
                        This cannot be undone. Users with existing ticket or document history cannot be deleted — deactivate them instead.
                      </p>
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="cancel-btn" onClick={closeDeleteModal} disabled={deleteSubmitting}>Cancel</button>
                      <button type="button" className="delete-confirm-btn" onClick={handleDeleteUser} disabled={deleteSubmitting}>
                        {deleteSubmitting && <span className="btn-spinner" aria-hidden="true" />}
                        {deleteSubmitting ? 'Deleting...' : 'Delete User'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
