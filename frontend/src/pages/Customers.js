import React, { useEffect, useState, useCallback } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', address: '' };

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

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getCustomers({ search })
      .then(r => setCustomers(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm(c); setEditId(c.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); 
    
    // Client side email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast('Please enter a valid email address.', 'error');
      return;
    }
    if (form.phone.trim().length < 6) {
      toast('Please enter a valid phone number.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editId) { 
        await updateCustomer(editId, form); 
        toast('Customer profile updated successfully!', 'success'); 
      } else { 
        await createCustomer(form); 
        toast('New customer profile added!', 'success'); 
      }
      setModal(false); 
      load();
    } catch (err) {
      toast(err.response?.data?.email?.[0] || 'Error saving customer details', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"? All linked booking history will be removed.`)) return;
    try {
      await deleteCustomer(id); 
      toast('Customer profile deleted', 'success'); 
      load();
    } catch {
      toast('Failed to delete customer profile.', 'error');
    }
  };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="toolbar">
        <div className="search-wrap">
          <SearchSVG />
          <input 
            className="form-control search-input" 
            placeholder="Search customers by first/last name, email, phone..."
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 16, height: 16, strokeWidth: 2.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          customers.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>No customers found matching the search criteria.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Address</th>
                    <th>Booking Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td><strong style={{ color: '#fff' }}>{c.first_name} {c.last_name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.address}>
                        {c.address || '—'}
                      </td>
                      <td>
                        <span className="badge badge-confirmed">
                          {c.total_bookings} booking(s)
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm btn-icon" title="Edit" onClick={() => openEdit(c)}><EditSVG /></button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(c.id, `${c.first_name} ${c.last_name}`)}><DeleteSVG /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {modal && (
        <Modal 
          title={editId ? 'Edit Customer Profile' : 'Add New Customer Profile'} 
          onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update Customer' : 'Add Customer'}
            </button>
          </>}
        >
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" required value={form.first_name} onChange={f('first_name')} placeholder="e.g. John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" required value={form.last_name} onChange={f('last_name')} placeholder="e.g. Doe" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-control" type="email" required value={form.email} onChange={f('email')} placeholder="e.g. john.doe@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-control" required value={form.phone} onChange={f('phone')} placeholder="e.g. +1234567890" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Billing/Delivery Address</label>
              <textarea 
                className="form-control" 
                rows={3} 
                value={form.address} 
                onChange={f('address')} 
                placeholder="Enter street, city, state and zip code details..." 
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
