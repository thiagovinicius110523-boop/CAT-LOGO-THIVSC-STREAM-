import { supabaseServer } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
export async function requireAdmin(){
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok:false as const, status:401, message:"Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { ok:false as const, status:403, message:"Admin only" };
  return { ok:true as const, user, service: supabaseService() };
}
