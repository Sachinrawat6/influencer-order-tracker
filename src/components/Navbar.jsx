import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const baseLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/create', label: 'Create Order' },
  { to: '/pending', label: 'Pending' },
  { to: '/processed', label: 'Processed' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const links = isAdmin
    ? [...baseLinks, { to: '/users', label: 'Users' }]
    : baseLinks;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-soft">
              IO
            </div>
            <div className="leading-tight">
              <div className="font-bold text-slate-900">Influencer Orders</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                Tracker
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/create"
              className="btn-primary hidden sm:inline-flex"
            >
              <span className="text-lg leading-none">+</span> New Order
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm flex items-center justify-center"
                title={user?.email}
                aria-label="User menu"
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 card p-1 z-40">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {user?.email}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                  <Link
                    to="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Change password
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/users"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Manage users
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-rose-700 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 -mx-1 px-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
