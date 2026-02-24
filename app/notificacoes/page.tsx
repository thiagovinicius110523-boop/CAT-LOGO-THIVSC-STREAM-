import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Notificacoes() {
  const supabase = supabaseServer();
  const { data: notes } = await supabase.from("notifications").select("id,title,body,created_at").eq("published", true).order("created_at", { ascending: false });
  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1">Notificações</h1>
        <Link className="pill" href="/">Voltar</Link>
      </div>
      <div className="grid" style={{ marginTop: 18 }}>
        {(notes || []).map(n => (
          <div className="card" style={{ padding: 16 }} key={n.id}>
            <h2 className="h2">{n.title}</h2>
            <div className="small" style={{ marginTop: 8 }}>{n.body}</div>
          </div>
        ))}
        {!notes?.length ? (
          <div className="card" style={{ padding: 16 }}>
            <h2 className="h2">Sem notificações</h2>
            <div className="small" style={{ marginTop: 8 }}>O admin pode publicar avisos.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
