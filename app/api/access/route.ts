import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const BodySchema = z.object({
  item_id: z.union([z.string().min(1), z.number()]),
});

export const POST = withApi(async (req: Request) => {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError("Not authenticated", { status: 401, code: "unauthorized" });

  const body = await jsonBody(req, BodySchema);
  const item_id = String(body.item_id);

  const { error } = await supabase.from("user_last_access").upsert({
    user_id: user.id,
    item_id,
    last_opened_at: new Date().toISOString(),
  });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(true);
});
