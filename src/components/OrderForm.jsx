import { useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api';

const initial = { styleNumber: '', size: '', influencerInstaId: '', notes: '' };

const sizeOptions = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'FREE SIZE'];

export default function OrderForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.styleNumber.trim() || !form.size.trim() || !form.influencerInstaId.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await orderApi.create(form);
      if (res.success) {
        toast.success('Order created successfully');
        setForm(initial);
        onCreated?.(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Fill in the details below to create a new influencer order.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label">
            Style Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="styleNumber"
            value={form.styleNumber}
            onChange={handleChange}
            placeholder="e.g. QV-1024"
            className="input uppercase"
            required
          />
        </div>

        <div>
          <label className="label">
            Size <span className="text-rose-500">*</span>
          </label>
          <select name="size" value={form.size} onChange={handleChange} className="input" required>
            <option value="">Select size</option>
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">
            Influencer Instagram ID <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              @
            </span>
            <input
              type="text"
              name="influencerInstaId"
              value={form.influencerInstaId}
              onChange={handleChange}
              placeholder="influencer_handle"
              className="input pl-7 lowercase"
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any special instructions for processing..."
            className="input resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setForm(initial)}
          className="btn-secondary"
          disabled={submitting}
        >
          Reset
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
