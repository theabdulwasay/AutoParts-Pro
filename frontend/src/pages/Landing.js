import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getParts } from '../api';
import { Star, ArrowRight } from 'lucide-react';

export default function Landing({ onNav }) {
  const [featuredParts, setFeaturedParts] = useState([]);

  useEffect(() => {
    // Fetch some parts for the landing page
    getParts({ limit: 4 }).then(res => {
      // Just take the first 4 for display
      setFeaturedParts(res.data.slice(0, 4));
    }).catch(err => console.error(err));
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
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

      {/* ── Hero ── */}
      <section className="hero" style={{ padding: '140px 24px 100px' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.3 3.8 10.9l.6-3.6-2.6-2.5 3.6-.5L7 1z" fill="#60a5fa" />
            </svg>
            Premium Automotive Marketplace
          </div>
          <h1 style={{ fontSize: 64, lineHeight: 1.1 }}>Premium <span>Vehicle Spare Parts</span><br />Delivered Fast</h1>
          <p style={{ fontSize: 22, maxWidth: 650 }}>
            Find the perfect parts for any vehicle. Quality guaranteed, prices unbeatable.
            From engines to accessories — we've got everything your vehicle needs.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')} style={{ padding: '16px 32px', fontSize: 18 }}>
              Get Started Free
            </button>
            <button
              className="btn btn-lg btn-outline"
              onClick={() => onNav('about')}
              style={{ padding: '16px 32px', fontSize: 18 }}
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Featured Parts ── */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeIn}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 8 }}>Trending Parts</h2>
              <p className="section-sub" style={{ textAlign: 'left', margin: 0 }}>Top rated components by our customers</p>
            </div>
            <button className="btn btn-outline" onClick={() => onNav('signup')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {featuredParts.map(part => (
              <motion.div key={part.id} variants={fadeIn} className="card" onClick={() => onNav(`part:${part.id}`)} style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 180, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {part.image ? (
                    <img src={part.image} alt={part.name} style={{ maxHeight: 160, maxWidth: '90%', objectFit: 'contain' }} />
                  ) : (
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                  )}
                </div>
                <div className="card-body" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{part.category_name}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, flex: 1 }}>{part.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                    <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{part.average_rating || '5.0'}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>({part.reviews_count || 12})</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>${parseFloat(part.price).toFixed(2)}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="stats-section">
        <div className="stat-item">
          <div className="stat-number">10K+</div>
          <div className="stat-text">Parts Available</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">5K+</div>
          <div className="stat-text">Happy Customers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">99%</div>
          <div className="stat-text">Satisfaction Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-text">Expert Support</div>
        </div>
      </motion.div>

      {/* ── CTA ── */}
      <div style={{
        textAlign: 'center', padding: '100px 24px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.08) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
          <h2 className="section-title">Ready to Get Started?</h2>
          <p className="section-sub">Join thousands of customers who trust AutoParts Pro</p>
          <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')} style={{ padding: '16px 32px', fontSize: 18 }}>
            Create Free Account
          </button>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#3b82f6" />
            <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <strong style={{ color: '#94a3b8' }}>AutoParts Pro</strong>
        </div>
        <p>© {new Date().getFullYear()} AutoParts Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
