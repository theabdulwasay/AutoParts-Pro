import React, { useEffect, useState } from 'react';
import { getParts, getCustomers, createCustomer, createBooking } from '../api';
import { toast } from '../components/Toast';

const SearchSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 16, height: 16 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TrashSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 12, height: 12 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function NewBooking({ onSuccess }) {
  const [parts, setParts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [payment, setPayment] = useState('cash');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [partSearch, setPartSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // New customer form
  const [newCust, setNewCust] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [showNewCust, setShowNewCust] = useState(false);

  useEffect(() => {
    Promise.all([
      getParts({ in_stock: 'true', search: partSearch }),
      getCustomers({ search })
    ]).then(([pr, cr]) => {
      setParts(pr.data.results || pr.data);
      setCustomers(cr.data.results || cr.data);
    });
  }, [search, partSearch]);

  const addToCart = (part) => {
    setCart(prev => {
      const existing = prev.find(i => i.part.id === part.id);
      if (existing) {
        if (existing.qty + 1 > part.stock_quantity) {
          toast(`Cannot exceed available stock of ${part.stock_quantity} units.`, 'error');
          return prev;
        }
        return prev.map(i => i.part.id === part.id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (part.stock_quantity < 1) {
        toast(`Part "${part.name}" is out of stock.`, 'error');
        return prev;
      }
      return [...prev, { part, qty: 1 }];
    });
  };

  const removeFromCart = (partId) => setCart(c => c.filter(i => i.part.id !== partId));
  
  const updateQty = (partId, qty) => {
    if (qty < 1) { 
      removeFromCart(partId); 
      return; 
    }
    const item = cart.find(i => i.part.id === partId);
    if (item && qty > item.part.stock_quantity) {
      toast(`Cannot exceed available stock of ${item.part.stock_quantity} units.`, 'error');
      return;
    }
    setCart(c => c.map(i => i.part.id === partId ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.qty * Number(i.part.price), 0);

  const handleAddCustomer = async () => {
    if (!newCust.first_name || !newCust.email || !newCust.phone) {
      toast('Please fill in all required customer fields.', 'error'); 
      return;
    }
    try {
      const r = await createCustomer(newCust);
      setCustomers(c => [r.data, ...c]);
      setCustomerId(String(r.data.id));
      setShowNewCust(false);
      setNewCust({ first_name: '', last_name: '', email: '', phone: '' });
      toast('Customer profile added successfully!', 'success');
    } catch { 
      toast('Email already exists or invalid data.', 'error'); 
    }
  };

  const handleSubmit = async () => {
    if (!customerId) { toast('Please select a customer.', 'error'); return; }
    if (cart.length === 0) { toast('Please add at least one part to the booking.', 'error'); return; }
    setSaving(true);
    try {
      await createBooking({
        customer: parseInt(customerId),
        payment_method: payment,
        notes,
        items: cart.map(i => ({ part: i.part.id, quantity: i.qty, unit_price: i.part.price }))
      });
      toast('Booking created successfully! 🎉', 'success');
      setCart([]); setCustomerId(''); setNotes('');
      onSuccess();
    } catch (err) {
      toast(err.response?.data ? JSON.stringify(err.response.data) : 'Error creating booking', 'error');
    } finally { 
      setSaving(false); 
    }
  };

  const nc = k => e => setNewCust(p => ({ ...p, [k]: e.target.value }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
      {/* Left: Parts + Customer Selection */}
      <div>
        {/* Customer Selection */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">1. Select Customer</span>
            <button className="btn btn-outline btn-sm" onClick={() => setShowNewCust(!showNewCust)}>
              {showNewCust ? 'Cancel' : '+ New Customer'}
            </button>
          </div>
          
          {showNewCust ? (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" value={newCust.first_name} onChange={nc('first_name')} placeholder="e.g. John" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-control" value={newCust.last_name} onChange={nc('last_name')} placeholder="e.g. Doe" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" value={newCust.email} onChange={nc('email')} placeholder="e.g. john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-control" value={newCust.phone} onChange={nc('phone')} placeholder="e.g. +123456789" />
                </div>
              </div>
              <button className="btn btn-success btn-sm" onClick={handleAddCustomer}>Save & Select Customer</button>
            </div>
          ) : (
            <div>
              <div className="search-wrap" style={{ marginBottom: 12 }}>
                <SearchSVG />
                <input 
                  className="form-control search-input" 
                  placeholder="Search customer by name, email, phone..."
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <select 
                className="form-control" 
                size={4} 
                value={customerId} 
                onChange={e => setCustomerId(e.target.value)}
                style={{ height: 120, padding: 8 }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id} style={{ padding: '6px 8px', borderRadius: 4, color: '#94a3b8' }}>
                    {c.first_name} {c.last_name} — {c.email} ({c.phone})
                  </option>
                ))}
              </select>
              {customerId && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Selected Customer: {customers.find(c => String(c.id) === customerId)?.first_name} {customers.find(c => String(c.id) === customerId)?.last_name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parts Selection */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">2. Add Parts to Cart</span>
          </div>
          <div className="search-wrap" style={{ marginBottom: 12 }}>
            <SearchSVG />
            <input 
              className="form-control search-input" 
              placeholder="Search parts by name, compatibility, or number..."
              value={partSearch} 
              onChange={e => setPartSearch(e.target.value)} 
            />
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 6 }}>
            {parts.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div>
                  <strong style={{ fontSize: 14, color: '#fff' }}>{p.name}</strong>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.part_number} • {p.vehicle_make} {p.vehicle_model}</div>
                  <div style={{ fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: '#3b82f6' }}>${Number(p.price).toFixed(2)}</strong>
                    <span style={{ fontSize: 11, color: p.stock_quantity < 5 ? '#f87171' : '#64748b' }}>
                      {p.stock_quantity} available
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => addToCart(p)}
                  disabled={p.stock_quantity < 1}
                >
                  {p.stock_quantity < 1 ? 'Out of Stock' : '+ Add'}
                </button>
              </div>
            ))}
            {parts.length === 0 && (
              <div className="empty-state" style={{ padding: 24 }}>
                <p>No in-stock parts match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart Summary */}
      <div>
        <div className="card" style={{ position: 'sticky', top: 90 }}>
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Order Cart
            </span>
            {cart.length > 0 && <span className="badge badge-confirmed">{cart.length} item(s)</span>}
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <p>Select customer and add parts to begin.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.part.id} className="cart-item">
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.part.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>${Number(item.part.price).toFixed(2)} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button className="btn btn-outline btn-sm btn-icon" onClick={() => updateQty(item.part.id, item.qty - 1)}>−</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>{item.qty}</span>
                    <button className="btn btn-outline btn-sm btn-icon" onClick={() => updateQty(item.part.id, item.qty + 1)}>+</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeFromCart(item.part.id)}><TrashSVG /></button>
                  </div>
                  <div style={{ minWidth: 65, textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: 13 }}>
                    ${(item.qty * Number(item.part.price)).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ margin: '16px 0', padding: '16px 0', borderTop: '2px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Grand Total</span>
              <span style={{ color: '#10b981', fontSize: 20, fontWeight: 800 }}>${total.toFixed(2)}</span>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-control" value={payment} onChange={e => setPayment(e.target.value)}>
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit / Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea 
                className="form-control" 
                rows={2} 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Delivery address details or notes..." 
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }}
            onClick={handleSubmit}
            disabled={saving || cart.length === 0 || !customerId}
          >
            {saving ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} />
                Placing Order...
              </>
            ) : 'Confirm & Place Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
