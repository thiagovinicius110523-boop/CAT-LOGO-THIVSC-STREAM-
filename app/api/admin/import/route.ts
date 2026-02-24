import { z } from "zod";
import { requireAdmin } from "../_guard";
import { ApiError, jsonBody, ok, withApi } from "@/lib/api/http";

const LessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  sort_order: z.coerce.number().optional(),
});

const ModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  sort_order: z.coerce.number().optional(),
  lessons: z.array(LessonSchema).optional(),
});

const BodySchema = z.object({
  type: z.string().min(1),
  payload: z.object({
    category: z.string().min(1),
    course: z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      meta: z.string().optional().nullable(),
      link: z.string().optional().nullable(),
    }),
    modules: z.array(ModuleSchema).optional(),
  }),
});

export const POST = withApi(async (req: Request) => {
  const g = await requireAdmin();
  if (!g.ok) throw new ApiError(g.message, { status: g.status, code: "forbidden" });

  const b = await jsonBody(req, BodySchema);
  const type = b.type;
  const payload = b.payload;

  const categoryName = payload.category.trim();

  let { data: cat, error: cErr } = await g.service
    .from("categories")
    .select("id")
    .eq("type", type)
    .eq("name", categoryName)
    .maybeSingle();

  if (cErr) throw new ApiError(cErr.message, { status: 400, code: "db_error" });

  if (!cat) {
    const ins = await g.service.from("categories").insert({ type, name: categoryName }).select("id").single();
    if (ins.error) throw new ApiError(ins.error.message, { status: 400, code: "db_error" });
    cat = ins.data as any;
  }

  const course = payload.course;
  const title = course.title.trim();
  const description = course.description?.trim() || null;

  const itemPayload: any = {
    type,
    category_id: (cat as any).id,
    title,
    description,
    meta: course.meta?.trim() || null,
  };

  if (type === "cursos") itemPayload.progress = 0;
  else itemPayload.link = course.link?.trim() || null;

  const itemIns = await g.service.from("items").insert(itemPayload).select("id").single();
  if (itemIns.error) throw new ApiError(itemIns.error.message, { status: 400, code: "db_error" });
  const itemId = (itemIns.data as any).id;

  let modulesCreated = 0;
  let lessonsCreated = 0;

  if (type === "cursos") {
    const modules = payload.modules ?? [];
    for (let mi = 0; mi < modules.length; mi++) {
      const m = modules[mi]!;
      const mIns = await g.service
        .from("course_modules")
        .insert({
          course_id: itemId,
          title: m.title.trim(),
          description: m.description?.trim() || null,
          sort_order: Number(m.sort_order ?? mi),
        })
        .select("id")
        .single();

      if (mIns.error) throw new ApiError(mIns.error.message, { status: 400, code: "db_error" });
      modulesCreated += 1;
      const moduleId = (mIns.data as any).id;

      const lessons = m.lessons ?? [];
      for (let li = 0; li < lessons.length; li++) {
        const l = lessons[li]!;
        const lIns = await g.service.from("course_lessons").insert({
          module_id: moduleId,
          title: l.title.trim(),
          description: l.description?.trim() || null,
          link: l.link?.trim() || null,
          sort_order: Number(l.sort_order ?? li),
        });

        if (lIns.error) throw new ApiError(lIns.error.message, { status: 400, code: "db_error" });
        lessonsCreated += 1;
      }
    }
  }

  const summary = `Importado: categoria="${categoryName}", item="${title}" (${type}). Módulos: ${modulesCreated}, Aulas: ${lessonsCreated}.`;

  // best-effort: não falhar a importação se import_jobs não existir
  const job = await g.service.from("import_jobs").insert({ created_by: g.user.id, type: "telegram_json", status: "done", summary });
  // ignore job.error

  return ok({ item_id: itemId, summary });
});
