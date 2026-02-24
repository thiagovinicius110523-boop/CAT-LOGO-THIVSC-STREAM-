"use client";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "./AdminShell";
type Course={id:string;title:string};
type Module={id:string;course_id:string;title:string;description:string|null;sort_order:number};
type Lesson={id:string;module_id:string;title:string;description:string|null;sort_order:number;link:string|null};
export default function AdminCoursesClient(){
  const [courses,setCourses]=useState<Course[]>([]); const [courseId,setCourseId]=useState("");
  const [modules,setModules]=useState<Module[]>([]); const [lessons,setLessons]=useState<Lesson[]>([]);
  const [mTitle,setMTitle]=useState(""); const [mDesc,setMDesc]=useState(""); const [mOrder,setMOrder]=useState(0);
  const [moduleId,setModuleId]=useState(""); const [lTitle,setLTitle]=useState(""); const [lDesc,setLDesc]=useState(""); const [lOrder,setLOrder]=useState(0); const [lLink,setLLink]=useState("");
  const [loading,setLoading]=useState(false);

  async function loadCourses(){
    const r=await fetch("/api/admin/courses",{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
    setCourses(j.data||[]); setCourseId((j.data?.[0]?.id)||"");
  }
  async function loadAll(){
    if(!courseId) return;
    const r=await fetch(`/api/admin/courses/detail?course_id=${courseId}`,{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
    setModules(j.modules||[]); setLessons(j.lessons||[]); setModuleId((j.modules?.[0]?.id)||"");
  }
  useEffect(()=>{ loadCourses().catch(()=>{}); },[]);
  useEffect(()=>{ loadAll().catch(()=>{}); },[courseId]);

  async function addModule(setToast:any){
    if(!courseId) return setToast({id:crypto.randomUUID(),text:"Crie um curso primeiro.",kind:"err"});
    if(!mTitle.trim()) return setToast({id:crypto.randomUUID(),text:"Título do módulo obrigatório.",kind:"err"});
    setLoading(true); try{
      const r=await fetch("/api/admin/modules",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course_id:courseId,title:mTitle,description:mDesc,sort_order:mOrder})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Módulo criado!",kind:"ok"}); setMTitle(""); setMDesc(""); setMOrder(0); await loadAll();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }
  async function delModule(id:string,setToast:any){ if(!confirm("Excluir módulo? Isso remove aulas do módulo.")) return;
    setLoading(true); try{ const r=await fetch(`/api/admin/modules?id=${id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Módulo excluído!",kind:"ok"}); await loadAll();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }
  async function addLesson(setToast:any){
    if(!moduleId) return setToast({id:crypto.randomUUID(),text:"Crie/Selecione um módulo.",kind:"err"});
    if(!lTitle.trim()) return setToast({id:crypto.randomUUID(),text:"Título da aula obrigatório.",kind:"err"});
    setLoading(true); try{
      const r=await fetch("/api/admin/lessons",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({module_id:moduleId,title:lTitle,description:lDesc,sort_order:lOrder,link:lLink})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Aula criada!",kind:"ok"}); setLTitle(""); setLDesc(""); setLOrder(0); setLLink(""); await loadAll();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false); }
  }
  async function delLesson(id:string,setToast:any){ if(!confirm("Excluir aula?")) return;
    setLoading(true); try{ const r=await fetch(`/api/admin/lessons?id=${id}`,{method:"DELETE"}); const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setToast({id:crypto.randomUUID(),text:"Aula excluída!",kind:"ok"}); await loadAll();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"});} finally{ setLoading(false);} }

  const lessonsByModule = useMemo(()=>{
    const m=new Map<string,Lesson[]>(); lessons.forEach(l=>{ if(!m.has(l.module_id)) m.set(l.module_id,[]); m.get(l.module_id)!.push(l); }); return m;
  },[lessons]);

  return (
    <AdminShell title="Admin • Cursos (Módulos/Aulas)" backHref="/admin">
      {(setToast)=>(<>
        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="row">
            <select className="select" value={courseId} onChange={(e)=>setCourseId(e.target.value)} style={{maxWidth:520}}>
              {courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <span className="badge">Cursos: <b>{courses.length}</b></span>
          </div>
          <div className="small" style={{marginTop:10}}>Cursos são itens do tipo <b>cursos</b> (crie em Admin → Itens).</div>
        </div>

        <div className="grid" style={{marginTop:16}}>
          <div className="card" style={{padding:16}}>
            <div className="small">Criar módulo</div>
            <div className="row" style={{marginTop:10}}>
              <input className="input" placeholder="Título do módulo" value={mTitle} onChange={(e)=>setMTitle(e.target.value)} />
              <input className="input" placeholder="Ordem" type="number" value={mOrder} onChange={(e)=>setMOrder(Number(e.target.value))} style={{maxWidth:160}} />
            </div>
            <div className="row" style={{marginTop:10}}>
              <textarea className="input" placeholder="Descrição (opcional)" value={mDesc} onChange={(e)=>setMDesc(e.target.value)} />
            </div>
            <div className="row" style={{marginTop:10}}>
              <button className="pill pillPrimary" disabled={loading} onClick={()=>addModule(setToast)}>{loading?"Salvando...":"Adicionar módulo"}</button>
            </div>
          </div>

          <div className="card" style={{padding:16}}>
            <div className="small">Criar aula</div>
            <div className="row" style={{marginTop:10}}>
              <select className="select" value={moduleId} onChange={(e)=>setModuleId(e.target.value)} style={{maxWidth:520}}>
                {modules.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <input className="input" placeholder="Ordem" type="number" value={lOrder} onChange={(e)=>setLOrder(Number(e.target.value))} style={{maxWidth:160}} />
            </div>
            <div className="row" style={{marginTop:10}}>
              <input className="input" placeholder="Título da aula" value={lTitle} onChange={(e)=>setLTitle(e.target.value)} />
            </div>
            <div className="row" style={{marginTop:10}}>
              <textarea className="input" placeholder="Descrição (opcional)" value={lDesc} onChange={(e)=>setLDesc(e.target.value)} />
            </div>
            <div className="row" style={{marginTop:10}}>
              <input className="input" placeholder="Link (Telegram) (opcional)" value={lLink} onChange={(e)=>setLLink(e.target.value)} />
            </div>
            <div className="row" style={{marginTop:10}}>
              <button className="pill pillPrimary" disabled={loading} onClick={()=>addLesson(setToast)}>{loading?"Salvando...":"Adicionar aula"}</button>
            </div>
          </div>
        </div>

        <div className="card" style={{padding:16, marginTop:16}}>
          <div className="small">Módulos ({modules.length}) e Aulas ({lessons.length})</div><div className="hr"/>
          {modules.map(m=>(
            <div key={m.id} style={{marginTop:12}}>
              <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
                <div><b>{m.title}</b>{m.description?<div className="small">{m.description}</div>:null}</div>
                <button className="miniBtn miniBtnDanger" onClick={()=>delModule(m.id,setToast)}>Excluir módulo</button>
              </div>
              <div style={{marginTop:10, display:"grid", gap:10}}>
                {(lessonsByModule.get(m.id)||[]).map(l=>(
                  <div key={l.id} className="card" style={{padding:12, background:"rgba(255,255,255,.03)"}}>
                    <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
                      <div><b>{l.title}</b>{l.description?<div className="small">{l.description}</div>:null}{l.link?<div className="small">Link: {l.link}</div>:null}</div>
                      <button className="miniBtn miniBtnDanger" onClick={()=>delLesson(l.id,setToast)}>Excluir</button>
                    </div>
                  </div>
                ))}
                {!(lessonsByModule.get(m.id)||[]).length ? <div className="small">Sem aulas.</div> : null}
              </div>
              <div className="hr"/>
            </div>
          ))}
          {!modules.length ? <div className="small">Sem módulos.</div> : null}
        </div>
      </>)}
    </AdminShell>
  );
}
