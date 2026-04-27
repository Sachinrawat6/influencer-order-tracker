import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (form.newPassword !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.currentPassword === form.newPassword) {
      toast.error('New password must be different from current');
      return;
    }
    try {
      setSubmitting(true);
      const res = await authApi.changeMyPassword(
        form.currentPassword,
        form.newPassword
      );
      if (res.success) {
        toast.success('Password updated');
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Change Password
        </h1>
        <p className="text-slate-500 mt-1">
          Rotate your password. You'll stay signed in on this device.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label">Current password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            autoComplete="current-password"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            autoComplete="new-password"
            className="input"
            minLength={8}
            required
          />
          <p className="text-xs text-slate-500 mt-1">At least 8 characters.</p>
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={onChange}
            autoComplete="new-password"
            className="input"
            required
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
