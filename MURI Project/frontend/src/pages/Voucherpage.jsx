import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, User, Calendar, FileText, Upload } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './voucherpage.css';
import UnifiedSidebar from '../components/layout/UnifiedSidebar';
import { documentAPI, voucherAPI } from '../services/api';
import { useThemeMode } from '../contexts/ThemeContext';

const DRAFT_STORAGE_KEY = 'muri_voucher_draft';
const STATUS_LABELS = {
  draft: 'Draft',
  open: 'Pending',
  assigned: 'Pending / Under Review',
  in_progress: 'Under Review',
  resolved: 'Completed',
  closed: 'Archived',
};

const VoucherPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    requestType: 'technical',
    priority: 'medium',
    appointmentSeverity: 'medium',
    preferredDate: '',
    preferredTime: '',
    problemDescription: '',
    requester_name: '',
    requester_station: ''
  });
  const [activeTab, setActiveTab] = useState('create');
  const [tickets, setTickets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = React.useRef(null);
  const location = useLocation();
  const [notesState, setNotesState] = useState({});
  const [documentLinkState, setDocumentLinkState] = useState({});
  const { darkMode, toggleDarkMode } = useThemeMode();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    // Prefill requester name and station from logged in user when available
    if (currentUser && Object.keys(currentUser).length > 0) {
      setFormData((prev) => ({
        ...prev,
        requester_name: currentUser.full_name || currentUser.username || currentUser.email || prev.requester_name,
        requester_station: currentUser.station || prev.requester_station,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      const savedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || 'null');
      if (savedDraft && typeof savedDraft === 'object') {
        setFormData((prev) => ({
          ...prev,
          ...savedDraft,
        }));
      }
    } catch {
      // Ignore malformed draft payloads.
    }
  }, []);

  const normalizedRole = (currentUser?.role || '').toLowerCase();
  const isITRole = ['admin', 'manager', 'it'].includes(normalizedRole);
  const isUserRole = normalizedRole === 'user';
  const canManageTickets = isITRole;
  const canCreateVoucher = isUserRole;
  const currentUserId = Number(currentUser?.id || 0);

  const getStatusLabel = useCallback((status) => STATUS_LABELS[status] || 'Pending', []);

  const buildDraftPayload = useCallback(() => ({
    ...formData,
    savedAt: new Date().toISOString(),
  }), [formData]);

  const showOnlyMyTickets = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('filter') === 'my-tickets';
  }, [location.search]);

  const focusVoucherId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const rawValue = searchParams.get('voucher_id');
    if (!rawValue) {
      return null;
    }
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : null;
  }, [location.search]);

  const focusTicketNumber = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('ticket') || '';
  }, [location.search]);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);

      const voucherParams = {};
      if (showOnlyMyTickets && currentUserId) {
        voucherParams.assigned_to_id = currentUserId;
      }

      const [voucherData, documentData] = await Promise.all([
        voucherAPI.list(voucherParams),
        documentAPI.list(),
      ]);

      const normalizedTickets = (voucherData || []).filter((ticket) => {
        if (isUserRole && currentUserId) {
          return ticket.requester_id === currentUserId;
        }
        return true;
      });
      setTickets(normalizedTickets);
      setDocuments(documentData || []);

      const nextNotesState = {};
      const nextDocumentLinkState = {};

      normalizedTickets.forEach((ticket) => {
        nextNotesState[ticket.id] = {
          diagnosis: ticket.diagnosis || '',
          action_taken: ticket.action_taken || '',
        };

        const linkedDocument = (documentData || []).find((doc) => doc.voucher_id === ticket.id);
        nextDocumentLinkState[ticket.id] = linkedDocument ? linkedDocument.id : '';
      });

      setNotesState(nextNotesState);
      setDocumentLinkState(nextDocumentLinkState);
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isUserRole, showOnlyMyTickets]);

  useEffect(() => {
    if (!canCreateVoucher && activeTab === 'create') {
      setActiveTab('list');
    }
  }, [activeTab, canCreateVoucher]);

  useEffect(() => {
    if (focusVoucherId || focusTicketNumber) {
      setActiveTab('list');
    }
  }, [focusTicketNumber, focusVoucherId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== fileArray.length) {
      setMessage('Some files were skipped (must be PNG, JPG, or PDF, max 10MB each)');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentUser?.email) {
      setMessage('Please login again to submit voucher.');
      return;
    }

    try {
      setSubmitting(true);
      await voucherAPI.create({
        title: formData.title,
        description: `[${formData.requestType}] ${formData.problemDescription}`,
        priority: formData.priority,
        severity: formData.appointmentSeverity,
        preferred_date: formData.preferredDate || null,
        preferred_time: formData.preferredTime || null,
        status: 'pending',
        requester_email: currentUser.email,
        requester_name: formData.requester_name || currentUser.full_name || currentUser.email,
        requester_station: formData.requester_station || currentUser.station || null,
      });

      setFormData({
        title: '',
        requestType: 'technical',
        priority: 'medium',
        appointmentSeverity: 'medium',
        preferredDate: '',
        preferredTime: '',
        problemDescription: '',
        requester_name: currentUser.full_name || currentUser.username || currentUser.email || '',
        requester_station: currentUser.station || '',
      });
      setUploadedFiles([]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setMessage('Voucher submitted successfully.');
      await loadTickets();
      setActiveTab('list');
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Failed to submit voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId, nextStatus) => {
    try {
      await voucherAPI.update(ticketId, { status: nextStatus });
      setMessage('Ticket status updated.');
      await loadTickets();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Failed to update ticket status');
    }
  };

  const handleSaveNotes = async (ticketId) => {
    try {
      const payload = notesState[ticketId] || {};
      await voucherAPI.update(ticketId, {
        diagnosis: payload.diagnosis || null,
        action_taken: payload.action_taken || null,
      });
      setMessage('Diagnosis and action saved.');
      await loadTickets();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Failed to save diagnosis/action');
    }
  };

  const handleLinkDocument = async (ticketId) => {
    try {
      const selectedDocumentId = documentLinkState[ticketId] ? Number(documentLinkState[ticketId]) : null;
      if (!selectedDocumentId) {
        setMessage('Select a document to link.');
        return;
      }

      await documentAPI.linkToVoucher(selectedDocumentId, ticketId);
      setMessage('Document linked to ticket successfully.');
      await loadTickets();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Failed to link document');
    }
  };

  const displayedTickets = useMemo(() => {
    if (focusVoucherId) {
      return tickets.filter((ticket) => ticket.id === focusVoucherId);
    }

    if (focusTicketNumber) {
      return tickets.filter((ticket) => ticket.ticket_number === focusTicketNumber);
    }

    return tickets;
  }, [focusTicketNumber, focusVoucherId, tickets]);

  const hasTicketFilter = Boolean(focusVoucherId || focusTicketNumber);

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(buildDraftPayload()));
    setMessage('Draft saved locally.');
  };

  return (
    <div className="voucher-container">
      <UnifiedSidebar activePath="/voucher" />

      {/* Main Content */}
      <main className="voucher-main">
        <header className="voucher-header">
          <div>
            <h1>Voucher</h1>
            <p>Submit support requests, save drafts, and track progress in real time</p>
          </div>
          <div className="voucher-header-right">
            <button className="voucher-icon-btn" type="button" title="Toggle dark mode" onClick={toggleDarkMode}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="voucher-icon-btn">
              <Bell size={20} />
            </button>
            <div className="voucher-user">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="voucher-tabs">
          {canCreateVoucher && (
            <button
              className={`voucher-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <Calendar size={20} /> Book Appointment
            </button>
          )}
          <button
            className={`voucher-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <FileText size={20} /> {canCreateVoucher ? 'View Requests' : 'All Requests'}
          </button>
        </div>

        {message && <div className="voucher-message">{message}</div>}

        {canCreateVoucher && activeTab === 'create' && <div className="voucher-form-container">
          <h2>Submit New Request</h2>
          <p>Start now, save it as a draft if needed, and submit once the issue is ready.</p>

          <form onSubmit={handleSubmit}>
            <div className="voucher-form-group">
              <label>Issue Title *</label>
              <input
                type="text"
                placeholder="Enter issue title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="voucher-form-group">
              <label>Name *</label>
              <input
                type="text"
                placeholder="the name of the requester"
                value={formData.requester_name}
                onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                required
              />
            </div>

            <div className="voucher-form-group">
              <label>Issue Severity *</label>
              <select
                value={formData.appointmentSeverity}
                onChange={(e) => setFormData({ ...formData, appointmentSeverity: e.target.value })}
                required
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="simple">Simple</option>
              </select>
            </div>

            <div className="voucher-form-group voucher-appointment-card">
              <label>Preferred Appointment</label>
              <div className="voucher-appointment-grid">
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
                <input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                />
              </div>
              <small>Critical and high issues should be booked first on the IT calendar.</small>
            </div>

            <div className="voucher-form-group">
              <label>Station *</label>
              <select
                value={formData.requester_station}
                onChange={(e) => setFormData({ ...formData, requester_station: e.target.value })}
                required
              >
                <option value="">Select station</option>
                <option>Tamira Station</option>
                <option>Rwerere Station</option>
                <option>Nyagatare Station</option>
                <option>Muhanga Station</option>
                <option>Rubiizi Station</option>
                <option>Ngoma Station</option>
                <option>Musanze Station</option>
                <option>Nyamagabe Station</option>
                <option>Gishwati Station</option>
                <option>Songa Station</option>
                <option>Rubona Station</option>
                <option>Ntendezi Station</option>
                <option>Gakuta Station</option>
              </select>
            </div>

            <div className="voucher-form-group">
              <label>Request Type *</label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                required
              >
                <option value="technical">Technical</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
              </select>
            </div>

            <div className="voucher-form-group">
              <label>Category *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="voucher-form-group">
              <label>Problem Description *</label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                rows="6"
                required
              />
              <small>{formData.problemDescription.length} characters</small>
            </div>

            <div className="voucher-form-group voucher-upload-group">
              <label>Attachments (Optional)</label>
              <div 
                className="voucher-upload"
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ cursor: 'pointer' }}
              >
                <Upload size={24} />
                <p>Click to upload or drag and drop</p>
                <small>PNG, JPG, PDF up to 10MB</small>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Selected files ({uploadedFiles.length}):
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {uploadedFiles.map((file, index) => (
                      <li key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f0f2f5',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        fontSize: '14px'
                      }}>
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="voucher-form-actions">
              <button type="button" className="voucher-secondary-btn" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button type="submit" className="voucher-submit-btn">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>}

        {activeTab === 'list' && (
          <div className="voucher-form-container">
            <h2>Submitted Vouchers</h2>
            <p>Monitor and update ticket progress</p>

            {loading && <p>Loading vouchers...</p>}

            {!loading && displayedTickets.length === 0 && (
              <p>{(showOnlyMyTickets || isITRole) ? 'No pending tickets found.' : 'No vouchers found.'}</p>
            )}

            {!loading && hasTicketFilter && displayedTickets.length === 0 && (
              <p>Ticket from notification was not found in your accessible list.</p>
            )}

            {!loading && displayedTickets.length > 0 && (
              <div className="voucher-ticket-grid">
                {displayedTickets.map((ticket) => (
                  <div key={ticket.id} className={`voucher-ticket-card ${hasTicketFilter ? 'voucher-ticket-card-focus' : ''}`}>
                    <h4>{ticket.ticket_number} • {ticket.title}</h4>
                    <p>{ticket.description}</p>
                    <p>Priority: <strong>{ticket.priority}</strong> | Status: <strong>{getStatusLabel(ticket.status)}</strong></p>
                    <p><strong>Raised by:</strong> {ticket.requester_name || ticket.requester_email || 'Unknown staff member'}</p>
                    <p><strong>Station:</strong> {ticket.requester_station || 'Not provided'}</p>
                    <p><strong>Severity:</strong> {ticket.severity || ticket.priority || 'medium'}</p>
                    {(ticket.preferred_date || ticket.preferred_time) && (
                      <p>
                        <strong>Preferred appointment:</strong>{' '}
                        {[ticket.preferred_date, ticket.preferred_time].filter(Boolean).join(' ')}
                      </p>
                    )}

                    {canManageTickets && (
                      <div className="voucher-ticket-actions-row">
                        <button className="voucher-ticket-action" type="button" onClick={() => handleStatusChange(ticket.id, 'in_progress')}>
                          Mark Under Review
                        </button>
                        <button className="voucher-ticket-action" type="button" onClick={() => handleStatusChange(ticket.id, 'resolved')}>
                          Mark Completed
                        </button>
                        <button className="voucher-ticket-action voucher-ticket-action-danger" type="button" onClick={() => handleStatusChange(ticket.id, 'closed')}>
                          Archive
                        </button>
                      </div>
                    )}

                    {canManageTickets && (
                      <div className="voucher-ticket-manage">
                        <div className="voucher-ticket-notes">
                          <label className="voucher-ticket-label">Diagnosis</label>
                          <textarea
                            className="voucher-ticket-textarea"
                            rows="2"
                            value={notesState[ticket.id]?.diagnosis || ''}
                            onChange={(e) =>
                              setNotesState((prev) => ({
                                ...prev,
                                [ticket.id]: {
                                  diagnosis: e.target.value,
                                  action_taken: prev[ticket.id]?.action_taken || '',
                                },
                              }))
                            }
                          />

                          <label className="voucher-ticket-label">Action Taken</label>
                          <textarea
                            className="voucher-ticket-textarea"
                            rows="2"
                            value={notesState[ticket.id]?.action_taken || ''}
                            onChange={(e) =>
                              setNotesState((prev) => ({
                                ...prev,
                                [ticket.id]: {
                                  diagnosis: prev[ticket.id]?.diagnosis || '',
                                  action_taken: e.target.value,
                                },
                              }))
                            }
                          />
                          <button className="voucher-ticket-action" type="button" onClick={() => handleSaveNotes(ticket.id)}>Save Diagnosis/Action</button>
                        </div>

                        <div className="voucher-ticket-inline">
                          <label className="voucher-ticket-label">Link Document:</label>
                          <select
                            className="voucher-ticket-select"
                            value={documentLinkState[ticket.id] || ''}
                            onChange={(e) => setDocumentLinkState((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          >
                            <option value="">Select document</option>
                            {documents.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.document_ref} - {doc.name_of_staff}
                              </option>
                            ))}
                          </select>
                          <button className="voucher-ticket-action" type="button" onClick={() => handleLinkDocument(ticket.id)}>Link</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="voucher-footer">©2026. MURI</footer>
      </main>
    </div>
  );
};

export default VoucherPage;