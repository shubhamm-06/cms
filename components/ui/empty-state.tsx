export function EmptyState({ message = "No records yet." }: { message?: string }) {
  return <div className="p-10 text-center text-sm text-[var(--muted)]">{message}</div>;
}
