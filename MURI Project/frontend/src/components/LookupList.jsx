import React, { useState } from 'react';
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa';

// Generic add/rename/delete list editor, used for the Departments and
// Stations lookup tables on the admin Users page.
const LookupList = ({ title, items, onCreate, onUpdate, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;

    setError('');
    setBusy(true);
    try {
      await onCreate(name);
      setNewName('');
    } catch (err) {
      setError(err?.response?.data?.detail || `Failed to add ${title.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (item) => {
    const name = editingName.trim();
    if (!name || name === item.name) {
      cancelEdit();
      return;
    }

    setError('');
    setBusy(true);
    try {
      await onUpdate(item.id, name);
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.detail || `Failed to rename ${title.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item) => {
    setError('');
    setBusy(true);
    try {
      await onDelete(item.id);
    } catch (err) {
      setError(err?.response?.data?.detail || `Failed to delete ${title.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ flex: 1, minWidth: 240 }}>
      <h4 style={{ margin: '0 0 8px' }}>{title}</h4>
      {error && <div className="modal-error" style={{ marginBottom: 8 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, maxHeight: 240, overflowY: 'auto' }}>
        {items.length === 0 && <p className="field-hint">None yet.</p>}
        {items.map((item) => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px' }}
          >
            {editingId === item.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button type="button" className="row-action-btn" disabled={busy} onClick={() => saveEdit(item)}>Save</button>
                <button type="button" className="row-action-btn" disabled={busy} onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1 }}>{item.name}</span>
                <button type="button" className="row-action-btn" disabled={busy} onClick={() => startEdit(item)}>
                  <FaPen />
                </button>
                <button type="button" className="row-action-btn danger" disabled={busy} onClick={() => handleDelete(item)}>
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder={`New ${title.toLowerCase().replace(/s$/, '')}`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          style={{ flex: 1 }}
        />
        <button type="button" className="row-action-btn" disabled={busy || !newName.trim()} onClick={handleCreate}>
          <FaPlus /> Add
        </button>
      </div>
    </div>
  );
};

export default LookupList;
