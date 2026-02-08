import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="gc-nav">
      <div className="gc-nav-left">
        <Link to="/dashboard" className="gc-logo">
          GameComplete
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="gc-nav-right gc-nav-desktop">
        {user && (
          <>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
            >
              Dashboard
            </Link>
            <Link 
              to="/create-match" 
              className={isActive('/create-match') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
            >
              Create match
            </Link>
            <Link 
              to="/profile" 
              className={isActive('/profile') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
            >
              Profile
            </Link>
            <button onClick={onLogout} className="gc-btn-secondary">
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link 
              to="/login" 
              className={isActive('/login') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={isActive('/register') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="gc-nav-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={mobileMenuOpen ? 'gc-hamburger gc-hamburger-open' : 'gc-hamburger'}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile Navigation */}
      <div className={`gc-nav-mobile ${mobileMenuOpen ? 'gc-nav-mobile-open' : ''}`}>
        {user && (
          <>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/create-match" 
              className={isActive('/create-match') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create match
            </Link>
            <Link 
              to="/profile" 
              className={isActive('/profile') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="gc-btn-secondary">
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link 
              to="/login" 
              className={isActive('/login') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={isActive('/register') ? 'gc-nav-link gc-nav-link-active' : 'gc-nav-link'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
