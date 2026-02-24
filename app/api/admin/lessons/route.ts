import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";
import { createLesson, deleteLesson } from "@/services/admin/lessons";

const PostSchema = z.object({
  module_id: z.union([z.string().min(1), z.number()]),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  sort_order: z.coerce.number().optional(),
  link: z.string().url().optional().nullable(),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);

  const data = await createLesson(g.service, {
    module_id: String(b.module_id),
    title: b.title.trim(),
    description: b.description?.trim() || null,
    sort_order: b.sort_order ?? 0,
    link: b.link?.trim() || null,
  });

  return ok(data);
});

export const DELETE = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, DeleteSchema);

  await deleteLesson(g.service, q.id);
  return ok(true);
});
