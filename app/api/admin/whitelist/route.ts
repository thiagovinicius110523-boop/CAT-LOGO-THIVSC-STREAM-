import { z } from "zod";
import { requireAdmin } from "../_guard";
import { auditLog } from "@/lib/audit";
import { ApiError, jsonBody, ok, queryParams, withApi } from "@/lib/api/http";

const PostSchema = z.object({
  email: z.string().email(),
  active: z.boolean().optional().default(true),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const GET = withApi(async () => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const { data, error } = await g.service
    .from("whitelist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(data ?? []);
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);
  const email = b.email.trim().toLowerCase();
  const active = Boolean(b.active);

  const { data, error } = await g.service
    .from("whitelist")
    .upsert({ email, active }, { onConflict: "email" })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  await auditLog(g.service, {
    actor_id: g.user.id,
    action: "upsert",
    entity: "whitelist",
    entity_id: data?.id ?? null,
    metadata: { email, active },
  });

  return ok(data);
});

export const DELETE = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, DeleteSchema);

  const { error } = await g.service.from("whitelist").delete().eq("id", q.id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  await auditLog(g.service, {
    actor_id: g.user.id,
    action: "delete",
    entity: "whitelist",
    entity_id: q.id,
  });

  return ok(true);
});
