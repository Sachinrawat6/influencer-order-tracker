import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import StatsCard from '../components/StatsCard';
import Loader from '../components/Loader';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, processed: 0 });
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [s, p] = await Promise.all([orderApi.getStats(), orderApi.getPending()]);
      setStats(s.data);
      setRecentPending((p.data || []).slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your influencer orders.</p>
        </div>
        <Link to="/create" className="btn-primary self-start">
          <span className="text-lg leading-none">+</span> Create New Order
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total Orders" value={stats.total} accent="brand" icon="📦" />
        <StatsCard label="Pending" value={stats.pending} accent="amber" icon="⏳" />
        <StatsCard label="Processed" value={stats.processed} accent="emerald" icon="✅" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Pending Orders</h2>
          <Link to="/pending" className="text-sm text-brand-700 hover:text-brand-900 font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : recentPending.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            🎉 No pending orders right now
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentPending.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-semibold text-xs">
                    {o.size}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono font-semibold text-slate-900 truncate">
                      {o.styleNumber}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      @{o.influencerInstaId}
                    </div>
                  </div>
                </div>
                <span className="badge-pending">Pending</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
