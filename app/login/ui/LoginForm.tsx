"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Toast from "@/components/Toast";
export default function LoginForm(){
  const supabase = supabaseBrowser();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false); const [toast,setToast]=useState<any>(null);
  async function onSubmit(e:React.FormEvent){ e.preventDefault(); setLoading(true);
    try{ const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; window.location.href="/"; }
    catch(err:any){ setToast({id:crypto.randomUUID(),text:err?.message||"Erro ao entrar.",kind:"err"}); }
    finally{ setLoading(false); }
  }
  return (<><form onSubmit={onSubmit}><div style={{display:"grid",gap:10}}>
    <input className="input" placeholder="E-mail" value={email} onChange={(e)=>setEmail(e.target.value)} />
    <input className="input" placeholder="Senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
    <button className="pill pillPrimary" style={{width:"100%"}} disabled={loading}>{loading?"Entrando...":"Entrar"}</button>
    <div className="small">Admin cria usuários no Supabase Auth e libera na whitelist (até 5).</div>
  </div></form><Toast message={toast}/></>);
}
