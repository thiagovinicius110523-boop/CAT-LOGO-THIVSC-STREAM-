import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const PutSchema = z.object({
  title: z.string().min(1).default("Bem-vindo(a)!"),
  subtitle: z.string().default(""),
});

export const GET = withApi(async () => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const { data: home, error: e1 } = await g.service
    .from("home_content")
    .select("title,subtitle")
    .eq("id", 1)
    .maybeSingle();
  if (e1) throw new ApiError(e1.message, { status: 400, code: "db_error" });

  const { data: cards, error: e2 } = await g.service
    .from("home_cards")
    .select("*")
    .order("created_at", { ascending: false });
  if (e2) throw new ApiError(e2.message, { status: 400, code: "db_error" });

  return ok({ home, cards: cards ?? [] });
});

export const PUT = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, PutSchema);
  const title = String(b.title || "Bem-vindo(a)!");
  const subtitle = String(b.subtitle || "");

  const { data, error } = await g.service
    .from("home_content")
    .upsert({ id: 1, title, subtitle })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return ok(data);
});
