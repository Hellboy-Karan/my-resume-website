import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, FileText, LogOut, Settings, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from './RoleBadge.jsx';

const nav = [
  ['Home', '/'],
  ['Resume', '/resume'],
  ['Templates', '/templates'],
  ['Resume Analyzer', '/resume-analyzer']
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const menuItems = user ? userMenuItems(user.role) : [];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-black uppercase tracking-wide text-ink">
            AI Resume Builder
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="relative flex items-center gap-2" ref={menuRef}>
            {user ? (
              <>
                <button
                  className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:flex"
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  <UserRound size={16} /> {user.name} <RoleBadge role={user.role} />
                </button>
                <button className="btn-secondary px-3 sm:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="User menu">
                  <UserRound size={16} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-30 w-64 rounded-md border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <strong className="block text-sm text-ink">{user.name}</strong>
                      <span className="block truncate text-xs text-slate-500">{user.email}</span>
                    </div>
                    <div className="py-2">
                      {menuItems.map(({ label, href, Icon }) => (
                        <Link
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                          to={href}
                          key={label}
                          onClick={() => setMenuOpen(false)}
                        >
                          <Icon size={16} /> {label}
                        </Link>
                      ))}
                    </div>
                    <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
                <button className="btn-secondary px-3" onClick={logout} aria-label="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link className="btn-secondary" to="/login">Login</Link>
                <Link className="btn-primary" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function userMenuItems(role) {
  if (role === 'ADMIN') {
    return [
      { label: 'Admin Dashboard', href: '/', Icon: BarChart3 },
      { label: 'User Management', href: '/resume', Icon: Users },
      { label: 'Resume Management', href: '/resume', Icon: FileText },
      { label: 'Profile Settings', href: '/settings', Icon: Settings }
    ];
  }
  if (role === 'SUB_ADMIN') {
    return [
      { label: 'Resume Management', href: '/resume', Icon: ShieldCheck },
      { label: 'Profile Settings', href: '/settings', Icon: Settings }
    ];
  }
  return [
    { label: 'Profile Settings', href: '/settings', Icon: Settings },
    { label: 'My Resume', href: '/resume', Icon: FileText },
    { label: 'Dashboard', href: '/', Icon: BarChart3 }
  ];
}
