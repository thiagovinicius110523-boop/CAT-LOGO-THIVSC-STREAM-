import Link from "next/link";
import LoginForm from "./ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ padding: 18, maxWidth: 540, margin: "70px auto" }}>
        <h1 className="h1">Entrar</h1>
        <p className="small" style={{ marginTop: 10 }}>
          Acesso restrito. Somente usuários na <b>Whitelist</b> podem usar o app.
        </p>

        <div style={{ marginTop: 14 }}>
          <LoginForm />
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
          <Link className="small" href="/reset-password">
            Esqueci minha senha
          </Link>

          <Link className="small" href="/">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}