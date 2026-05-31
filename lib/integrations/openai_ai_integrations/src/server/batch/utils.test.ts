import { describe, it, expect } from "vitest";
import { isRateLimitError } from "./utils";

describe("isRateLimitError", () => {
  it("returns true for errors containing '429'", () => {
    expect(isRateLimitError(new Error("Request failed with status 429"))).toBe(true);
    expect(isRateLimitError("429 Too Many Requests")).toBe(true);
  });

  it("returns true for errors containing 'RATELIMIT_EXCEEDED'", () => {
    expect(isRateLimitError(new Error("Error: RATELIMIT_EXCEEDED"))).toBe(true);
    expect(isRateLimitError("RATELIMIT_EXCEEDED")).toBe(true);
  });

  it("returns true for errors containing 'quota' (case-insensitive)", () => {
    expect(isRateLimitError(new Error("You have exceeded your quota"))).toBe(true);
    expect(isRateLimitError("QUOTA exceeded")).toBe(true);
  });

  it("returns true for errors containing 'rate limit' (case-insensitive)", () => {
    expect(isRateLimitError(new Error("Rate limit exceeded"))).toBe(true);
    expect(isRateLimitError("RATE LIMIT Reached")).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isRateLimitError(new Error("Not Found"))).toBe(false);
    expect(isRateLimitError("Internal Server Error 500")).toBe(false);
    expect(isRateLimitError(new TypeError("Invalid argument"))).toBe(false);
  });

  it("handles non-string/non-Error inputs gracefully", () => {
    expect(isRateLimitError({ status: 404 })).toBe(false);
    expect(isRateLimitError(null)).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
    expect(isRateLimitError(123)).toBe(false);
  });
});
