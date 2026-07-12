import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Parts from './pages/Parts';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Bookings from './pages/Bookings';
import NewBooking from './pages/NewBooking';
import Landing from './pages/Landing';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import PartDetails from './pages/PartDetails';
import { Toaster } from 'react-hot-toast';

// ── Admin sidebar icons ───────────────────────────────────────────────────────
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const PartsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CategoriesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const CustomersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const BookingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2m-2-2h4a2 2 0 012 2v1m-6-3a2 2 0 00-2 2v1" />
  </svg>
);
const NewBookingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ADMIN_NAV = [
  { key: 'dashboard', label: 'Dashboard',   icon: <DashboardIcon /> },
  { key: 'parts',     label: 'Spare Parts',  icon: <PartsIcon /> },
  { key: 'categories',label: 'Categories',  icon: <CategoriesIcon /> },
  { key: 'customers', label: 'Customers',   icon: <CustomersIcon /> },
  { key: 'bookings',  label: 'Bookings',    icon: <BookingsIcon /> },
  { key: 'new-booking',label:'New Booking', icon: <NewBookingIcon /> },
];

const ADMIN_TITLES = {
  dashboard: 'Dashboard Overview',
  parts: 'Spare Parts Inventory',
  categories: 'Part Categories',
  customers: 'Customer Management',
  bookings: 'Booking Management',
  'new-booking': 'Create New Booking',
};

// ── Admin layout ──────────────────────────────────────────────────────────────
function AdminLayout({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');

  const PAGE_MAP = {
    dashboard:   <Dashboard onNav={setPage} />,
    parts:       <Parts />,
    categories:  <Categories />,
    customers:   <Customers />,
    bookings:    <Bookings />,
    'new-booking': <NewBooking onSuccess={() => setPage('bookings')} />,
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 22, height: 22, stroke: '#3b82f6', strokeWidth: 2.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            AutoParts Pro
          </h2>
          <p>Admin Portal</p>
        </div>
        <nav>
          {ADMIN_NAV.map(n => (
            <button
              key={n.key}
              id={`admin-nav-${n.key}`}
              className={`nav-link ${page === n.key ? 'active' : ''}`}
              onClick={() => setPage(n.key)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8, color: '#94a3b8', fontSize: 12 }}>
            Signed in as <strong style={{ color: '#f8fafc' }}>{user.email}</strong>
          </div>
          <button
            id="admin-logout"
            onClick={onLogout}
            style={{
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '8px 16px', fontSize: 13,
              cursor: 'pointer', width: '100%', fontFamily: 'inherit',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <h1>{ADMIN_TITLES[page]}</h1>
          <span className="topbar-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="content">{PAGE_MAP[page]}</div>
      </div>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing'); // 'landing' | 'about' | 'login' | 'signup' | 'forgot' | 'part:id'
  const [cart, setCart] = useState([]);

  const handleAddToCart = (part) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === part.id);
      if (existing) {
        return prev.map(p => p.id === part.id ? { ...p, cartQty: p.cartQty + 1 } : p);
      }
      return [...prev, { ...part, cartQty: 1 }];
    });
  };

  // Rehydrate session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('landing');
  };

  // ── If authenticated, show role-specific view ────────────────────────────────
  if (user) {
    if (user.is_staff) {
      return (
        <>
          <AdminLayout user={user} onLogout={handleLogout} />
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
        </>
      );
    }
    
    // Customer routing
    if (page.startsWith('part:')) {
      const partId = page.split(':')[1];
      return (
        <>
          <PartDetails partId={partId} user={user} onBack={() => setPage('dashboard')} onAddToCart={handleAddToCart} />
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
        </>
      );
    }

    return (
      <>
        <CustomerDashboard user={user} onLogout={handleLogout} cart={cart} setCart={setCart} onNav={setPage} />
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
      </>
    );
  }

  // ── Public routing ───────────────────────────────────────────────────────────
  if (page.startsWith('part:')) {
    const partId = page.split(':')[1];
    return (
      <>
        <PartDetails partId={partId} user={null} onBack={() => setPage('landing')} onAddToCart={() => alert("Please login to add to cart.")} />
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
      </>
    );
  }
  const PUBLIC_PAGES = {
    landing: <Landing onNav={setPage} />,
    about:   <About   onNav={setPage} />,
    login:   <Login   onNav={setPage} onLogin={handleLogin} />,
    signup:  <Signup  onNav={setPage} onLogin={handleLogin} />,
    forgot:  <ForgotPassword onNav={setPage} />,
  };

  return (
    <>
      {PUBLIC_PAGES[page] || PUBLIC_PAGES['landing']}
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
    </>
  );
}
