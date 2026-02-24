import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const PostSchema = z.object({
  body: z.string().min(1),
});

export const GET = withApi(async () => {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError("Not authenticated", { status: 401, code: "unauthorized" });

  const { data: existing, error: e1 } = await supabase
    .from("support_threads")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (e1) throw new ApiError(e1.message, { status: 400, code: "db_error" });

  let threadId = existing?.id;

  if (!threadId) {
    const ins = await supabase
      .from("support_threads")
      .insert({ user_id: user.id, subject: "Suporte" })
      .select("id")
      .single();
    if (ins.error) throw new ApiError(ins.error.message, { status: 400, code: "db_error" });
    threadId = ins.data.id;
  }

  const { data: messages, error } = await supabase
    .from("support_messages")
    .select("id,sender,body,created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok({ thread_id: threadId, messages: messages ?? [] });
});

export const POST = withApi(async (req: Request) => {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError("Not authenticated", { status: 401, code: "unauthorized" });

  const b = await jsonBody(req, PostSchema);

  const { data: thread, error: e1 } = await supabase
    .from("support_threads")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (e1) throw new ApiError(e1.message, { status: 400, code: "db_error" });
  if (!thread?.id) throw new ApiError("thread não encontrada", { status: 400, code: "not_found" });

  const { error } = await supabase
    .from("support_messages")
    .insert({ thread_id: thread.id, sender: "user", body: b.body.trim() });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(true);
});
