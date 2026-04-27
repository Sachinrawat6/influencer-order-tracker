import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Create form
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [creating, setCreating] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPw, setResetPw] = useState('');
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await authApi.listUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || form.password.length < 8) {
      toast.error('Email + password (min 8 chars) required');
      return;
    }
    try {
      setCreating(true);
      const res = await authApi.signup(form);
      if (res.success) {
        toast.success(`User created: ${res.data.email}`);
        setForm({ email: '', password: '', role: 'user' });
        load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (u) => {
    if (u.id === me?.id) {
      toast.error("You can't delete your own account");
      return;
    }
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    try {
      setBusyId(u.id);
      const res = await authApi.deleteUser(u.id);
      if (res.success) {
        toast.success('User deleted');
        load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  const onResetSubmit = async (e) => {
    e.preventDefault();
    if (resetPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setResetting(true);
      const res = await authApi.resetUserPassword(resetTarget.id, resetPw);
      if (res.success) {
        toast.success(`Password reset for ${resetTarget.email}`);
        setResetTarget(null);
        setResetPw('');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">
          Add teammates, reset passwords, or remove access. Admins can manage
          all users.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={onCreate}
        className="card p-5 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="md:col-span-1">
          <label className="label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="teammate@qurvii.com"
            className="input"
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="label">Password</label>
          <input
            type="text"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="Min 8 chars"
            className="input font-mono"
            minLength={8}
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="label">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className="input"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="md:col-span-1 flex items-end">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={creating}
          >
            {creating ? 'Adding...' : '+ Add User'}
          </button>
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users yet"
          description="Create your first user with the form above."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-600">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isMe = u.id === me?.id;
                  const isBusy = busyId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {u.email}
                        {isMe && (
                          <span className="ml-2 text-xs text-slate-500">
                            (you)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={
                            u.role === 'admin'
                              ? 'badge bg-brand-100 text-brand-800'
                              : 'badge bg-slate-100 text-slate-700'
                          }
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => {
                              setResetTarget(u);
                              setResetPw('');
                            }}
                            className="btn-secondary py-1.5 px-3 text-xs"
                            disabled={isBusy}
                          >
                            Reset PW
                          </button>
                          <button
                            onClick={() => onDelete(u)}
                            className="btn-danger py-1.5 px-3 text-xs"
                            disabled={isBusy || isMe}
                            title={isMe ? "Can't delete yourself" : ''}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 flex items-center justify-center px-4">
          <form
            onSubmit={onResetSubmit}
            className="card w-full max-w-md p-6 space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Reset password
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Set a new password for{' '}
                <span className="font-mono">{resetTarget.email}</span>. Share
                it with them over a secure channel.
              </p>
            </div>
            <div>
              <label className="label">New password</label>
              <input
                type="text"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
                className="input font-mono"
                minLength={8}
                autoFocus
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setResetTarget(null)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
