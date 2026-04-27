export default function StatsCard({ label, value, accent = 'brand', icon }) {
  const accents = {
    brand: 'from-brand-500 to-brand-700',
    amber: 'from-amber-400 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-700',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${accents[accent]} flex items-center justify-center text-white text-xl shadow-soft`}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
