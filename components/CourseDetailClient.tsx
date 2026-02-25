"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Toast from "@/components/Toast";

type Module = { id: string; title: string; description: string | null };
type Lesson = { id: string; module_id: string; title: string; description: string | null; link: string | null };

type CommentRow = {
  id: string;
  lesson_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export default function CourseDetailClient({
  modules,
  lessons,
  initialDoneIds,
}: {
  modules: Module[];
  lessons: Lesson[];
  initialDoneIds: string[];
}) {
  const supabase = supabaseBrowser();

  const [activeModuleId, setActiveModuleId] = useState<string>(modules?.[0]?.id || "");
  const [done, setDone] = useState<Set<string>>(new Set(initialDoneIds));
  const [toast, setToast] = useState<any>(null);

  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, CommentRow[]>>({}); // lesson_id -> comments
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // lesson_id favorites
  const [loadingFav, setLoadingFav] = useState<Record<string, boolean>>({});

  const byModule = useMemo(() => {
    const m = new Map<string, Lesson[]>();
    lessons.forEach((l) => {
      if (!m.has(l.module_id)) m.set(l.module_id, []);
      m.get(l.module_id)!.push(l);
    });
    return m;
  }, [lessons]);

  const visibleLessons = useMemo(() => {
    return byModule.get(activeModuleId) || [];
  }, [byModule, activeModuleId]);

  // ---- Auth user cache
  async function getUserId() {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  }

  // ---- Progress (done)
  async function toggleLesson(lessonId: string) {
    const isDone = done.has(lessonId);
    const userId = await getUserId();
    if (!userId) return setToast({ id: crypto.randomUUID(), text: "Você saiu. Faça login.", kind: "err" });

    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: userId,
      lesson_id: lessonId,
      done: !isDone,
      updated_at: new Date().toISOString(),
    });
    if (error) return setToast({ id: crypto.randomUUID(), text: error.message, kind: "err" });

    const next = new Set(done);
    if (isDone) next.delete(lessonId);
    else next.add(lessonId);
    setDone(next);
  }

  // ---- Favorites
  async function loadFavorites() {
    const userId = await getUserId();
    if (!userId) return;

    const lessonIds = lessons.map((l) => l.id);
    if (!lessonIds.length) return;

    const { data, error } = await supabase
      .from("lesson_favorites")
      .select("lesson_id")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);

    if (error) return; // silencioso
    setFavorites(new Set((data || []).map((r: any) => r.lesson_id)));
  }

  async function toggleFavorite(lessonId: string) {
    const userId = await getUserId();
    if (!userId) return setToast({ id: crypto.randomUUID(), text: "Você saiu. Faça login.", kind: "err" });

    setLoadingFav((p) => ({ ...p, [lessonId]: true }));
    try {
      const isFav = favorites.has(lessonId);

      if (isFav) {
        const { error } = await supabase
          .from("lesson_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("lesson_id", lessonId);
        if (error) throw error;

        const next = new Set(favorites);
        next.delete(lessonId);
        setFavorites(next);
      } else {
        const { error } = await supabase.from("lesson_favorites").insert({ user_id: userId, lesson_id: lessonId });
        if (error) throw error;

        const next = new Set(favorites);
        next.add(lessonId);
        setFavorites(next);
      }
    } catch (e: any) {
      setToast({ id: crypto.randomUUID(), text: e.message || "Erro ao favoritar.", kind: "err" });
    } finally {
      setLoadingFav((p) => ({ ...p, [lessonId]: false }));
    }
  }

  // ---- Comments
  async function loadComments(lessonId: string) {
    setLoadingComments((p) => ({ ...p, [lessonId]: true }));
    try {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select("id,lesson_id,user_id,body,created_at")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComments((prev) => ({ ...prev, [lessonId]: (data || []) as any }));
    } catch (e: any) {
      setToast({ id: crypto.randomUUID(), text: e.message || "Erro ao carregar comentários.", kind: "err" });
    } finally {
      setLoadingComments((p) => ({ ...p, [lessonId]: false }));
    }
  }

  async function sendComment(lessonId: string) {
    const body = (commentDraft[lessonId] || "").trim();
    if (!body) return;

    const userId = await getUserId();
    if (!userId) return setToast({ id: crypto.randomUUID(), text: "Você saiu. Faça login.", kind: "err" });

    const { error } = await supabase.from("lesson_comments").insert({ lesson_id: lessonId, user_id: userId, body });
    if (error) return setToast({ id: crypto.randomUUID(), text: error.message, kind: "err" });

    setToast({ id: crypto.randomUUID(), text: "Comentário enviado!", kind: "ok" });
    setCommentDraft((prev) => ({ ...prev, [lessonId]: "" }));
    await loadComments(lessonId);
  }

  // init: module + favorites
  useEffect(() => {
    if (modules?.[0]?.id) setActiveModuleId(modules[0].id);
    loadFavorites().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when module changes, lazy load comments for visible lessons (1x)
  useEffect(() => {
    visibleLessons.forEach((l) => {
      if (!comments[l.id]) loadComments(l.id).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleId]);

  return (
    <>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="small">Selecione um módulo e marque aulas como concluídas. Isso fica salvo por usuário.</div>

          {/* Mobile select */}
          <select
            className="select"
            value={activeModuleId}
            onChange={(e) => setActiveModuleId(e.target.value)}
            style={{ maxWidth: 420 }}
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop tabs */}
        <div className="row" style={{ marginTop: 12 }}>
          {modules.map((m) => (
            <button
              key={m.id}
              className={"pill " + (m.id === activeModuleId ? "pillPrimary" : "")}
              onClick={() => setActiveModuleId(m.id)}
            >
              {m.title}
            </button>
          ))}
        </div>

        <div className="hr" />

        {/* Module header */}
        {modules
          .filter((m) => m.id === activeModuleId)
          .map((m) => (
            <div key={m.id} style={{ marginTop: 6 }}>
              <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>{m.title}</div>
                  {m.description ? <div className="small" style={{ marginTop: 4 }}>{m.description}</div> : null}
                </div>
                <span className="badge">Módulo</span>
              </div>
            </div>
          ))}

        {/* Lessons */}
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {visibleLessons.map((l) => (
            <div key={l.id} className="card" style={{ padding: 14, background: "rgba(255,255,255,.03)" }}>
              <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 240 }}>
                  <div style={{ fontWeight: 900 }}>{l.title}</div>
                  {l.description ? <div className="small" style={{ marginTop: 4 }}>{l.description}</div> : null}
                </div>

                <div className="row" style={{ alignItems: "center" }}>
                  <button className={"pill " + (done.has(l.id) ? "pillPrimary" : "")} onClick={() => toggleLesson(l.id)}>
                    {done.has(l.id) ? "✅ Concluída" : "⬜ Marcar"}
                  </button>

                  <button className="pill" onClick={() => toggleFavorite(l.id)} disabled={!!loadingFav[l.id]}>
                    {favorites.has(l.id) ? "⭐ Favorito" : "☆ Favoritar"}
                  </button>

                  {l.link ? (
                    <a className="pill" href={l.link} target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="hr" />

              {/* Comments list */}
              <div style={{ display: "grid", gap: 8 }}>
                <div className="small" style={{ opacity: 0.9 }}>
                  Comentários
                  {loadingComments[l.id] ? " (carregando...)" : ""}
                </div>

                {(comments[l.id] || []).length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {(comments[l.id] || []).slice(0, 5).map((c) => (
                      <div key={c.id} className="card" style={{ padding: 10, background: "rgba(255,255,255,.02)" }}>
                        <div className="small" style={{ opacity: 0.8 }}>
                          {new Date(c.created_at).toLocaleString("pt-BR")}
                        </div>
                        <div style={{ marginTop: 4 }}>{c.body}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="small">Sem comentários ainda.</div>
                )}

                {/* Send comment */}
                <div className="row" style={{ marginTop: 6 }}>
                  <input
                    className="input"
                    placeholder="Escreva um comentário..."
                    value={commentDraft[l.id] || ""}
                    onChange={(e) => setCommentDraft((prev) => ({ ...prev, [l.id]: e.target.value }))}
                  />
                  <button className="pill" onClick={() => sendComment(l.id)}>
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!visibleLessons.length ? <div className="small">Sem aulas neste módulo.</div> : null}
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}