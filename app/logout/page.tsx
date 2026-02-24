import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Logout(){ const supabase=supabaseServer(); await supabase.auth.signOut(); redirect("/login"); }
