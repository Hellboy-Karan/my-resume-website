import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submitRequest(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await api('/auth/forgot-password/request', { method: 'POST', body: JSON.stringify({ email: form.email }) });
      setMessage(data.message);
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function submitVerify(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/auth/forgot-password/verify', { method: 'POST', body: JSON.stringify({ email: form.email, otp: form.otp }) });
      setMessage('OTP verified. Set your new password.');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(event) {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await api('/auth/forgot-password/reset', { method: 'POST', body: JSON.stringify(form) });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-black text-ink">Forgot Password</h1>
      <p className="mt-2 text-slate-600">Verify your email with OTP and set a new password.</p>
      <form className="mt-6 grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-soft" onSubmit={step === 'request' ? submitRequest : step === 'verify' ? submitVerify : submitReset}>
        {message && <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} readOnly={step !== 'request'} required />
        {step !== 'request' && (
          <input className="input" placeholder="6 digit OTP" value={form.otp} maxLength={6} onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, '') })} required />
        )}
        {step === 'reset' && (
          <>
            <input className="input" placeholder="New Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <input className="input" placeholder="Confirm New Password" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
          </>
        )}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Please wait...' : step === 'request' ? 'Send OTP' : step === 'verify' ? 'Verify OTP' : 'Reset Password'}
        </button>
        <Link className="text-sm font-semibold text-steel" to="/login">Back to login</Link>
      </form>
    </section>
  );
}
