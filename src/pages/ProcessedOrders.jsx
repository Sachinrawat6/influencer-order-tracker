import { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import ProcessedOrdersTable from '../components/ProcessedOrdersTable';
import Loader from '../components/Loader';

export default function ProcessedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getProcessed();
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
      (o.shopifyOrderId || '').toLowerCase().includes(q) ||
      o.size.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Processed Orders</h1>
        <p className="text-slate-500 mt-1">
          Orders that have been created in Shopify, with their Shopify Order IDs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by style, influencer, size or Shopify ID..."
          className="input max-w-md"
        />
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{' '}
          {orders.length}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <ProcessedOrdersTable orders={filtered} onChanged={load} />
      )}
    </div>
  );
}
