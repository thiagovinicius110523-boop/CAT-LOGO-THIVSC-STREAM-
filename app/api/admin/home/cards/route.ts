import { z } from "zod";
import { requireAdmin } from "../../_guard";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";

const PostSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  kind: z.string().min(1).default("notice"),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);
  const { data, error } = await g.service
    .from("home_cards")
    .insert({ title: b.title.trim(), body: b.body.trim(), kind: b.kind.trim() })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return ok(data);
});

export const DELETE = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, DeleteSchema);

  const { error } = await g.service.from("home_cards").delete().eq("id", q.id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(true);
});
