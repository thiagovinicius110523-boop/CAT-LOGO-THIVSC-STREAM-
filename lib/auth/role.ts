import { supabaseServer } from "@/lib/supabase/server";

export type UserRole = "admin" | "user";

export async function getCurrentUserRole() : Promise<UserRole> {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "user";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (profile?.role as UserRole) || "user";
}

export async function isAdmin() : Promise<boolean> {
  return (await getCurrentUserRole()) === "admin";
}
