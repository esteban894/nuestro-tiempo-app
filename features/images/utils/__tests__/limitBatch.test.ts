import { MAX_IMAGES_PER_BATCH } from "@/constants/upload";
import { limitBatch } from "../limitBatch";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("limitBatch", () => {
  it("matches the API batch limit of 20", () => {
    expect(MAX_IMAGES_PER_BATCH).toBe(20);
  });

  it("passes an empty selection through untouched", () => {
    expect(limitBatch([])).toEqual({ items: [], truncated: false });
  });

  it("accepts exactly the limit without truncating", () => {
    const result = limitBatch(range(20));
    expect(result.items).toHaveLength(20);
    expect(result.truncated).toBe(false);
  });

  it("truncates one over the limit and flags it", () => {
    const result = limitBatch(range(21));
    expect(result.items).toHaveLength(20);
    expect(result.truncated).toBe(true);
  });

  it("keeps the first picks in their original order", () => {
    expect(limitBatch(range(30)).items).toEqual(range(20));
  });
});
