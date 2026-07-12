import React, { useState } from 'react';
import { signup as signupApi } from '../api';

export default function Signup({ onNav, onLogin }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm_password: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) { setError('Please enter a valid email address.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await signupApi({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3b82f6" />
            <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h1>AutoParts Pro</h1>
        </div>

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join thousands of customers finding the perfect parts</p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input id="signup-first-name" name="first_name" className="form-control" placeholder="John" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input id="signup-last-name" name="last_name" className="form-control" placeholder="Doe" value={form.last_name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input id="signup-email" name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input id="signup-phone" name="phone" type="tel" className="form-control" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                }}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="#64748b" strokeWidth="2" strokeLinecap="round" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="#64748b" strokeWidth="2" /></svg>
                  }
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input id="signup-confirm-password" name="confirm_password" type={showPass ? 'text' : 'password'} className="form-control" placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} autoComplete="new-password" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address <span style={{ color: '#64748b' }}>(optional)</span></label>
            <input id="signup-address" name="address" className="form-control" placeholder="Your delivery address" value={form.address} onChange={handleChange} />
          </div>

          <button type="submit" id="signup-submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <button className="auth-link" onClick={() => onNav('login')}>Sign In</button>
        </p>
        <p className="auth-footer" style={{ marginTop: 12 }}>
          <button className="auth-back" onClick={() => onNav('landing')}>← Back to Home</button>
        </p>
      </div>
    </div>
  );
}
