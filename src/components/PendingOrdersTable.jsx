import { useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api';
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

export default function PendingOrdersTable({ orders, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [shopifyId, setShopifyId] = useState('');
  const [busyId, setBusyId] = useState(null);

  const startEdit = (order) => {
    setEditingId(order.id);
    setShopifyId(order.shopifyOrderId || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShopifyId('');
  };

  const handleProcess = async (id) => {
    if (!shopifyId.trim()) {
      toast.error('Please enter Shopify Order ID');
      return;
    }

    try {
      setBusyId(id);
      const res = await orderApi.process(id, shopifyId);
      if (res.success) {
        toast.success('Order moved to Processed');
        cancelEdit();
        onChanged?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    } finally {
      setBusyId(null);
    }
  };

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

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon="✨"
        title="No pending orders"
        description="All caught up! New orders will appear here as soon as they are created."
      />
    );
  }

  return (
    <div className="card overflow-hidden ">
      <div className="overflow-x-auto ">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-600">
              <th className="px-5 py-3 font-semibold">Style #</th>
              <th className="px-5 py-3 font-semibold">Size</th>
              <th className="px-5 py-3 font-semibold">Influencer</th>
              <th className="px-5 py-3 font-semibold">Address</th>
              <th className="px-5 py-3 font-semibold">Created</th>
              <th className="px-5 py-3 font-semibold w-[280px]">Shopify Order ID</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => {
              const isEditing = editingId === o.id;
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
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://instagram.com/${o.influencerInstaId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-700 hover:text-brand-900 hover:underline"
                      >
                        @{o.influencerInstaId}
                      </a>
                      <button
                        onClick={() => handleCopy(o.influencerInstaId, 'Influencer ID')}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy influencer ID"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={o.notes}>
                    <div className="flex items-center gap-2">
                      <span className="truncate">{o.notes || '—'}</span>
                      {o.notes && (
                        <button
                          onClick={() => handleCopy(o.notes, 'Address')}
                          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                          title="Copy address"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={shopifyId}
                        onChange={(e) => setShopifyId(e.target.value)}
                        autoFocus
                        placeholder="e.g. #1042"
                        className="input py-1.5 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleProcess(o.id)}
                      />
                    ) : (
                      <span className="badge-pending">Awaiting</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="btn-secondary py-1.5 px-3 text-xs"
                          disabled={isBusy}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleProcess(o.id)}
                          className="btn-primary py-1.5 px-3 text-xs"
                          disabled={isBusy}
                        >
                          {isBusy ? 'Saving...' : 'Save & Process'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(o)}
                          className="btn-primary py-1.5 px-3 text-xs"
                        >
                          Add Order ID
                        </button>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="btn-danger py-1.5 px-3 text-xs"
                          disabled={isBusy}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
