import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import PendingOrdersTable from '../components/PendingOrdersTable';
import Loader from '../components/Loader';

export default function PendingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getPending();
      setOrders(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      o.styleNumber.toLowerCase().includes(q) ||
      o.influencerInstaId.toLowerCase().includes(q) ||
      o.size.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pending Orders</h1>
          <p className="text-slate-500 mt-1">
            New orders awaiting Shopify creation. Add the Shopify Order ID to mark as
            processed.
          </p>
        </div>
        <Link to="/create" className="btn-primary self-start">
          <span className="text-lg leading-none">+</span> New Order
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by style, influencer or size..."
          className="input max-w-md"
        />
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{' '}
          {orders.length}
        </div>
      </div>

      {loading ? <Loader /> : <PendingOrdersTable orders={filtered} onChanged={load} />}
    </div>
  );
}
