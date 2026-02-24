"use client";
import { useEffect, useState } from "react";
type ToastMsg = { id: string; text: string; kind?: "ok" | "err" };
export default function Toast({ message }: { message: ToastMsg | null }) {
  const [m, setM] = useState<ToastMsg | null>(null);
  useEffect(()=>{ setM(message); if(message){ const t=setTimeout(()=>setM(null),3200); return ()=>clearTimeout(t);} },[message?.id]);
  if(!m) return null;
  const color = m.kind==="err" ? "rgba(248,113,113,.95)" : "rgba(34,197,94,.95)";
  return (<div className="toast"><div><div style={{fontWeight:900,color}}>{m.kind==="err"?"Erro":"OK"}</div>
  <div className="small" style={{marginTop:6,color:"rgba(243,246,255,.92)"}}>{m.text}</div></div></div>);
}
