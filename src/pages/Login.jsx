import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      setSubmitting(true);
      await login(form.email.trim(), form.password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center text-white font-bold text-lg shadow-soft">
            IO
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Influencer Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              autoFocus
              placeholder="you@qurvii.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              placeholder="••••••••"
              className="input"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-xs text-slate-500 text-center">
            Don't have credentials? Ask your admin to add you.
          </p>
        </form>
      </div>
    </div>
  );
}
