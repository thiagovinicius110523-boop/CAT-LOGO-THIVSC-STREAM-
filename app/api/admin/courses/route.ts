import { requireAdmin } from "../_guard";
import { ApiError, ok, withApi } from "@/lib/api/http";
import { listCourses } from "@/services/admin/courses";

export const GET = withApi(async () => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const data = await listCourses(g.service);
  return ok(data);
});
