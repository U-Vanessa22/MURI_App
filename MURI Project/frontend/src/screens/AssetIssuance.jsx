import { useEffect, useState } from 'react';
import { FaBoxOpen, FaCheckCircle, FaUndo } from 'react-icons/fa';
import UnifiedSidebar from '../components/layout/UnifiedSidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { assetAPI, assetVoucherAPI } from '../services/api';

/**
 * Real Voucher (asset issuance) feature - task 13 in the project plan.
 *
 * NOTE: uses local mock state for now - the backend model/route for this
 * (fields: id, asset_id, issued_to, issued_by, date_issued, status) doesn't exist yet.
 * Swap `vouchers`/`setVouchers` for a real API call once Bundle A/B wires up the backend.
 */
const AssetIssuance = () => {
  const [assets, setAssets] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_id: '', issued_to: '', issued_by: '' });

  const assetName = (assetId) => assets.find((a) => a.id === Number(assetId))?.name || 'Unknown asset';

  useEffect(() => {
    Promise.all([assetAPI.list(), assetVoucherAPI.list()]).then(([assetData, voucherData]) => {
      setAssets(assetData || []);
      setVouchers(voucherData || []);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.asset_id || !form.issued_to || !form.issued_by) return;

    assetVoucherAPI.create({ ...form, asset_id: Number(form.asset_id) }).then((createdVoucher) => {
      setVouchers((prev) => [createdVoucher, ...prev]);
      setAssets((prev) => prev.map((asset) => asset.id === createdVoucher.asset_id ? { ...asset, status: 'Assigned', assigned_to: createdVoucher.issued_to } : asset));
      setForm({ asset_id: '', issued_to: '', issued_by: '' });
      setShowForm(false);
    });
  };

  const markReturned = (id) => {
    assetVoucherAPI.returnAsset(id).then((returnedVoucher) => {
      setVouchers((prev) => prev.map((v) => (v.id === id ? returnedVoucher : v)));
      setAssets((prev) => prev.map((asset) => asset.id === returnedVoucher.asset_id ? { ...asset, status: 'Available', assigned_to: null } : asset));
    });
  };

  return (
    <div className="asset-issuance-page">
      <UnifiedSidebar activePath="/asset-issuance" />

      <main className="main-content">
        <TopNavbar title="Asset Issuance" />

        <div className="issuance-content">
          <div className="issuance-header">
            <div>
              <h1>Asset Issuance</h1>
              <p>Record which asset was issued to whom, and track returns.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="issuance-primary-btn"
            >
              <FaBoxOpen />
              Issue Asset
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="issuance-form"
            >
              <div className="issuance-field">
                <label>Asset</label>
                <select
                  value={form.asset_id}
                  onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                >
                  <option value="">Select an asset</option>
                  {assets.filter((asset) => asset.status === 'Available').map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.serial_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="issuance-field">
                <label>Issued To</label>
                <input
                  type="text"
                  value={form.issued_to}
                  onChange={(e) => setForm({ ...form, issued_to: e.target.value })}
                  placeholder="Staff name"
                />
              </div>

              <div className="issuance-field">
                <label>Issued By</label>
                <input
                  type="text"
                  value={form.issued_by}
                  onChange={(e) => setForm({ ...form, issued_by: e.target.value })}
                  placeholder="Admin name"
                />
              </div>

              <div className="issuance-form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="issuance-secondary-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="issuance-primary-btn"
                >
                  Confirm Issuance
                </button>
              </div>
            </form>
          )}

          <div className="issuance-table-card">
            <table className="issuance-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Issued To</th>
                  <th>Issued By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="issuance-table-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id}>
                    <td className="issuance-asset-name">{assetName(v.asset_id)}</td>
                    <td>{v.issued_to}</td>
                    <td>{v.issued_by}</td>
                    <td>{v.date_issued}</td>
                    <td>
                      <span
                        className={`issuance-status ${
                          v.status === 'Issued' ? 'issuance-status-issued' : 'issuance-status-returned'
                        }`}
                      >
                        {v.status === 'Issued' ? <FaBoxOpen size={10} /> : <FaCheckCircle size={10} />}
                        {v.status}
                      </span>
                    </td>
                    <td className="issuance-table-action">
                      {v.status === 'Issued' && (
                        <button
                          type="button"
                          onClick={() => markReturned(v.id)}
                          className="issuance-return-btn"
                        >
                          <FaUndo size={10} />
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="issuance-empty">
                      No assets issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetIssuance;
