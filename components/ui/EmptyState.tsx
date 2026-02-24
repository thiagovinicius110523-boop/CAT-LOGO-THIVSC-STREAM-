export default function EmptyState({
  title = "Nada por aqui",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h3>{title}</h3>
      {description ? <p style={{ marginTop: 8, opacity: 0.85 }}>{description}</p> : null}
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}
