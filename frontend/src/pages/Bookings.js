import React, { useEffect, useState, useCallback } from 'react';
import { getBookings, updateBookingStatus, deleteBooking } from '../api';
import { toast } from '../components/Toast';
import Modal from '../components/Modal';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const ViewSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DeleteSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getBookings(filter ? { status: filter } : {})
      .then(r => setBookings(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast(`Booking status updated to ${status}!`, 'success');
      load();
      if (detail && detail.id === id) {
        setDetail(b => ({ ...b, status }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update booking status';
      toast(errMsg, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking record? Inventory items will be restored.')) return;
    try {
      await deleteBooking(id); 
      toast('Booking record deleted successfully!', 'success'); 
      setDetail(null); 
      load();
    } catch {
      toast('Failed to delete booking.', 'error');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <select 
          className="form-control" 
          style={{ width: 200 }} 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          {bookings.length} booking record(s) found
        </span>
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          bookings.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <p>No bookings match the selected status.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer details</th>
                    <th>Items ordered</th>
                    <th>Grand Total</th>
                    <th>Payment Method</th>
                    <th>Change Status</th>
                    <th>Booking Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td><strong style={{ color: '#fff' }}>#{b.id}</strong></td>
                      <td>
                        <div><strong style={{ color: '#fff' }}>{b.customer_name}</strong></div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{b.customer_email}</div>
                      </td>
                      <td>
                        <span className="badge badge-confirmed">
                          {b.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0} unit(s)
                        </span>
                      </td>
                      <td><strong style={{ color: '#10b981' }}>${Number(b.total_amount).toFixed(2)}</strong></td>
                      <td style={{ textTransform: 'capitalize' }}>{b.payment_method?.replace('_', ' ')}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ width: 130, padding: '4px 8px', fontSize: 13, height: 'auto', background: 'rgba(15,23,42,0.8)' }}
                          value={b.status}
                          onChange={e => handleStatus(b.id, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {new Date(b.booking_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm btn-icon" title="View details" onClick={() => setDetail(b)}><ViewSVG /></button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete record" onClick={() => handleDelete(b.id)}><DeleteSVG /></button>
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

      {detail && (
        <Modal 
          title={`Booking Details — ID #${detail.id}`} 
          onClose={() => setDetail(null)}
          footer={<button className="btn btn-outline" onClick={() => setDetail(null)}>Close</button>}
        >
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Customer Name</div>
                <strong style={{ color: '#fff' }}>{detail.customer_name}</strong>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Email Address</div>
                <span style={{ color: '#94a3b8' }}>{detail.customer_email}</span>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Booking Status</div>
                <span className={`badge badge-${detail.status}`}>{detail.status}</span>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Payment Method</div>
                <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{detail.payment_method?.replace('_', ' ')}</span>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Booking Timestamp</div>
                <span style={{ color: '#94a3b8' }}>{new Date(detail.booking_date).toLocaleString()}</span>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 4 }}>Total Amount Paid</div>
                <strong style={{ fontSize: 20, color: '#10b981' }}>${Number(detail.total_amount).toFixed(2)}</strong>
              </div>
            </div>
            
            {detail.notes && (
              <div style={{ marginBottom: 20, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 13, color: '#e2e8f0' }}>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>Customer Notes:</span> {detail.notes}
              </div>
            )}
            
            <div className="form-label" style={{ marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Ordered Items Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {detail.items?.map(item => (
                <div key={item.id} className="cart-item" style={{ padding: '8px 0' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: 13 }}>{item.part_name}</strong>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Part #: {item.part_number}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12 }}>{item.quantity} unit(s) × ${Number(item.unit_price).toFixed(2)}</div>
                    <strong style={{ color: '#fff', fontSize: 13 }}>${Number(item.subtotal).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
