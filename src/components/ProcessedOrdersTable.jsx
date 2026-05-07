import { useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from './EmptyState';

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

export default function ProcessedOrdersTable({ orders, onChanged }) {
  const { isAdmin } = useAuth();
  const [busyId, setBusyId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    try {
      setBusyId(id);
      const res = await orderApi.remove(id);
      if (res.success) {
        toast.success('Order deleted');
        onChanged?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No processed orders yet"
        description="Once you add Shopify Order IDs to pending orders, they will appear here."
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-600">
              <th className="px-5 py-3 font-semibold">Style #</th>
              <th className="px-5 py-3 font-semibold">Size</th>
              <th className="px-5 py-3 font-semibold">Influencer</th>
              <th className="px-5 py-3 font-semibold">Shopify Order ID</th>
              <th className="px-5 py-3 font-semibold">Address</th>
              <th className="px-5 py-3 font-semibold">Processed</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              {isAdmin && <th className="px-5 py-3 font-semibold text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => {
              const isBusy = busyId === o.id;
              return (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                    {o.styleNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-700">
                      {o.size}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <a
                      href={`https://instagram.com/${o.influencerInstaId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-700 hover:text-brand-900 hover:underline"
                    >
                      @{o.influencerInstaId}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-emerald-700">
                    {o.shopifyOrderId}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={o.notes}>
                    {o.notes || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                    {formatDate(o.processedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge-processed">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Processed
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="btn-danger py-1.5 px-3 text-xs"
                        disabled={isBusy}
                      >
                        {isBusy ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
