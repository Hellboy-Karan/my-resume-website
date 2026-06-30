import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(form);
      navigate(`/resume/${loggedInUser.username}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-black text-ink">Login</h1>
      <form className="mt-6 grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-soft" onSubmit={submit}>
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary">Login</button>
        <Link className="text-sm font-semibold text-steel" to="/register">Create a new account</Link>
      </form>
    </section>
  );
}
