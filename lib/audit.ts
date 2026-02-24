import type { SupabaseClient } from "@supabase/supabase-js";

export async function auditLog(
  service: SupabaseClient,
  payload: {
    actor_id: string;
    action: string;
    entity: string;
    entity_id?: string | null;
    metadata?: Record<string, unknown> | null;
  }
) {
  // Não quebrar a operação principal caso a tabela não exista ainda.
  try {
    await service.from("audit_logs").insert({
      actor_id: payload.actor_id,
      action: payload.action,
      entity: payload.entity,
      entity_id: payload.entity_id ?? null,
      metadata: payload.metadata ?? null,
    });
  } catch {
    // ignore
  }
}
