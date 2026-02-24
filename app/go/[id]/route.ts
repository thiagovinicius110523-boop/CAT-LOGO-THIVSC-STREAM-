import { supabaseServer } from "@/lib/supabase/server";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Not authenticated", { status: 401 });

  const { data: allowed } = await supabase.rpc("is_whitelisted_uid", { p_uid: user.id });
  if (!allowed) return new Response("Not allowed", { status: 403 });

  const { data: item, error } = await supabase.from("items").select("link,type").eq("id", ctx.params.id).maybeSingle();
  if (error || !item?.link) return new Response("Not found", { status: 404 });
  if (item.type === "cursos") return new Response("Invalid", { status: 400 });

  await supabase.from("user_last_access").upsert({
    user_id: user.id,
    item_id: ctx.params.id,
    last_opened_at: new Date().toISOString()
  });

  return Response.redirect(item.link, 302);
}
