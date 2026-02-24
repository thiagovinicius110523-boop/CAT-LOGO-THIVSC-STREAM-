import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
export default async function NoAccess(){
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return (<div className="container"><div className="card" style={{padding:18,maxWidth:720,margin:"70px auto"}}>
    <h1 className="h1">Acesso não autorizado</h1>
    <p className="small" style={{marginTop:10}}>Seu e-mail (<b>{user?.email}</b>) não está liberado na whitelist.</p>
    <div className="row" style={{marginTop:12}}><Link className="pill" href="/logout">Sair</Link><Link className="pill" href="/login">Tentar novamente</Link></div>
  </div></div>);
}
