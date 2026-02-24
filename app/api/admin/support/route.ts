import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const PostSchema = z.object({
  thread_id: z.union([z.string().min(1), z.number()]),
  body: z.string().min(1),
});

export const GET = withApi(async () => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const { data: threads, error: e1 } = await g.service
    .from("support_threads")
    .select("*")
    .order("created_at", { ascending: false });

  if (e1) throw new ApiError(e1.message, { status: 400, code: "db_error" });

  const threadIds = (threads ?? []).map((t: any) => t.id);

  const { data: messages, error: e2 } = threadIds.length
    ? await g.service
        .from("support_messages")
        .select("id,thread_id,sender,body,created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null as any };

  if (e2) throw new ApiError(e2.message, { status: 400, code: "db_error" });

  return ok({ threads: threads ?? [], messages: messages ?? [] });
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);

  const { error } = await g.service.from("support_messages").insert({
    thread_id: String(b.thread_id),
    sender: "admin",
    body: b.body.trim(),
  });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(true);
});
