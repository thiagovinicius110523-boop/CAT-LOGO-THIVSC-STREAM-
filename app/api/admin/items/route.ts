import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";
import { createItem, deleteItem, listItems, updateItem } from "@/services/admin/items";

const GetQuerySchema = z.object({
  type: z.string().optional(),
});

const ItemSchema = z.object({
  type: z.string().min(1),
  category_id: z.union([z.string().min(1), z.number()]),
  title: z.string().min(1),
  meta: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  link: z.string().url().optional().nullable(),
});

const PutSchema = ItemSchema.extend({
  id: z.union([z.string().min(1), z.number()]),
});

const DeleteQuerySchema = z.object({
  id: z.string().min(1),
});

export const GET = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, GetQuerySchema);

  const data = await listItems(g.service, q.type ?? null);
  return ok(data);
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, ItemSchema);

  const data = await createItem(g.service, {
    type: b.type,
    category_id: String(b.category_id),
    title: b.title.trim(),
    meta: b.meta?.trim() || null,
    description: b.description?.trim() || null,
    progress: b.progress,
    link: b.link?.trim() || null,
  });

  return ok(data);
});

export const PUT = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PutSchema);
  const id = String(b.id);

  const data = await updateItem(g.service, id, {
    type: b.type,
    category_id: String(b.category_id),
    title: b.title.trim(),
    meta: b.meta?.trim() || null,
    description: b.description?.trim() || null,
    progress: b.progress,
    link: b.link?.trim() || null,
  });

  return ok(data);
});

export const DELETE = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, DeleteQuerySchema);

  await deleteItem(g.service, q.id);
  return ok(true);
});
