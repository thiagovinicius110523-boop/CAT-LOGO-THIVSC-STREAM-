import { supabaseServer } from "@/lib/supabase/server";
import AccessDenied from "@/components/AccessDenied";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // middleware já força login, mas aqui garantimos por segurança
  if (!user) {
    return <AccessDenied title="Sessão expirada" message="Faça login novamente para continuar." />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || "user";
  if (role !== "admin") {
    return <AccessDenied title="Admin somente" message="Você precisa ser admin para acessar esta área." />;
  }

  return <>{children}</>;
}
