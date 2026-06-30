import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
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
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:flex">
                  <UserRound size={16} /> {user.name} <RoleBadge role={user.role} />
                </span>
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
