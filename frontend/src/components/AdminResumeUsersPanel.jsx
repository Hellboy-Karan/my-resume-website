import { useEffect, useState } from 'react';
import { Eye, RefreshCw, Search, Shield, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Skeleton from './Skeleton.jsx';
import RoleBadge from './RoleBadge.jsx';

export default function AdminResumeUsersPanel({ currentUser }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', role: 'all', status: 'all' });
  const [selected, setSelected] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function load(page = pagination.page) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ ...filters, page, limit: pagination.limit });
      const data = await api(`/admin/resume-users?${params.toString()}`);
      setRows(data.users || []);
      setPagination(data.pagination || pagination);
    } catch (_err) {
      setError('Unable to load user resume management data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadUserResumes(user) {
    setSelected(user);
    setBusy(`view-${user.id}`);
    setError('');
    try {
      const data = await api(`/admin/users/${user.id}/resumes`);
      setUserResumes(data.resumes || []);
    } catch (_err) {
      setError('Unable to load resumes for this user.');
      setUserResumes([]);
    } finally {
      setBusy('');
    }
  }

  async function toggleVisibility(resume) {
    setBusy(`publish-${resume.id}`);
    try {
      await api(`/admin/resumes/${resume.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublic: !resume.is_public })
      });
      if (selected) await loadUserResumes(selected);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update resume visibility.');
    } finally {
      setBusy('');
    }
  }

  async function deleteResume(resume) {
    setBusy(`delete-${resume.id}`);
    try {
      await api(`/admin/resumes/${resume.id}`, { method: 'DELETE' });
      if (selected) await loadUserResumes(selected);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to delete resume.');
    } finally {
      setBusy('');
    }
  }

  useEffect(() => {
    load(1);
  }, [filters.role, filters.status]);

  function submitSearch(event) {
    event.preventDefault();
    load(1);
  }

  function canDeleteUserResume(ownerRole) {
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.role === 'SUB_ADMIN' && ownerRole === 'USER';
  }

  return (
    <section className="mt-10 rounded-md border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-coral">Admin Console</p>
          <h2 className="text-2xl font-black text-ink">User Resume Management</h2>
          <p className="text-slate-600">Review users who created resumes, moderate visibility, and manage resume access.</p>
        </div>
        <button className="btn-secondary" onClick={() => load()} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]" onSubmit={submitSearch}>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input h-12 pl-12 pr-4" placeholder="Search name, email, or username" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        </label>
        <select className="input" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}>
          <option value="all">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="SUB_ADMIN">Sub Admin</option>
          <option value="USER">User</option>
        </select>
        <select className="input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="btn-primary">Search</button>
      </form>

      {error && <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
      {loading && <div className="mt-5 rounded-md border border-slate-200 p-4"><Skeleton lines={8} /></div>}

      {!loading && !rows.length && (
        <div className="mt-5 rounded-md border border-dashed border-slate-300 p-8 text-center">
          <Shield className="mx-auto text-slate-400" size={34} />
          <h3 className="mt-3 text-xl font-black text-ink">No user resumes found</h3>
          <p className="mt-2 text-slate-600">Users who create resumes will appear here.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Published</th>
                <th className="px-3 py-3">Draft</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Last Activity</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-3">
                    <strong className="block text-ink">{row.name}</strong>
                    <span className="text-slate-500">{row.email}</span>
                  </td>
                  <td className="px-3 py-3"><RoleBadge role={row.role} /></td>
                  <td className="px-3 py-3 font-bold">{row.total_resumes}</td>
                  <td className="px-3 py-3 font-bold text-emerald-700">{row.published_resumes || 0}</td>
                  <td className="px-3 py-3 font-bold text-slate-600">{row.draft_resumes || 0}</td>
                  <td className="px-3 py-3">{formatDate(row.created_at)}</td>
                  <td className="px-3 py-3">{formatDate(row.last_activity)}</td>
                  <td className="px-3 py-3">
                    <button className="btn-secondary px-3" onClick={() => loadUserResumes(row)} disabled={busy === `view-${row.id}`}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500">Page {pagination.page} of {pagination.totalPages} | {pagination.total} users</p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</button>
            <button className="btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>Next</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-ink">{selected.name}'s Resumes</h3>
              <p className="text-sm text-slate-600">{selected.email}</p>
            </div>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
          </div>
          {!userResumes.length ? (
            <p className="mt-4 rounded-md bg-white p-4 text-sm font-semibold text-slate-500">No resumes found for this user.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {userResumes.map((resume) => (
                <article className="rounded-md border border-slate-200 bg-white p-4" key={resume.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-ink">{resume.title || 'Untitled Resume'}</h4>
                      <p className="text-sm text-slate-600">Template: {resume.template_slug} | Updated: {formatDate(resume.updated_at)}</p>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-black ${resume.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {resume.is_public ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="btn-secondary" to={`/resume/${selected.username}`}><Eye size={16} /> View Public</Link>
                    <button className="btn-secondary" onClick={() => toggleVisibility(resume)} disabled={busy === `publish-${resume.id}`}>
                      {resume.is_public ? 'Unpublish' : 'Publish'}
                    </button>
                    {canDeleteUserResume(selected.role) && (
                      <button className="btn-secondary" onClick={() => deleteResume(resume)} disabled={busy === `delete-${resume.id}`}>
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                    {currentUser.role === 'SUB_ADMIN' && selected.role === 'ADMIN' && (
                      <span className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">Admin resumes are protected</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
}
