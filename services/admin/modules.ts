import { ApiError } from "@/lib/api/http";
import type { Db } from "../_types";

export async function createModule(
  db: Db,
  payload: { course_id: string; title: string; description?: string | null; sort_order?: number }
) {
  const { data, error } = await db
    .from("course_modules")
    .insert({
      course_id: payload.course_id,
      title: payload.title,
      description: payload.description ?? null,
      sort_order: payload.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data;
}

export async function deleteModule(db: Db, id: string) {
  const { error } = await db.from("course_modules").delete().eq("id", id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return true;
}
