export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-border bg-base-800/50 py-16 text-center">
      {Icon && <Icon className="h-10 w-10 text-ink-700" strokeWidth={1.5} />}
      <h3 className="font-display text-lg font-semibold text-ink-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}
