"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type Item = { id: string; type: string; title: string; category_id: string; created_at: string; };
type Access = { item_id: string; last_opened_at: string; items: Item | null; };
type State = { course_id: string; last_lesson_id: string | null; updated_at: string; };

export default function LastAccessPanel(){
  const supabase = supabaseBrowser();
  const [recent,setRecent]=useState<Access[]>([]);
  const [state,setState]=useState<State|null>(null);

  useEffect(()=>{
    (async()=>{
      const { data: a } = await supabase.from("user_last_access")
        .select("item_id,last_opened_at,items(id,type,title,category_id,created_at)")
        .order("last_opened_at", { ascending: false })
        .limit(6);
      setRecent((a as any) || []);

      const { data: s } = await supabase.from("user_course_state").select("course_id,last_lesson_id,updated_at").order("updated_at",{ascending:false}).limit(1);
      setState((s && s[0]) ? (s[0] as any) : null);
    })().catch(()=>{});
  },[]);

  return (
    <div className="grid" style={{ marginTop: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ alignItems:"center", justifyContent:"space-between" }}>
          <b>Últimos acessos</b>
          <span className="small">recentes</span>
        </div>
        <div className="hr" />
        <div style={{ display:"grid", gap:10 }}>
          {recent.map((x)=>{
            const it = (x as any).items as Item | null;
            if(!it) return null;
            const href = it.type === "cursos" ? `/cursos/${it.id}` : it.type === "livros" ? `/livros` : `/arquivos`;
            return (
              <Link key={x.item_id} className="pill" href={href}>
                {it.title} <span className="small" style={{ marginLeft: 8 }}>• {new Date(x.last_opened_at).toLocaleDateString()}</span>
              </Link>
            );
          })}
          {!recent.length ? <div className="small">Nada acessado ainda.</div> : null}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ alignItems:"center", justifyContent:"space-between" }}>
          <b>Continuar</b>
          <span className="small">onde parou</span>
        </div>
        <div className="hr" />
        {state?.course_id ? (
          <Link className="pill pillPrimary" href={`/cursos/${state.course_id}`}>Continuar curso</Link>
        ) : (
          <div className="small">Abra um curso e clique em uma aula para registrar “onde parou”.</div>
        )}
      </div>
    </div>
  );
}
