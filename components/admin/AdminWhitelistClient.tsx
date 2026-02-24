"use client";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
type Row={id:string;email:string;active:boolean;created_at:string};
export default function AdminWhitelistClient(){
  const [email,setEmail]=useState(""); const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(false);
  async function load(){ const r=await fetch("/api/admin/whitelist",{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro"); setRows(j.data||[]); }
  useEffect(()=>{ load().catch(()=>{}); },[]);
  async function addOrUpdate(setToast:any, active=true){
    setLoading(true); try{
      const r=await fetch("/api/admin/whitelist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,active})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Whitelist atualizada!",kind:"ok"}); setEmail(""); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }
  async function toggle(row:Row,setToast:any){
    setLoading(true); try{
      const r=await fetch("/api/admin/whitelist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:row.email,active:!row.active})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Alterado!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }
  async function del(id:string,setToast:any){ if(!confirm("Remover da whitelist?")) return;
    setLoading(true); try{ const r=await fetch(`/api/admin/whitelist?id=${id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Removido!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }
  const activeCount = rows.filter(r=>r.active).length;
  return (
    <AdminShell title="Admin • Whitelist" backHref="/admin">
      {(setToast)=>(
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
            <span className="badge">Ativos: <b>{activeCount}/5</b></span>
            <span className="small">Limite máximo de 5 usuários ativos</span>
          </div>
          <div className="row" style={{marginTop:12}}>
            <input className="input" placeholder="email@dominio.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className="pill pillPrimary" disabled={loading} onClick={()=>addOrUpdate(setToast,true)}>{loading?"Salvando...":"Adicionar/Ativar"}</button>
          </div>
          <div className="hr"/>
          <table className="table">
            <thead><tr><th>E-mail</th><th>Ativo</th><th style={{width:260}}>Ações</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td><b>{r.email}</b></td>
                  <td>{r.active?"✅":"—"}</td>
                  <td><div className="row">
                    <button className="miniBtn" onClick={()=>toggle(r,setToast)}>{r.active?"Desativar":"Ativar"}</button>
                    <button className="miniBtn miniBtnDanger" onClick={()=>del(r.id,setToast)}>Remover</button>
                  </div></td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={3} className="small">Sem whitelist.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
