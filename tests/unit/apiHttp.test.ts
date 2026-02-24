import { describe, it, expect } from "vitest";
import { ApiError, fail } from "@/lib/api/http";

describe("api/http", () => {
  it("serializes ApiError", async () => {
    const res = fail(new ApiError("nope", { status: 401, code: "unauthorized" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("unauthorized");
  });
});
