"use client";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Toast from "@/components/Toast";

type Module = { id: string; title: string; description: string | null };
type Lesson = { id: string; module_id: string; title: string; description: string | null; link: string | null };

export default function CourseDetailClient({ modules, lessons, initialDoneIds }:
{ modules: Module[]; lessons: Lesson[]; initialDoneIds: string[]; }) {
  const supabase = supabaseBrowser();
  const [done, setDone] = useState<Set<string>>(new Set(initialDoneIds));
  const [toast, setToast] = useState<any>(null);
  const [comment, setComment] = useState<Record<string,string>>({});

  const byModule = useMemo(()=>{
    const m = new Map<string, Lesson[]>();
    lessons.forEach(l=>{ if(!m.has(l.module_id)) m.set(l.module_id, []); m.get(l.module_id)!.push(l); });
    return m;
  }, [lessons]);

  async function toggleLesson(lessonId: string) {
    const isDone = done.has(lessonId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setToast({ id: crypto.randomUUID(), text: "Você saiu. Faça login.", kind: "err" });

    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: user.id, lesson_id: lessonId, done: !isDone, updated_at: new Date().toISOString()
    });
    if (error) return setToast({ id: crypto.randomUUID(), text: error.message, kind: "err" });

    const next = new Set(done);
    if (isDone) next.delete(lessonId); else next.add(lessonId);
    setDone(next);
  }

  async function sendComment(lessonId: string) {
    const body = (comment[lessonId] || "").trim();
    if (!body) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setToast({ id: crypto.randomUUID(), text: "Você saiu. Faça login.", kind: "err" });

    const { error } = await supabase.from("lesson_comments").insert({ lesson_id: lessonId, user_id: user.id, body });
    if (error) return setToast({ id: crypto.randomUUID(), text: error.message, kind: "err" });
    setToast({ id: crypto.randomUUID(), text: "Comentário enviado!", kind: "ok" });
    setComment(prev=>({ ...prev, [lessonId]: "" }));
  }

  return (
    <>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div className="small">Marque aulas como concluídas. Isso fica salvo por usuário.</div>
        {modules.map(m => (
          <div key={m.id} style={{ marginTop: 16 }}>
            <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 16 }}>{m.title}</div>
                {m.description ? <div className="small" style={{ marginTop: 4 }}>{m.description}</div> : null}
              </div>
              <span className="badge">Módulo</span>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {(byModule.get(m.id) || []).map(l => (
                <div key={l.id} className="card" style={{ padding: 14, background: "rgba(255,255,255,.03)" }}>
                  <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{l.title}</div>
                      {l.description ? <div className="small" style={{ marginTop: 4 }}>{l.description}</div> : null}
                    </div>
                    <div className="row" style={{ alignItems: "center" }}>
                      <button className={"pill " + (done.has(l.id) ? "pillPrimary" : "")} onClick={()=>toggleLesson(l.id)}>
                        {done.has(l.id) ? "✅ Concluída" : "⬜ Marcar"}
                      </button>
                      {l.link ? <a className="pill" href={l.link} target="_blank" rel="noopener">Link</a> : null}
                    </div>
                  </div>

                  <div className="hr" />
                  <div className="row">
                    <input className="input" placeholder="Comentário (opcional)" value={comment[l.id] || ""}
                      onChange={(e)=>setComment(prev=>({ ...prev, [l.id]: e.target.value }))} />
                    <button className="pill" onClick={()=>sendComment(l.id)}>Enviar</button>
                  </div>
                </div>
              ))}
              {!(byModule.get(m.id) || []).length ? <div className="small">Sem aulas neste módulo.</div> : null}
            </div>
          </div>
        ))}
      </div>
      <Toast message={toast} />
    </>
  );
}
