import Link from "next/link";
export default function Catalogo() {
  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1">Catálogo</h1>
        <Link className="pill" href="/">Voltar</Link>
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">Início</h2>
          <p className="small" style={{ marginTop: 8 }}>Apresentação editável pelo Admin.</p>
          <div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/inicio">Abrir</Link></div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">Cursos</h2>
          <p className="small" style={{ marginTop: 8 }}>Cursos por categoria. Dentro do curso: módulos/aulas.</p>
          <div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/cursos">Abrir</Link></div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">Livros</h2>
          <p className="small" style={{ marginTop: 8 }}>Livros por categoria (abrir por link).</p>
          <div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/livros">Abrir</Link></div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">Arquivos</h2>
          <p className="small" style={{ marginTop: 8 }}>Arquivos por categoria (abrir por link).</p>
          <div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/arquivos">Abrir</Link></div>
        </div>
      </div>
    </div>
  );
}
