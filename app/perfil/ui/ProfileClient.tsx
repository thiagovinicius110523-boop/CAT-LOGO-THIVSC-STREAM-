"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Toast from "@/components/Toast";

export default function ProfileClient({ userEmail, initial }: { userEmail: string; initial: any }) {
  const supabase = supabaseBrowser();
  const [full_name, setFullName] = useState(initial.full_name || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [telegram, setTelegram] = useState(initial.telegram || "");
  const [avatar_url, setAvatar] = useState(initial.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  async function save() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada.");
      const { error } = await supabase.from("profiles").update({ full_name, phone, telegram, avatar_url }).eq("id", user.id);
      if (error) throw error;
      setToast({ id: crypto.randomUUID(), text: "Perfil atualizado!", kind: "ok" });
    } catch (e: any) {
      setToast({ id: crypto.randomUUID(), text: e.message || "Erro", kind: "err" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div className="row" style={{ alignItems:"center", justifyContent:"space-between" }}>
          <span className="badge">E-mail: <b>{userEmail}</b></span>
          <span className="small">Atualize seus dados</span>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <input className="input" placeholder="Nome completo" value={full_name} onChange={(e)=>setFullName(e.target.value)} />
          <input className="input" placeholder="Telefone" value={phone} onChange={(e)=>setPhone(e.target.value)} style={{ maxWidth: 260 }} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <input className="input" placeholder="Usuário Telegram (ex: @seuuser)" value={telegram} onChange={(e)=>setTelegram(e.target.value)} style={{ maxWidth: 320 }} />
          <input className="input" placeholder="URL do avatar (opcional)" value={avatar_url} onChange={(e)=>setAvatar(e.target.value)} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="pill pillPrimary" disabled={loading} onClick={save}>{loading ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
      <Toast message={toast} />
    </>
  );
}
