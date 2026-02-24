import { ok, withApi } from "@/lib/api/http";

export const GET = withApi(async () => ok({ status: "ok" }));
