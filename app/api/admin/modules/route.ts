import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";
import { createModule, deleteModule } from "@/services/admin/modules";

const PostSchema = z.object({
  course_id: z.union([z.string().min(1), z.number()]),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  sort_order: z.coerce.number().optional(),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);

  const data = await createModule(g.service, {
    course_id: String(b.course_id),
    title: b.title.trim(),
    description: b.description?.trim() || null,
    sort_order: b.sort_order ?? 0,
  });

  return ok(data);
});

export const DELETE = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, DeleteSchema);

  await deleteModule(g.service, q.id);
  return ok(true);
});
