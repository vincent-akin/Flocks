export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="rounded-card border border-border bg-surface-elevated p-8 shadow-elevated">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
