"use client";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
type Row={id:string;title:string;body:string;published:boolean;created_at:string};
export default function AdminNotificationsClient(){
  const [title,setTitle]=useState(""); const [body,setBody]=useState(""); const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(false);
  async function load(){ const r=await fetch("/api/admin/notifications",{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro"); setRows(j.data||[]); }
  useEffect(()=>{ load().catch(()=>{}); },[]);
  async function create(setToast:any){ if(!title.trim()||!body.trim()) return setToast({id:crypto.randomUUID(),text:"Título e texto obrigatórios.",kind:"err"});
    setLoading(true); try{
      const r=await fetch("/api/admin/notifications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,body})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Notificação criada!",kind:"ok"}); setTitle(""); setBody(""); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  async function togglePublish(row:Row,setToast:any){
    setLoading(true); try{
      const r=await fetch("/api/admin/notifications",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id,published:!row.published})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Atualizado!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  async function del(id:string,setToast:any){ if(!confirm("Excluir notificação?")) return;
    setLoading(true); try{ const r=await fetch(`/api/admin/notifications?id=${id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Excluído!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  return (
    <AdminShell title="Admin • Notificações" backHref="/admin">
      {(setToast)=>(<>
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row">
            <input className="input" placeholder="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <button className="pill pillPrimary" disabled={loading} onClick={()=>create(setToast)}>{loading?"Salvando...":"Criar"}</button>
          </div>
          <div className="row" style={{marginTop:12}}>
            <textarea className="input" placeholder="Texto da notificação" value={body} onChange={(e)=>setBody(e.target.value)} />
          </div>
        </div>
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="small">Notificações ({rows.length})</div><div className="hr"/>
          <table className="table">
            <thead><tr><th>Título</th><th>Publicado</th><th style={{width:320}}>Ações</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td><b>{r.title}</b><div className="small">{r.body}</div></td>
                  <td>{r.published?"✅":"—"}</td>
                  <td><div className="row">
                    <button className="miniBtn" onClick={()=>togglePublish(r,setToast)}>{r.published?"Despublicar":"Publicar"}</button>
                    <button className="miniBtn miniBtnDanger" onClick={()=>del(r.id,setToast)}>Excluir</button>
                  </div></td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={3} className="small">Sem notificações.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </>)}
    </AdminShell>
  );
}
