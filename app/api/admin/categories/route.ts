import { z } from "zod";
import { requireAdmin } from "../_guard";
import { auditLog } from "@/lib/audit";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/services/admin/categories";

const GetQuerySchema = z.object({
  type: z.string().optional(),
});

const PostSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
});

const PutSchema = z.object({
  id: z.union([z.string().min(1), z.number()]),
  name: z.string().min(1),
});

const DeleteQuerySchema = z.object({
  id: z.string().min(1),
});

export const GET = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, GetQuerySchema);

  const data = await listCategories(g.service, { type: q.type ?? null });
  return ok(data);
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);
  const data = await createCategory(g.service, { type: b.type, name: b.name.trim() });

  await auditLog(g.service, {
    actor_id: g.user.id,
    action: "create",
    entity: "categories",
    entity_id: data?.id ?? null,
    metadata: { type: b.type, name: b.name },
  });

  return ok(data);
});

export const PUT = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PutSchema);
  const id = String(b.id);
  const data = await updateCategory(g.service, { id, name: b.name.trim() });

  await auditLog(g.service, {
    actor_id: g.user.id,
    action: "update",
    entity: "categories",
    entity_id: data?.id ?? id,
    metadata: { name: b.name },
  });

  return ok(data);
});

export const DELETE = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, DeleteQuerySchema);

  await deleteCategory(g.service, q.id);

  await auditLog(g.service, {
    actor_id: g.user.id,
    action: "delete",
    entity: "categories",
    entity_id: q.id,
  });

  return ok(true);
});
