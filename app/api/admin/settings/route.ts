import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const PostSchema = z.object({
  theme: z.string().min(1).default("Galaxy Soft (Padrão)"),
  layout: z.string().min(1).default("Modelo 01"),
});

export const GET = withApi(async () => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const { data, error } = await g.service.from("app_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(data ?? null);
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PostSchema);

  const { data, error } = await g.service
    .from("app_settings")
    .upsert({ id: 1, theme: b.theme, layout: b.layout })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return ok(data);
});
