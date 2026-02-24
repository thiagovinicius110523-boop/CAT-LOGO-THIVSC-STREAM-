import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Config() {
  const supabase = supabaseServer();
  const { data: settings } = await supabase.from("app_settings").select("theme, layout").maybeSingle();
  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1">Configurações</h1>
        <Link className="pill" href="/">Voltar</Link>
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div className="small">Tema/Layout são definidos pelo Admin (salvo no banco).</div>
        <div className="row" style={{ marginTop: 14 }}>
          <div className="kpi"><b>{settings?.theme}</b><div className="small">tema</div></div>
          <div className="kpi"><b>{settings?.layout}</b><div className="small">layout</div></div>
        </div>
      </div>
    </div>
  );
}
