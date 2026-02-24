import { ApiError } from "@/lib/api/http";
import type { Db } from "../_types";

export async function createLesson(
  db: Db,
  payload: { module_id: string; title: string; description?: string | null; sort_order?: number; link?: string | null }
) {
  const { data, error } = await db
    .from("course_lessons")
    .insert({
      module_id: payload.module_id,
      title: payload.title,
      description: payload.description ?? null,
      sort_order: payload.sort_order ?? 0,
      link: payload.link ?? null,
    })
    .select("*")
    .single();

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data;
}

export async function deleteLesson(db: Db, id: string) {
  const { error } = await db.from("course_lessons").delete().eq("id", id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return true;
}
