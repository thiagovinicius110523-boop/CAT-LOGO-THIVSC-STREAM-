import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const BodySchema = z.object({
  course_id: z.union([z.string().min(1), z.number()]),
  last_lesson_id: z.union([z.string().min(1), z.number()]).nullable().optional(),
});

export const POST = withApi(async (req: Request) => {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError("Not authenticated", { status: 401, code: "unauthorized" });

  const b = await jsonBody(req, BodySchema);
  const course_id = String(b.course_id);
  const last_lesson_id = b.last_lesson_id == null ? null : String(b.last_lesson_id);

  const { error } = await supabase.from("user_course_state").upsert({
    user_id: user.id,
    course_id,
    last_lesson_id,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });

  return ok(true);
});
