import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Inicio() {
  const supabase = supabaseServer();
  const { data: home } = await supabase.from("home_content").select("title,subtitle").maybeSingle();
  const { data: cards } = await supabase.from("home_cards").select("id,title,body,kind").order("created_at", { ascending: false });

  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="h1">{home?.title || "Início"}</h1>
          <div className="small" style={{ marginTop: 6 }}>{home?.subtitle || ""}</div>
        </div>
        <Link className="pill" href="/catalogo">Voltar</Link>
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        {(cards || []).map(c => (
          <div className="card" style={{ padding: 16 }} key={c.id}>
            <h2 className="h2">{c.title}</h2>
            <div className="small" style={{ marginTop: 8 }}>{c.body}</div>
            <div className="small" style={{ marginTop: 10 }}>Tipo: <b>{c.kind}</b></div>
          </div>
        ))}
        {!cards?.length ? (
          <div className="card" style={{ padding: 16 }}>
            <h2 className="h2">Sem cards</h2>
            <div className="small" style={{ marginTop: 8 }}>O admin pode criar cards.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
