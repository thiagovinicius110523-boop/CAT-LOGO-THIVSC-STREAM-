"use client";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
type Card={id:string;title:string;body:string;kind:string;created_at:string};
export default function AdminHomeClient(){
  const [title,setTitle]=useState(""); const [subtitle,setSubtitle]=useState(""); const [cards,setCards]=useState<Card[]>([]);
  const [cTitle,setCTitle]=useState(""); const [cBody,setCBody]=useState(""); const [cKind,setCKind]=useState("notice");
  const [loading,setLoading]=useState(false);
  async function load(){ const r=await fetch("/api/admin/home",{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
    setTitle(j.home?.title||""); setSubtitle(j.home?.subtitle||""); setCards(j.cards||[]); }
  useEffect(()=>{ load().catch(()=>{}); },[]);
  async function saveHome(setToast:any){
    
  }
  return (
    <AdminShell title="Admin • Início" backHref="/admin">
      {(setToast)=>(<>
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row">
            <input className="input" placeholder="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <button className="pill pillPrimary" disabled={loading} onClick={async()=>{
              setLoading(true);
              try{ const r=await fetch("/api/admin/home",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,subtitle})});
                const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
                setToast({id:crypto.randomUUID(),text:"Início atualizado!",kind:"ok"}); await load();
              }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
            }}>{loading?"Salvando...":"Salvar"}</button>
          </div>
          <div className="row" style={{marginTop:12}}>
            <input className="input" placeholder="Subtítulo" value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} />
          </div>
        </div>

        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="small">Criar card</div>
          <div className="row" style={{marginTop:10}}>
            <input className="input" placeholder="Título do card" value={cTitle} onChange={(e)=>setCTitle(e.target.value)} />
            <select className="select" value={cKind} onChange={(e)=>setCKind(e.target.value)} style={{maxWidth:220}}>
              <option value="notice">notice</option><option value="news">news</option><option value="continue">continue</option>
            </select>
            <button className="pill pillPrimary" disabled={loading} onClick={async()=>{
              if(!cTitle.trim()||!cBody.trim()) return setToast({id:crypto.randomUUID(),text:"Título e texto obrigatórios.",kind:"err"});
              setLoading(true);
              try{ const r=await fetch("/api/admin/home/cards",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:cTitle,body:cBody,kind:cKind})});
                const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
                setToast({id:crypto.randomUUID(),text:"Card criado!",kind:"ok"}); setCTitle(""); setCBody(""); setCKind("notice"); await load();
              }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
            }}>{loading?"Salvando...":"Adicionar"}</button>
          </div>
          <div className="row" style={{marginTop:12}}>
            <textarea className="input" placeholder="Texto do card" value={cBody} onChange={(e)=>setCBody(e.target.value)} />
          </div>
        </div>

        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="small">Cards ({cards.length})</div><div className="hr"/>
          <table className="table">
            <thead><tr><th>Título</th><th>Tipo</th><th style={{width:180}}>Ações</th></tr></thead>
            <tbody>
              {cards.map(c=>(
                <tr key={c.id}>
                  <td><b>{c.title}</b><div className="small">{c.body}</div></td>
                  <td>{c.kind}</td>
                  <td><button className="miniBtn miniBtnDanger" onClick={async()=>{
                    if(!confirm("Excluir card?")) return;
                    setLoading(true);
                    try{ const r=await fetch(`/api/admin/home/cards?id=${c.id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
                      setToast({id:crypto.randomUUID(),text:"Card excluído!",kind:"ok"}); await load();
                    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
                  }}>Excluir</button></td>
                </tr>
              ))}
              {!cards.length ? <tr><td colSpan={3} className="small">Sem cards.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </>)}
    </AdminShell>
  );
}
