"use client";
import { useEffect, useState } from "react";
import Toast from "@/components/Toast";

type Msg = { id: string; sender: "user"|"admin"; body: string; created_at: string; };
export default function SupportClient(){
  const [messages,setMessages]=useState<Msg[]>([]);
  const [body,setBody]=useState("");
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState<any>(null);

  async function load(){
    const r=await fetch("/api/support", { cache: "no-store" });
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||"Erro");
    setMessages(j.messages||[]);
  }
  useEffect(()=>{ load().catch(()=>{}); },[]);

  async function send(){
    if(!body.trim()) return;
    setLoading(true);
    try{
      const r=await fetch("/api/support", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ body }) });
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro");
      setBody(""); await load();
    }catch(e:any){ setToast({id:crypto.randomUUID(),text:e.message,kind:"err"}); }
    finally{ setLoading(false); }
  }

  return (
    <>
      <div className="card" style={{padding:16, marginTop:16}}>
        <div className="small">Converse com o administrador. (Mensagem privada)</div>
        <div className="hr"/>
        <div style={{display:"grid", gap:10}}>
          {messages.map(m=>(
            <div key={m.id} className="card" style={{padding:12, background:"rgba(255,255,255,.03)"}}>
              <div className="small"><b>{m.sender==="admin"?"Admin":"Você"}</b> • {new Date(m.created_at).toLocaleString()}</div>
              <div style={{marginTop:6}}>{m.body}</div>
            </div>
          ))}
          {!messages.length ? <div className="small">Sem mensagens ainda.</div> : null}
        </div>
        <div className="hr"/>
        <div className="row">
          <input className="input" placeholder="Escreva sua mensagem..." value={body} onChange={(e)=>setBody(e.target.value)} />
          <button className="pill pillPrimary" disabled={loading} onClick={send}>{loading?"Enviando...":"Enviar"}</button>
        </div>
      </div>
      <Toast message={toast} />
    </>
  );
}
