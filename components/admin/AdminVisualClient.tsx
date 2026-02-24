"use client";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
const THEMES=["Galaxy Soft (Padrão)","Galaxy Neon (Glow forte)","Ocean Blue (Mais claro)","Purple Night","Emerald Dark (Sutil)"];
const LAYOUTS=["Modelo 01","Modelo 02","Modelo 03","Modelo 04"];
export default function AdminVisualClient(){
  const [theme,setTheme]=useState(THEMES[0]); const [layout,setLayout]=useState(LAYOUTS[0]); const [loading,setLoading]=useState(false);
  async function load(){ const r=await fetch("/api/admin/settings",{cache:"no-store"}); const j=await r.json(); if(r.ok&&j.data){ setTheme(j.data.theme); setLayout(j.data.layout);} }
  useEffect(()=>{ load().catch(()=>{}); },[]);
  async function save(setToast:any){
    setLoading(true); try{
      const r=await fetch("/api/admin/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({theme,layout})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Tema/Layout salvos!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }
  return (
    <AdminShell title="Admin • Tema/Layout" backHref="/admin">
      {(setToast)=>(
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row">
            <select className="select" value={theme} onChange={(e)=>setTheme(e.target.value)} style={{maxWidth:340}}>
              {THEMES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select className="select" value={layout} onChange={(e)=>setLayout(e.target.value)} style={{maxWidth:220}}>
              {LAYOUTS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
            <button className="pill pillPrimary" disabled={loading} onClick={()=>save(setToast)}>{loading?"Salvando...":"Salvar"}</button>
          </div>
          <div className="small" style={{marginTop:10}}>Tema/Layout ficam em <b>app_settings</b>.</div>
        </div>
      )}
    </AdminShell>
  );
}
