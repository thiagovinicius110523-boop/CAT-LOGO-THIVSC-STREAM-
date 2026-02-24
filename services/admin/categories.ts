import { ApiError } from "@/lib/api/http";
import type { Db } from "../_types";

export async function listCategories(db: Db, opts?: { type?: string | null }) {
  let q = db.from("categories").select("*").order("name");
  if (opts?.type) q = q.eq("type", opts.type);
  const { data, error } = await q;
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data ?? [];
}

export async function createCategory(db: Db, payload: { type: string; name: string }) {
  const { data, error } = await db
    .from("categories")
    .insert({ type: payload.type, name: payload.name })
    .select("*")
    .single();
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data;
}

export async function updateCategory(db: Db, payload: { id: string; name: string }) {
  const { data, error } = await db
    .from("categories")
    .update({ name: payload.name })
    .eq("id", payload.id)
    .select("*")
    .single();
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data;
}

export async function deleteCategory(db: Db, id: string) {
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return true;
}
