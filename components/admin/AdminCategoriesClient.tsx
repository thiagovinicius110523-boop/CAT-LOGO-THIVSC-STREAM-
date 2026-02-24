"use client";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
type CatalogType="cursos"|"livros"|"arquivos";
type Category={id:string; type:CatalogType; name:string; created_at:string};
export default function AdminCategoriesClient(){
  const [type,setType]=useState<CatalogType>("cursos");
  const [name,setName]=useState(""); const [rows,setRows]=useState<Category[]>([]); const [loading,setLoading]=useState(false);
  async function load(){ const r=await fetch(`/api/admin/categories?type=${type}`,{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro"); setRows(j.data||[]); }
  useEffect(()=>{ load().catch(()=>{}); },[type]);
  async function add(setToast:any){ setLoading(true); try{
    const r=await fetch("/api/admin/categories",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,name})});
    const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro"); setToast({id:crypto.randomUUID(),text:"Categoria criada!",kind:"ok"}); setName(""); await load();
  }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  async function rename(id:string, oldName:string, setToast:any){
    const nn=prompt("Novo nome:", oldName); if(!nn) return; const nm=nn.trim(); if(!nm) return;
    setLoading(true); try{
      const r=await fetch("/api/admin/categories",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,name:nm})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro"); setToast({id:crypto.randomUUID(),text:"Categoria renomeada!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  async function del(id:string,setToast:any){ if(!confirm("Excluir categoria?")) return;
    setLoading(true); try{ const r=await fetch(`/api/admin/categories?id=${id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Categoria excluída!",kind:"ok"}); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  return (
    <AdminShell title="Admin • Categorias" backHref="/admin">
      {(setToast)=> (
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row">
            <select className="select" value={type} onChange={(e)=>setType(e.target.value as any)} style={{maxWidth:220}}>
              <option value="cursos">Cursos</option><option value="livros">Livros</option><option value="arquivos">Arquivos</option>
            </select>
            <input className="input" placeholder="Nome da categoria" value={name} onChange={(e)=>setName(e.target.value)} />
            <button className="pill pillPrimary" disabled={loading} onClick={()=>add(setToast)}>{loading?"Salvando...":"Adicionar"}</button>
          </div>
          <div className="hr"/>
          <table className="table">
            <thead><tr><th>Categoria</th><th style={{width:240}}>Ações</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td><b>{r.name}</b><div className="small">{r.type}</div></td>
                  <td><div className="row">
                    <button className="miniBtn" onClick={()=>rename(r.id,r.name,setToast)}>Renomear</button>
                    <button className="miniBtn miniBtnDanger" onClick={()=>del(r.id,setToast)}>Excluir</button>
                  </div></td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={2} className="small">Sem categorias.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
