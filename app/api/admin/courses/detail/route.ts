import { z } from "zod";
import { requireAdmin } from "../../_guard";
import { ApiError, ok, queryParams, withApi } from "@/lib/api/http";
import { getCourseDetail } from "@/services/admin/courseDetail";

const QuerySchema = z.object({
  course_id: z.string().min(1),
});

export const GET = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const url = new URL(req.url);
  const q = queryParams(url, QuerySchema);

  const data = await getCourseDetail(g.service, q.course_id);
  return ok(data);
});
