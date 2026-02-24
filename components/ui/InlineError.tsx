export default function InlineError({ message }: { message: string }) {
  return (
    <div
      className="card"
      style={{
        border: "1px solid rgba(255,0,0,0.25)",
        background: "rgba(255,0,0,0.06)",
      }}
    >
      <strong>Erro</strong>
      <div style={{ marginTop: 6 }}>{message}</div>
    </div>
  );
}
