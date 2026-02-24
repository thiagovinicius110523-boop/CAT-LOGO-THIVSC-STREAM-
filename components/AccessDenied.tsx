export default function AccessDenied({
  title = "Acesso restrito",
  message = "Você não tem permissão para acessar esta área.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="container">
      <div className="card">
        <h2>{title}</h2>
        <p style={{ marginTop: 8 }}>{message}</p>
      </div>
    </div>
  );
}
