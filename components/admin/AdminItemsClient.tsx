"use client";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
type CatalogType="cursos"|"livros"|"arquivos";
type Category={id:string;name:string;type:CatalogType};
type Item={id:string;type:CatalogType;category_id:string;title:string;meta:string|null;description:string|null;progress:number|null;link:string|null};
export default function AdminItemsClient(){
  const [type,setType]=useState<CatalogType>("cursos");
  const [cats,setCats]=useState<Category[]>([]);
  const [items,setItems]=useState<Item[]>([]);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [categoryId,setCategoryId]=useState<string>("");
  const [title,setTitle]=useState(""); const [meta,setMeta]=useState(""); const [description,setDescription]=useState("");
  const [progress,setProgress]=useState<number>(0); const [link,setLink]=useState("");
  const [loading,setLoading]=useState(false);

  async function loadAll(){
    const r1=await fetch(`/api/admin/categories?type=${type}`,{cache:"no-store"}); const j1=await r1.json(); if(!r1.ok) throw new Error(j1.error||"Erro categorias");
    setCats(j1.data||[]); setCategoryId((j1.data?.[0]?.id)||"");
    const r2=await fetch(`/api/admin/items?type=${type}`,{cache:"no-store"}); const j2=await r2.json(); if(!r2.ok) throw new Error(j2.error||"Erro itens");
    setItems(j2.data||[]);
  }
  useEffect(()=>{ loadAll().catch(()=>{}); },[type]);

  function clearForm(){ setEditingId(null); setTitle(""); setMeta(""); setDescription(""); setProgress(0); setLink(""); }

  async function save(setToast:any){
    if(!categoryId) return setToast({id:crypto.randomUUID(),text:"Crie uma categoria primeiro.",kind:"err"});
    if(!title.trim()) return setToast({id:crypto.randomUUID(),text:"Título obrigatório.",kind:"err"});
    setLoading(true);
    try{
      const payload:any={ id:editingId, type, category_id:categoryId, title, meta, description };
      if(type==="cursos") payload.progress = Math.max(0,Math.min(100,Number(progress||0))); else payload.link = link;
      const r=await fetch("/api/admin/items",{method:editingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:editingId?"Item atualizado!":"Item criado!",kind:"ok"});
      clearForm(); await loadAll();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }

  function edit(it:Item){ setEditingId(it.id); setCategoryId(it.category_id); setTitle(it.title||""); setMeta(it.meta||""); setDescription(it.description||""); setProgress(Number(it.progress||0)); setLink(it.link||""); }

  async function del(id:string,setToast:any){ if(!confirm("Excluir item?")) return;
    setLoading(true); try{ const r=await fetch(`/api/admin/items?id=${id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Item excluído!",kind:"ok"}); await loadAll();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }

  return (
    <AdminShell title="Admin • Itens" backHref="/admin">
      {(setToast)=>(<>
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row">
            <select className="select" value={type} onChange={(e)=>setType(e.target.value as any)} style={{maxWidth:220}}>
              <option value="cursos">Cursos</option><option value="livros">Livros</option><option value="arquivos">Arquivos</option>
            </select>
            <select className="select" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} style={{maxWidth:340}}>
              {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="badge">{editingId?"Editando":"Novo"}</span>
          </div>

          <div className="row" style={{marginTop:12}}>
            <input className="input" placeholder="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input className="input" placeholder="Meta/Info" value={meta} onChange={(e)=>setMeta(e.target.value)} />
          </div>

          <div className="row" style={{marginTop:12}}>
            <textarea className="input" placeholder="Descrição" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </div>

          {type==="cursos" ? (
            <div className="row" style={{marginTop:12}}>
              <input className="input" type="number" min={0} max={100} placeholder="Progresso 0..100" value={progress}
                onChange={(e)=>setProgress(Number(e.target.value))} style={{maxWidth:240}} />
              <span className="small">* Progresso inicial pode ser 0</span>
            </div>
          ) : (
            <div className="row" style={{marginTop:12}}>
              <input className="input" placeholder="Link (Telegram)" value={link} onChange={(e)=>setLink(e.target.value)} />
            </div>
          )}

          <div className="row" style={{marginTop:12}}>
            <button className="pill pillPrimary" disabled={loading} onClick={()=>save(setToast)}>{loading?"Salvando...":(editingId?"Salvar":"Criar")}</button>
            {editingId ? <button className="pill" onClick={clearForm}>Cancelar</button> : null}
          </div>
        </div>

        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="small">Itens ({items.length})</div><div className="hr"/>
          <table className="table">
            <thead><tr><th>Título</th><th>Categoria</th><th style={{width:240}}>Ações</th></tr></thead>
            <tbody>
              {items.map(it=>(
                <tr key={it.id}>
                  <td><b>{it.title}</b><div className="small">{it.meta}</div></td>
                  <td className="small">{cats.find(c=>c.id===it.category_id)?.name || "—"}</td>
                  <td><div className="row">
                    <button className="miniBtn" onClick={()=>edit(it)}>Editar</button>
                    <button className="miniBtn miniBtnDanger" onClick={()=>del(it.id,setToast)}>Excluir</button>
                  </div></td>
                </tr>
              ))}
              {!items.length ? <tr><td colSpan={3} className="small">Sem itens.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </>)}
    </AdminShell>
  );
}
