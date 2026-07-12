import React, { useState, useEffect, useCallback } from 'react';
import { getParts, getCategories, createBooking, getBookings, getProfile, updateProfile, getWishlist, deleteWishlistItem } from '../api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', Processing: '#8b5cf6',
  Shipped: '#06b6d4', Delivered: '#10b981', Cancelled: '#ef4444',
};

export default function CustomerDashboard({ user, onLogout, cart, setCart, onNav }) {
  const [tab, setTab] = useState('browse');
  // ── Parts / Cart state ───────────────────────────────────────────────────────
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [cartMsg, setCartMsg] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  // ── Bookings state ───────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);
  // ── Wishlist state ───────────────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  // ── Profile state ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ first_name: user.first_name, last_name: user.last_name, phone: '', address: '', email: user.email });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadParts = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      const res = await getParts(params);
      setParts(res.data.results || res.data);
    } catch {}
  }, [search, catFilter]);

  useEffect(() => { loadParts(); }, [loadParts]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await getBookings();
      setBookings(res.data.results || res.data);
    } catch {} finally { setBookingsLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'bookings') loadBookings(); }, [tab, loadBookings]);

  useEffect(() => { if (tab === 'bookings') loadBookings(); }, [tab, loadBookings]);

  const loadWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      const res = await getWishlist();
      setWishlist(res.data.results || res.data);
    } catch {} finally { setWishlistLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'wishlist') loadWishlist(); }, [tab, loadWishlist]);

  const removeWishlist = async (id) => {
    try {
      await deleteWishlistItem(id);
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  useEffect(() => {
    if (tab === 'profile') {
      getProfile().then(r => setProfile(r.data)).catch(() => {});
    }
  }, [tab]);

  // ── Cart helpers ─────────────────────────────────────────────────────────────
  const addToCart = (part) => {
    setCart(prev => {
      const existing = prev.find(i => i.part.id === part.id);
      if (existing) {
        if (existing.qty >= part.stock_quantity) { setCartMsg(`Only ${part.stock_quantity} in stock`); setTimeout(() => setCartMsg(''), 3000); return prev; }
        return prev.map(i => i.part.id === part.id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (part.stock_quantity < 1) { setCartMsg('Out of stock'); setTimeout(() => setCartMsg(''), 3000); return prev; }
      return [...prev, { part, qty: 1 }];
    });
  };

  const changeQty = (partId, delta) => {
    setCart(prev => prev.map(i => i.part.id === partId ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.part.stock_quantity)) } : i));
  };
  const removeFromCart = (partId) => setCart(prev => prev.filter(i => i.part.id !== partId));

  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.part.price) * i.qty, 0);

  // ── Place order ───────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (cart.length === 0) { setCartMsg('Your cart is empty.'); return; }
    setOrderLoading(true); setCartMsg('');
    try {
      await createBooking({
        payment_method: payMethod,
        notes,
        items: cart.map(i => ({ part: i.part.id, quantity: i.qty })),
      });
      setCart([]);
      setNotes('');
      setCartMsg('✓ Order placed successfully!');
      setTimeout(() => setCartMsg(''), 4000);
    } catch (err) {
      setCartMsg(err.response?.data?.error || 'Failed to place order.');
    } finally { setOrderLoading(false); }
  };

  // ── Save profile ──────────────────────────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault(); setProfileLoading(true); setProfileMsg('');
    try {
      await updateProfile({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone, address: profile.address });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch { setProfileMsg('Failed to update profile.'); } finally { setProfileLoading(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="customer-layout">
      {/* Topbar */}
      <header className="customer-topbar">
        <div className="customer-topbar-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3b82f6" />
            <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          AutoParts Pro
        </div>
        <div className="customer-topbar-user">
          <span className="customer-topbar-welcome">Welcome,</span>
          <span className="customer-topbar-name">{user.first_name} {user.last_name}</span>
          <button id="customer-logout" className="btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', fontSize: 13 }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="customer-tabs">
        {[
          { key: 'browse', label: 'Browse Parts', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
          { key: 'bookings', label: 'My Bookings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
          { key: 'wishlist', label: 'My Wishlist', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
          { key: 'profile', label: 'My Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
        ].map(t => (
          <button key={t.key} id={`tab-${t.key}`} className={`customer-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="customer-content">

        {/* ── Browse Parts ──────────────────────────────────────────────────── */}
        {tab === 'browse' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <input
                id="parts-search"
                className="form-control"
                style={{ flex: 1, minWidth: 200 }}
                placeholder="Search parts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select id="parts-category" className="form-control" style={{ width: 200 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="parts-catalog-layout">
              {/* Parts Grid */}
              <div>
                <div className="parts-grid">
                  {parts.length === 0
                    ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#64748b' }}>No parts found.</div>
                    : parts.map(p => (
                      <div key={p.id} className="part-card" onClick={() => onNav(`part:${p.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="part-card-name">{p.name}</div>
                        <div className="part-card-meta">
                          {p.brand && <><strong>Brand:</strong> {p.brand}<br /></>}
                          {p.vehicle_type && <><strong>For:</strong> {p.vehicle_type}<br /></>}
                          {p.category_name && <><strong>Category:</strong> {p.category_name}</>}
                        </div>
                        <div className="part-card-footer">
                          <div>
                            <div className="part-card-price">PKR {parseFloat(p.price).toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: p.stock_quantity > 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
                              {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of stock'}
                            </div>
                          </div>
                          <button
                            id={`add-to-cart-${p.id}`}
                            className="btn btn-primary"
                            style={{ fontSize: 13, padding: '8px 14px' }}
                            disabled={p.stock_quantity < 1}
                            onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Cart Panel */}
              <div className="cart-panel">
                <h3 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Cart {cart.length > 0 && <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 12 }}>{cart.length}</span>}
                </h3>

                {cartMsg && (
                  <div style={{
                    background: cartMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${cartMsg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    color: cartMsg.startsWith('✓') ? '#6ee7b7' : '#fca5a5', fontSize: 13,
                  }}>{cartMsg}</div>
                )}

                {cart.length === 0
                  ? <div className="cart-empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <p style={{ fontSize: 14 }}>Your cart is empty</p>
                    </div>
                  : (
                    <>
                      <div className="cart-items-list">
                        {cart.map(item => (
                          <div key={item.part.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.part.name}</div>
                              <div style={{ color: '#64748b', fontSize: 12 }}>PKR {parseFloat(item.part.price).toLocaleString()}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button onClick={() => changeQty(item.part.id, -1)} style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ color: '#f8fafc', fontWeight: 700, width: 20, textAlign: 'center', fontSize: 14 }}>{item.qty}</span>
                              <button onClick={() => changeQty(item.part.id, 1)} style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                              <button onClick={() => removeFromCart(item.part.id)} style={{ width: 26, height: 26, background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', marginLeft: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <span style={{ color: '#94a3b8', fontSize: 14 }}>Total</span>
                          <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18 }}>PKR {cartTotal.toLocaleString()}</span>
                        </div>

                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label className="form-label" style={{ fontSize: 13 }}>Payment Method</label>
                          <select id="cart-payment" className="form-control" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                            <option>Cash</option>
                            <option>Credit Card</option>
                            <option>Debit Card</option>
                            <option>Bank Transfer</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                          <label className="form-label" style={{ fontSize: 13 }}>Notes (optional)</label>
                          <textarea id="cart-notes" className="form-control" rows={2} placeholder="Any delivery notes…" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
                        </div>

                        <button id="place-order-btn" className="btn btn-primary" style={{ width: '100%' }} onClick={placeOrder} disabled={orderLoading}>
                          {orderLoading ? 'Placing order…' : `Place Order • PKR ${cartTotal.toLocaleString()}`}
                        </button>
                      </div>
                    </>
                  )
                }
              </div>
            </div>
          </>
        )}

        {/* ── My Bookings ───────────────────────────────────────────────────── */}
        {tab === 'bookings' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700 }}>My Bookings</h2>
              <button id="refresh-bookings" className="btn" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', fontSize: 13 }} onClick={loadBookings}>
                Refresh
              </button>
            </div>

            {bookingsLoading
              ? <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Loading…</div>
              : bookings.length === 0
                ? <div style={{ textAlign: 'center', padding: 64, color: '#64748b' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#64748b" strokeWidth="2" strokeLinecap="round" /></svg>
                    <p>No bookings yet. Start shopping!</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('browse')}>Browse Parts</button>
                  </div>
                : (
                  <div className="bookings-list">
                    {bookings.map(b => (
                      <div key={b.id} className="booking-row">
                        <div className="booking-header">
                          <div>
                            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>Order #{b.id}</div>
                            <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                              {new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}{b.payment_method}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{
                              background: `${STATUS_COLORS[b.status] || '#64748b'}18`,
                              color: STATUS_COLORS[b.status] || '#64748b',
                              border: `1px solid ${STATUS_COLORS[b.status] || '#64748b'}30`,
                              borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600,
                            }}>{b.status}</span>
                            <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: 16 }}>
                              PKR {parseFloat(b.total_amount).toLocaleString()}
                            </span>
                            <button
                              id={`expand-booking-${b.id}`}
                              onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'transform 0.2s', transform: expandedBooking === b.id ? 'rotate(180deg)' : 'none' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                          </div>
                        </div>

                        {expandedBooking === b.id && b.items && (
                          <div className="booking-items-expand">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                              <thead>
                                <tr style={{ color: '#64748b' }}>
                                  <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 600 }}>Part</th>
                                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>Qty</th>
                                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>Price</th>
                                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {b.items.map(item => (
                                  <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ color: '#f8fafc', padding: '8px 0' }}>{item.part_name}</td>
                                    <td style={{ color: '#94a3b8', textAlign: 'right', padding: '8px 0' }}>{item.quantity}</td>
                                    <td style={{ color: '#94a3b8', textAlign: 'right', padding: '8px 0' }}>PKR {parseFloat(item.unit_price).toLocaleString()}</td>
                                    <td style={{ color: '#3b82f6', textAlign: 'right', padding: '8px 0', fontWeight: 700 }}>PKR {parseFloat(item.subtotal).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {b.notes && <p style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>📝 {b.notes}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
            }
          </>
        )}

        {/* ── My Wishlist ───────────────────────────────────────────────────── */}
        {tab === 'wishlist' && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Wishlist</h2>
            {wishlistLoading ? (
              <p style={{ color: '#94a3b8' }}>Loading wishlist...</p>
            ) : wishlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p style={{ color: '#94a3b8', fontSize: 16 }}>Your wishlist is empty.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {wishlist.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                        {item.part_details.category_name}
                      </div>
                      <div style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                        {item.part_details.name}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 14 }}>
                        Added on {new Date(item.added_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700 }}>
                        PKR {parseFloat(item.part_details.price).toLocaleString()}
                      </div>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => { addToCart(item.part_details); toast.success('Added to cart'); }}
                        disabled={item.part_details.stock_quantity < 1}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', padding: '10px' }}
                        onClick={() => removeWishlist(item.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── My Profile ────────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Profile</h2>

            {profileMsg && (
              <div style={{
                background: profileMsg.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${profileMsg.includes('success') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                color: profileMsg.includes('success') ? '#6ee7b7' : '#fca5a5', fontSize: 14,
              }}>{profileMsg}</div>
            )}

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Personal Information</h3>
              </div>
              <form onSubmit={saveProfile} style={{ padding: 24 }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input id="profile-email" className="form-control" value={profile.email || user.email} disabled style={{ opacity: 0.6 }} />
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Email cannot be changed.</p>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input id="profile-first-name" className="form-control" value={profile.first_name || ''} onChange={e => setProfile({ ...profile, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input id="profile-last-name" className="form-control" value={profile.last_name || ''} onChange={e => setProfile({ ...profile, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input id="profile-phone" className="form-control" placeholder="+1 234 567 8900" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea id="profile-address" className="form-control" rows={3} placeholder="Your delivery address" value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" id="profile-save" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
