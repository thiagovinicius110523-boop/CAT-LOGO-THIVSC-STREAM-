import { ApiError } from "@/lib/api/http";
import type { Db } from "../_types";

export async function getCourseDetail(db: Db, course_id: string) {
  const { data: modules, error: e1 } = await db
    .from("course_modules")
    .select("*")
    .eq("course_id", course_id)
    .order("sort_order", { ascending: true });

  if (e1) throw new ApiError(e1.message, { status: 400, code: "db_error" });

  const moduleIds = (modules ?? []).map((m: any) => m.id);

  const { data: lessons, error: e2 } = moduleIds.length
    ? await db
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("sort_order", { ascending: true })
    : { data: [], error: null as any };

  if (e2) throw new ApiError(e2.message, { status: 400, code: "db_error" });

  return { modules: modules ?? [], lessons: lessons ?? [] };
}
