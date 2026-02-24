"use client";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "./AdminShell";

type Thread = { id: string; user_id: string; status: string; created_at: string; subject: string; };
type Msg = { id: string; sender: "user"|"admin"; body: string; created_at: string; thread_id: string; };

export default function AdminSupportClient(){
  const [threads,setThreads]=useState<Thread[]>([]);
  const [messages,setMessages]=useState<Msg[]>([]);
  const [active,setActive]=useState<string>("");
  const [body,setBody]=useState("");
  const [loading,setLoading]=useState(false);

  async function load(){
    const r=await fetch("/api/admin/support", { cache:"no-store" });
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||"Erro");
    setThreads(j.threads||[]);
    setMessages(j.messages||[]);
    setActive((prev)=> prev || (j.threads?.[0]?.id||""));
  }
  useEffect(()=>{ load().catch(()=>{}); },[]);

  const msgs = useMemo(()=> messages.filter(m=>m.thread_id===active), [messages,active]);

  async function send(setToast:any){
    if(!active || !body.trim()) return;
    setLoading(true);
    try{
      const r=await fetch("/api/admin/support", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ thread_id: active, body }) });
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setBody(""); await load();
      setToast({id:crypto.randomUUID(),text:"Enviado!",kind:"ok"});
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"}); }
    finally{ setLoading(false); }
  }

  return (
    <AdminShell title="Admin • Suporte" backHref="/admin">
      {(setToast)=>(
        <div className="grid" style={{marginTop:16}}>
          <div className="card" style={{padding:16}}>
            <div className="small">Conversas</div>
            <div className="hr"/>
            <div style={{display:"grid",gap:10}}>
              {threads.map(t=>(
                <button key={t.id} className={"pill " + (active===t.id ? "pillPrimary":"")} onClick={()=>setActive(t.id)}>
                  {t.subject} • {new Date(t.created_at).toLocaleDateString()}
                </button>
              ))}
              {!threads.length ? <div className="small">Sem mensagens.</div> : null}
            </div>
          </div>
          <div className="card" style={{padding:16}}>
            <div className="small">Mensagens</div>
            <div className="hr"/>
            <div style={{display:"grid",gap:10, maxHeight:520, overflow:"auto"}}>
              {msgs.map(m=>(
                <div key={m.id} className="card" style={{padding:12, background:"rgba(255,255,255,.03)"}}>
                  <div className="small"><b>{m.sender==="admin"?"Admin":"Aluno"}</b> • {new Date(m.created_at).toLocaleString()}</div>
                  <div style={{marginTop:6}}>{m.body}</div>
                </div>
              ))}
              {!msgs.length ? <div className="small">Selecione uma conversa.</div> : null}
            </div>
            <div className="hr"/>
            <div className="row">
              <input className="input" placeholder="Responder..." value={body} onChange={(e)=>setBody(e.target.value)} />
              <button className="pill pillPrimary" disabled={loading} onClick={()=>send(setToast)}>{loading?"Enviando...":"Enviar"}</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
