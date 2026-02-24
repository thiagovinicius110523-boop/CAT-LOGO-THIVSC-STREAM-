"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Toast from "@/components/Toast";

type CatalogType = "cursos" | "livros" | "arquivos";
type Category = { id: string; name: string; type: CatalogType };
type Item = { id: string; type: CatalogType; category_id: string; title: string; meta: string | null; description: string | null; progress: number | null; link: string | null; };

export default function CatalogClient({ type }: { type: CatalogType }) {
  const supabase = supabaseBrowser();
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [toast, setToast] = useState<any>(null);

  async function loadAll() {
    const { data: catsD, error: e1 } = await supabase.from("categories").select("id,name,type").eq("type", type).order("name");
    if (e1) setToast({ id: crypto.randomUUID(), text: e1.message, kind: "err" });
    setCats(catsD || []);

    const { data: itemsD, error: e2 } = await supabase.from("items")
      .select("id,type,category_id,title,meta,description,progress,link")
      .eq("type", type)
      .order("created_at", { ascending: false });
    if (e2) setToast({ id: crypto.randomUUID(), text: e2.message, kind: "err" });
    setItems(itemsD || []);

    const { data: favD, error: e3 } = await supabase.from("user_favorites").select("item_id").eq("type", type);
    if (e3) setToast({ id: crypto.randomUUID(), text: e3.message, kind: "err" });
    setFavIds(new Set((favD || []).map((x:any)=>x.item_id)));
  }

  useEffect(()=>{ loadAll(); }, [type]);

  const catMap = useMemo(()=>{
    const m = new Map<string,string>();
    cats.forEach(c=>m.set(c.id,c.name));
    return m;
  }, [cats]);

  const filtered = useMemo(()=>{
    const qq = q.trim().toLowerCase();
    return items.filter(it=>{
      const okQ = !qq || (it.title||"").toLowerCase().includes(qq) || (it.description||"").toLowerCase().includes(qq) || (it.meta||"").toLowerCase().includes(qq);
      const okC = cat === "all" || it.category_id === cat;
      const okF = !onlyFav || favIds.has(it.id);
      return okQ && okC && okF;
    });
  }, [items, q, cat, onlyFav, favIds]);

  async function toggleFav(itemId: string) {
    const isFav = favIds.has(itemId);
    if (isFav) {
      const { error } = await supabase.from("user_favorites").delete().eq("item_id", itemId).eq("type", type);
      if (error) return setToast({ id: crypto.randomUUID(), text: error.message, kind: "err" });
      const next = new Set(favIds); next.delete(itemId); setFavIds(next);
    } else {
      const { error } = await supabase.from("user_favorites").insert({ item_id: itemId, type });
      if (error) return setToast({ id: crypto.randomUUID(), text: error.message, kind: "err" });
      const next = new Set(favIds); next.add(itemId); setFavIds(next);
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <span className="badge">Categorias: <b>{cats.length}</b></span>
          <span className="badge">Itens: <b>{filtered.length}</b></span>
          <button className={"pill " + (onlyFav ? "pillPrimary" : "")} onClick={()=>setOnlyFav(v=>!v)}>
            {onlyFav ? "★ Favoritos" : "☆ Favoritos"}
          </button>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <input className="input" placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="select" value={cat} onChange={(e)=>setCat(e.target.value)} style={{ maxWidth: 340 }}>
            <option value="all">Todas categorias</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="hr" />

        <div className="grid">
          {filtered.map(it => (
            <div key={it.id} className="card" style={{ padding: 14, background: "rgba(255,255,255,.03)" }}>
              <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>{it.title}</div>
                <button className="miniBtn" onClick={()=>toggleFav(it.id)}>{favIds.has(it.id) ? "★" : "☆"}</button>
              </div>
              <div className="small" style={{ marginTop: 6 }}>{it.meta || catMap.get(it.category_id) || "—"}</div>
              {it.description ? <div className="small" style={{ marginTop: 8 }}>{it.description}</div> : null}
              {type === "cursos" ? <div className="small" style={{ marginTop: 10 }}>Progresso: <b>{it.progress ?? 0}%</b></div> : null}
              <div className="row" style={{ marginTop: 12 }}>
                {type === "cursos"
                  ? <a className="pill pillPrimary" href={`/cursos/${it.id}`}>Abrir</a>
                  : (it.link ? <a className="pill pillPrimary" href={`/go/${it.id}`} target="_blank" rel="noopener">Abrir</a> : <span className="small">Sem link</span>)
                }
              </div>
            </div>
          ))}
          {!filtered.length ? (
            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.03)" }}>
              <div style={{ fontWeight: 900 }}>Nenhum item encontrado</div>
              <div className="small" style={{ marginTop: 8 }}>Tente outra busca ou categoria.</div>
            </div>
          ) : null}
        </div>
      </div>
      <Toast message={toast} />
    </>
  );
}
