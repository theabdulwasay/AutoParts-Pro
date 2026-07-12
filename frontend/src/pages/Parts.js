import React, { useEffect, useState, useCallback } from 'react';
import { getParts, getCategories, createPart, updatePart, deletePart } from '../api';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';

const EMPTY_FORM = {
  name: '', part_number: '', brand: '', vehicle_make: '', vehicle_model: '',
  vehicle_year: new Date().getFullYear(), condition: 'new', price: '',
  stock_quantity: '', description: '', category: '',
};

const SearchSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EditSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const DeleteSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [condFilter, setCondFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'form'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getParts({ search, category: catFilter, condition: condFilter }),
      getCategories()
    ]).then(([pr, cr]) => {
      setParts(pr.data.results || pr.data);
      setCats(cr.data.results || cr.data);
    }).finally(() => setLoading(false));
  }, [search, catFilter, condFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal('form'); };
  const openEdit = (p) => {
    setForm({ ...p, category: p.category });
    setEditId(p.id); setModal('form');
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    
    // Client-side validations
    if (Number(form.price) <= 0) {
      toast('Price must be greater than zero.', 'error');
      return;
    }
    if (Number(form.stock_quantity) < 0) {
      toast('Stock quantity cannot be negative.', 'error');
      return;
    }
    const currentYear = new Date().getFullYear();
    if (Number(form.vehicle_year) < 1900 || Number(form.vehicle_year) > currentYear + 1) {
      toast(`Enter a valid vehicle year between 1900 and ${currentYear + 1}.`, 'error');
      return;
    }

    setSaving(true);
    try {
      if (editId) { 
        await updatePart(editId, form); 
        toast('Spare part updated successfully!', 'success'); 
      } else { 
        await createPart(form); 
        toast('New spare part added to inventory!', 'success'); 
      }
      setModal(null); 
      load();
    } catch (err) {
      toast(err.response?.data ? JSON.stringify(err.response.data) : 'Error saving part', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await deletePart(id); 
      toast('Spare part removed from inventory', 'success'); 
      load();
    } catch {
      toast('Failed to delete part. Check if it is linked to any existing bookings.', 'error');
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const getStockBarClass = (qty) => {
    if (qty < 5) return 'low';
    if (qty < 12) return 'medium';
    return 'high';
  };

  const getStockPercentage = (qty) => {
    return Math.min(100, Math.max(5, (qty / 25) * 100)); // normalized to 25 items max visual range
  };

  return (
    <div>
      <div className="toolbar">
        <div className="search-wrap">
          <SearchSVG />
          <input 
            className="form-control search-input" 
            placeholder="Search parts by name, number, brand, vehicle..."
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="form-control" style={{ width: 180 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="form-control" style={{ width: 160 }} value={condFilter} onChange={e => setCondFilter(e.target.value)}>
          <option value="">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 16, height: 16, strokeWidth: 2.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Part
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            {parts.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <p>No spare parts found matching the criteria.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Part Number</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Vehicle Compatibility</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th>Price</th>
                    <th style={{ width: 160 }}>Stock Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map(p => (
                    <tr key={p.id}>
                      <td><code style={{ color: '#60a5fa', fontWeight: 'bold' }}>{p.part_number}</code></td>
                      <td><strong style={{ color: '#fff' }}>{p.name}</strong></td>
                      <td>{p.brand}</td>
                      <td>{p.vehicle_make} {p.vehicle_model} ({p.vehicle_year})</td>
                      <td>{p.category_name}</td>
                      <td><span className={`badge badge-${p.condition}`}>{p.condition}</span></td>
                      <td><strong style={{ color: '#10b981' }}>${Number(p.price).toFixed(2)}</strong></td>
                      <td>
                        <div>
                          <span className={`badge ${p.stock_quantity > 0 ? 'badge-in-stock' : 'badge-out'}`}>
                            {p.stock_quantity > 0 ? `${p.stock_quantity} available` : 'Out of stock'}
                          </span>
                          {p.stock_quantity > 0 && (
                            <div className="stock-bar-container">
                              <div 
                                className={`stock-bar ${getStockBarClass(p.stock_quantity)}`} 
                                style={{ width: `${getStockPercentage(p.stock_quantity)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm btn-icon" title="Edit" onClick={() => openEdit(p)}><EditSVG /></button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(p.id, p.name)}><DeleteSVG /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {modal === 'form' && (
        <Modal 
          title={editId ? 'Edit Spare Part' : 'Add New Spare Part'} 
          onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update Part' : 'Add Part'}
            </button>
          </>}
        >
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Part Name *</label>
                <input className="form-control" required value={form.name} onChange={f('name')} placeholder="e.g. Brake Pad Set" />
              </div>
              <div className="form-group">
                <label className="form-label">Part Number *</label>
                <input className="form-control" required value={form.part_number} onChange={f('part_number')} placeholder="e.g. BP-001" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <input className="form-control" required value={form.brand} onChange={f('brand')} placeholder="e.g. Bosch" />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" required value={form.category} onChange={f('category')}>
                  <option value="">Select category</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Vehicle Make</label>
                <input className="form-control" value={form.vehicle_make} onChange={f('vehicle_make')} placeholder="Toyota" />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Model</label>
                <input className="form-control" value={form.vehicle_model} onChange={f('vehicle_model')} placeholder="Corolla" />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input className="form-control" type="number" value={form.vehicle_year} onChange={f('vehicle_year')} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-control" value={form.condition} onChange={f('condition')}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="form-control" type="number" step="0.01" required value={form.price} onChange={f('price')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Qty *</label>
                <input className="form-control" type="number" required value={form.stock_quantity} onChange={f('stock_quantity')} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={f('description')} placeholder="Add details about vehicle compatibility, material, etc..." />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
