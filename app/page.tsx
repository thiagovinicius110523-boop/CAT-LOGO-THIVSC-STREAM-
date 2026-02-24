import Link from "next/link";
import LastAccessPanel from "@/components/LastAccessPanel";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Home(){
  const supabase=supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").maybeSingle();
  const { data: settings } = await supabase.from("app_settings").select("theme,layout").maybeSingle();
  const role = profile?.role || "user";
  return (<div className="container">
      <LastAccessPanel />
    <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
      <div><h1 className="h1">V11 • Aplicativo</h1>
        <div className="small" style={{marginTop:6}}>Usuário: <b>{user?.email}</b> • Role: <b>{role}</b> • Tema: <b>{settings?.theme}</b> • Layout: <b>{settings?.layout}</b></div>
      </div>
      <div className="row">
        <Link className="pill" href="/catalogo">Catálogo</Link>
        <Link className="pill" href="/notificacoes">Notificações</Link>
        <Link className="pill" href="/perfil">Perfil</Link>
        <Link className="pill" href="/config">Config</Link>
        {role==="admin" ? <Link className="pill pillPrimary" href="/admin">Admin</Link> : null}
        <Link className="pill" href="/suporte">Suporte</Link>
        <Link className="pill" href="/logout">Sair</Link>
      </div>
    </div>
  </div>);
}
