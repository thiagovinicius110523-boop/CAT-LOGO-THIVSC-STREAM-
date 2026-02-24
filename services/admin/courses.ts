import { ApiError } from "@/lib/api/http";
import type { Db } from "../_types";

export async function listCourses(db: Db) {
  const { data, error } = await db
    .from("items")
    .select("id,title")
    .eq("type", "cursos")
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data ?? [];
}
