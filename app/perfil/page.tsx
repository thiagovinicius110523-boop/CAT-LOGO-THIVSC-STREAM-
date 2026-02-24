import Link from "next/link";
import ProfileClient from "./ui/ProfileClient";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Perfil() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name,phone,telegram,avatar_url").maybeSingle();
  return (
    <div className="container">
      <div className="row" style={{ alignItems:"center", justifyContent:"space-between" }}>
        <h1 className="h1">Meu Perfil</h1>
        <Link className="pill" href="/">Voltar</Link>
      </div>
      <ProfileClient userEmail={user?.email || ""} initial={profile || {}} />
    </div>
  );
}
