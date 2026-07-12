import React from 'react';

export default function About({ onNav }) {
  const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Ford', 'Nissan', 'Hyundai', 'Kia', 'Audi', 'Volkswagen', 'Mitsubishi', 'Suzuki'];

  return (
    <div style={{ minHeight: '100vh', background: '#090d16' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo" onClick={() => onNav('landing')}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3b82f6" />
            <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          AutoParts Pro
        </div>
        <div className="landing-nav-links">
          <button onClick={() => onNav('landing')}>Home</button>
          <button onClick={() => onNav('about')}>About</button>
          <button onClick={() => onNav('login')}>Login</button>
          <button className="nav-highlight" onClick={() => onNav('signup')}>Sign Up</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '80px 24px 60px',
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)',
      }}>
        <div className="hero-badge" style={{ display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.3 3.8 10.9l.6-3.6-2.6-2.5 3.6-.5L7 1z" fill="#60a5fa" />
          </svg>
          Our Story
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: '#f8fafc', marginBottom: 20, letterSpacing: '-0.03em' }}>
          About <span style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AutoParts Pro</span>
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          We are a passionate team of automotive enthusiasts dedicated to providing the highest quality spare parts at unbeatable prices.
        </p>
      </div>

      {/* Mission */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 64 }}>
          <div className="feature-card" style={{ textAlign: 'left', padding: '36px' }}>
            <div className="feature-icon" style={{ background: 'rgba(59,130,246,0.12)', marginBottom: 20, marginLeft: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Our Mission</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
              To make quality automotive parts accessible to every vehicle owner. We believe that maintaining your vehicle shouldn't be complicated or expensive. Our platform connects you directly to verified suppliers, cutting out the middleman and passing the savings to you.
            </p>
          </div>
          <div className="feature-card" style={{ textAlign: 'left', padding: '36px' }}>
            <div className="feature-icon" style={{ background: 'rgba(16,185,129,0.12)', marginBottom: 20, marginLeft: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="5.5" cy="18.5" r="2.5" stroke="#10b981" strokeWidth="2" />
                <circle cx="18.5" cy="18.5" r="2.5" stroke="#10b981" strokeWidth="2" />
              </svg>
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Our Vision</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
              To become the most trusted automotive parts marketplace in the region. We envision a world where every driver has instant access to the parts they need, with full confidence in their quality and authenticity — delivered right to their doorstep.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="section-title" style={{ marginBottom: 12 }}>Our Core Values</h2>
        <p className="section-sub">The principles that guide everything we do</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 64 }}>
          {[
            { icon: '🔒', title: 'Integrity', desc: 'We stand behind every product we sell.' },
            { icon: '⚡', title: 'Speed', desc: 'Fast processing, fast delivery, fast support.' },
            { icon: '💎', title: 'Quality', desc: 'Only certified, genuine parts make our catalogue.' },
            { icon: '🤝', title: 'Trust', desc: 'Built on thousands of happy customer relationships.' },
          ].map(v => (
            <div key={v.title} className="feature-card" style={{ padding: '28px 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{v.icon}</div>
              <h3 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Brands */}
        <h2 className="section-title" style={{ marginBottom: 12 }}>Supported Vehicle Brands</h2>
        <p className="section-sub">We stock parts for all major manufacturers</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {brands.map(b => (
            <span key={b} style={{
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 8, padding: '8px 18px', color: '#94a3b8', fontSize: 14, fontWeight: 500,
            }}>{b}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <h2 style={{ color: '#f8fafc', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ready to find your parts?</h2>
        <p style={{ color: '#94a3b8', marginBottom: 28 }}>Join thousands of customers who trust AutoParts Pro.</p>
        <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')}>Get Started Free</button>
      </div>

      <footer className="landing-footer">
        © {new Date().getFullYear()} AutoParts Pro. All rights reserved.
      </footer>
    </div>
  );
}
