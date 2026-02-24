import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";

const PostSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const PutSchema = z.object({
  id: z.union([z.string().min(1), z.number()]),
  published: z.boolean().optional(),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const GET = withApi(async () => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const { data, error } = await g.service
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return ok(data ?? []);
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);

  const { data, error } = await g.service
    .from("notifications")
    .insert({ title: b.title.trim(), body: b.body.trim(), published: false })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return ok(data);
});

export const PUT = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PutSchema);
  const id = String(b.id);
  const published = Boolean(b.published);

  const { data, error } = await g.service
    .from("notifications")
    .update({ published })
    .eq("id", id)
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

  const { error } = await g.service.from("notifications").delete().eq("id", q.id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(true);
});
