import { z } from "zod";

/** Error padronizado para APIs (Next Route Handlers) */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, opts?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status ?? 400;
    this.code = opts?.code ?? "bad_request";
    this.details = opts?.details;
  }
}

export function ok(data?: unknown, init?: ResponseInit) {
  return Response.json({ ok: true, data }, { status: 200, ...init });
}

export function fail(err: unknown, init?: ResponseInit) {
  if (err instanceof ApiError) {
    return Response.json(
      { ok: false, error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status, ...init }
    );
  }
  const message = err instanceof Error ? err.message : "Erro inesperado";
  return Response.json(
    { ok: false, error: { code: "internal_error", message } },
    { status: 500, ...init }
  );
}

/** Wrapper para evitar try/catch repetido */
export function withApi<T extends (req: Request) => Promise<Response>>(fn: T) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      return fail(e);
    }
  };
}

/** Lê JSON e valida com Zod */
export async function jsonBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown = {};
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError("Body inválido", { status: 400, code: "invalid_body", details: parsed.error.flatten() });
  }
  return parsed.data;
}

/** Valida searchParams com Zod */
export function queryParams<T extends z.ZodTypeAny>(url: URL, schema: T): z.infer<T> {
  const obj: Record<string, string | undefined> = {};
  url.searchParams.forEach((v, k) => {
    obj[k] = v;
  });

  const parsed = schema.safeParse(obj);
  if (!parsed.success) {
    throw new ApiError("Querystring inválida", { status: 400, code: "invalid_query", details: parsed.error.flatten() });
  }
  return parsed.data;
}
