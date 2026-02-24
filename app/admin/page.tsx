import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
export default async function AdminHome() {
  const supabase = supabaseServer();
  const { data: profile } = await supabase.from("profiles").select("role").maybeSingle();
  const role = profile?.role || "user";
  if (role !== "admin") {
    return (
      <div className="container">
        <div className="card" style={{ padding: 18, maxWidth: 720, margin: "70px auto" }}>
          <h1 className="h1">Acesso negado</h1>
          <div className="small" style={{ marginTop: 10 }}>Somente admin.</div>
          <div style={{ marginTop: 12 }}><Link className="pill" href="/">Voltar</Link></div>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1">Admin</h1>
        <Link className="pill" href="/">Voltar</Link>
      </div>
      <div className="grid" style={{ marginTop: 18 }}>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Categorias</h2><div className="small" style={{ marginTop: 8 }}>CRUD completo</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/categorias">Abrir</Link></div></div>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Itens</h2><div className="small" style={{ marginTop: 8 }}>Cursos/Livros/Arquivos + vínculo em categoria</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/itens">Abrir</Link></div></div>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Módulos/Aulas</h2><div className="small" style={{ marginTop: 8 }}>Etapa 3 (CRUD)</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/cursos">Abrir</Link></div></div>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Whitelist</h2><div className="small" style={{ marginTop: 8 }}>Máximo 5 ativos</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/whitelist">Abrir</Link></div></div>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Notificações</h2><div className="small" style={{ marginTop: 8 }}>Criar e publicar</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/notificacoes">Abrir</Link></div></div>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Início</h2><div className="small" style={{ marginTop: 8 }}>Título/subtítulo + cards</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/inicio">Abrir</Link></div></div>
        <div className="card" style={{ padding: 16 }}><h2 className="h2">Tema/Layout</h2><div className="small" style={{ marginTop: 8 }}>Salvar no banco</div><div style={{ marginTop: 10 }}><Link className="pill pillPrimary" href="/admin/visual">Abrir</Link></div></div>
      </div>
    </div>
  );
}
