import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import CourseDetailClient from "@/components/CourseDetailClient";

export default async function Curso({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: course } = await supabase.from("items").select("id,title,description").eq("id", params.id).maybeSingle();
  const { data: modules } = await supabase.from("course_modules").select("id,title,description,sort_order").eq("course_id", params.id).order("sort_order");

  const moduleIds = (modules || []).map((m:any)=>m.id);
  const { data: lessons } = moduleIds.length
    ? await supabase.from("course_lessons").select("id,module_id,title,description,sort_order,link").in("module_id", moduleIds).order("sort_order")
    : { data: [] as any[] };

  const { data: { user } } = await supabase.auth.getUser();
  const lessonIds = (lessons || []).map((l:any)=>l.id);
  const { data: progress } = user && lessonIds.length
    ? await supabase.from("lesson_progress").select("lesson_id,done").eq("user_id", user.id).in("lesson_id", lessonIds)
    : { data: [] as any[] };

  const doneIds = (progress || []).filter((p:any)=>p.done).map((p:any)=>p.lesson_id);

  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="h1">{course?.title || "Curso"}</h1>
          {course?.description ? <div className="small" style={{ marginTop: 6 }}>{course.description}</div> : null}
        </div>
        <Link className="pill" href="/cursos">Voltar</Link>
      </div>
      <CourseDetailClient modules={modules || []} lessons={lessons || []} initialDoneIds={doneIds} />
    </div>
  );
}
