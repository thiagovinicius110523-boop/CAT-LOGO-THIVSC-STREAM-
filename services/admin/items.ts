import { ApiError } from "@/lib/api/http";
import type { Db } from "../_types";

export async function listItems(db: Db, type?: string | null) {
  let q = db.from("items").select("*").order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data ?? [];
}

export type ItemPayload = {
  type: string;
  category_id: string;
  title: string;
  meta?: string | null;
  description?: string | null;
  progress?: number;
  link?: string | null;
};

export async function createItem(db: Db, payload: ItemPayload) {
  const p: any = {
    type: payload.type,
    category_id: payload.category_id,
    title: payload.title,
    meta: payload.meta ?? null,
    description: payload.description ?? null,
  };
  if (payload.type === "cursos") p.progress = payload.progress ?? 0;
  else p.link = payload.link ?? null;

  const { data, error } = await db.from("items").insert(p).select("*").single();
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data;
}

export async function updateItem(db: Db, id: string, payload: ItemPayload) {
  const p: any = {
    type: payload.type,
    category_id: payload.category_id,
    title: payload.title,
    meta: payload.meta ?? null,
    description: payload.description ?? null,
  };
  if (payload.type === "cursos") p.progress = payload.progress ?? 0;
  else p.link = payload.link ?? null;

  const { data, error } = await db.from("items").update(p).eq("id", id).select("*").single();
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return data;
}

export async function deleteItem(db: Db, id: string) {
  const { error } = await db.from("items").delete().eq("id", id);
  if (error) throw new ApiError(error.message, { status: 400, code: "db_error" });
  return true;
}
