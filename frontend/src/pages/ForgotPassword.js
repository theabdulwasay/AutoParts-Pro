import React, { useState, useRef } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from '../api';

export default function ForgotPassword({ onNav }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const otpRefs = useRef([]);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await forgotPassword({ email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    const clean = val.replace(/\D/, '').slice(0, 1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    if (clean && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      await verifyOtp({ email, code });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  };

  // ── Step 3: Reset password ──────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (passwords.new_password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (passwords.new_password !== passwords.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await resetPassword({ email, code: otp.join(''), new_password: passwords.new_password });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  const stepLabels = ['Email', 'Verify', 'Reset'];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3b82f6" />
            <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h1>AutoParts Pro</h1>
        </div>

        {step < 4 && (
          <>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">
              {step === 1 && "Enter your email and we'll send you a verification code"}
              {step === 2 && `We sent a 6-digit code to ${email}`}
              {step === 3 && 'Create a strong new password'}
            </p>

            {/* Progress steps */}
            <div className="auth-steps">
              {stepLabels.map((l, i) => (
                <div key={l} className={`auth-step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`} title={l} />
              ))}
            </div>
          </>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
          }}>{error}</div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="forgot-email"
                type="email" className="form-control"
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" id="forgot-send-otp" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label className="form-label" style={{ display: 'block', textAlign: 'center', marginBottom: 4 }}>
              Enter the 6-digit code
            </label>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKey(e, i)}
                  ref={(el) => (otpRefs.current[i] = el)}
                />
              ))}
            </div>
            <button type="submit" id="forgot-verify-otp" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
              Didn't receive the code?{' '}
              <button type="button" className="auth-link" onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}>
                Resend
              </button>
            </p>
          </form>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="forgot-new-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  style={{ paddingRight: 44 }}
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
              <label className="form-label">Confirm New Password</label>
              <input
                id="forgot-confirm-password"
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="Repeat new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <button type="submit" id="forgot-reset-submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4 – Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ color: '#f8fafc', marginBottom: 12 }}>Password Reset!</h2>
            <p style={{ color: '#94a3b8', marginBottom: 28 }}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button id="forgot-go-login" className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNav('login')}>
              Go to Login
            </button>
          </div>
        )}

        {step < 4 && (
          <p className="auth-footer" style={{ marginTop: 24 }}>
            <button className="auth-back" onClick={() => onNav('login')}>← Back to Login</button>
          </p>
        )}
      </div>
    </div>
  );
}
