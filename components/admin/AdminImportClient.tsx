"use client";
import { useState } from "react";
import AdminShell from "./AdminShell";

const SAMPLE = {
  category: "Categoria Exemplo",
  course: { title: "Curso Exemplo", description: "Descrição do curso" },
  modules: [
    { title: "Módulo 1", description: "Introdução", lessons: [
      { title: "Aula 1", description: "Primeira aula", link: "https://t.me/seu_canal/1" },
      { title: "Aula 2", description: "Segunda aula", link: "https://t.me/seu_canal/2" }
    ]}
  ]
};

export default function AdminImportClient(){
  const [type,setType]=useState<"cursos"|"livros"|"arquivos">("cursos");
  const [text,setText]=useState(JSON.stringify(SAMPLE, null, 2));
  const [loading,setLoading]=useState(false);

  async function run(setToast:any){
    setLoading(true);
    try{
      const payload = JSON.parse(text);
      const r = await fetch("/api/admin/import", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ type, payload }) });
      const j = await r.json();
      if(!r.ok) throw new Error(j.error||"Erro");
      setToast({ id: crypto.randomUUID(), text: j.summary || "Importado!", kind: "ok" });
    }catch(e:any){
      setToast({ id: crypto.randomUUID(), text: e.message, kind: "err" });
    }finally{
      setLoading(false);
    }
  }

  return (
    <AdminShell title="Admin • Importador Telegram (JSON)" backHref="/admin">
      {(setToast)=>(
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="small">Cole um JSON para criar automaticamente categoria → item → módulos → aulas.</div>
          <div className="row" style={{marginTop:12}}>
            <select className="select" value={type} onChange={(e)=>setType(e.target.value as any)} style={{maxWidth:240}}>
              <option value="cursos">Cursos</option>
              <option value="livros">Livros</option>
              <option value="arquivos">Arquivos</option>
            </select>
            <button className="pill pillPrimary" disabled={loading} onClick={()=>run(setToast)}>{loading?"Importando...":"Importar"}</button>
          </div>
          <div style={{marginTop:12}}>
            <textarea className="input" style={{minHeight:360}} value={text} onChange={(e)=>setText(e.target.value)} />
          </div>
          <div className="small" style={{marginTop:10}}>
            Formato esperado: <b>{"{ category, course, modules:[{title,description,lessons:[{title,description,link}]}] }"}</b>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
