export default function EmptyState({ title, description, icon = '📦', action }) {
  return (
    <div className="card p-10 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
