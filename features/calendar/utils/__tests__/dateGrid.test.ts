import { getPeriodRange } from "../dateGrid";

describe("getPeriodRange", () => {
  it("spans the whole month, not the grid's filler days", () => {
    const { start, end } = getPeriodRange("month", new Date(2026, 9, 15));

    expect(start).toEqual(new Date(2026, 9, 1, 0, 0, 0, 0));
    expect(end).toEqual(new Date(2026, 9, 31, 23, 59, 59, 999));
  });

  it("handles a short February", () => {
    expect(getPeriodRange("month", new Date(2026, 1, 10)).end).toEqual(
      new Date(2026, 1, 28, 23, 59, 59, 999),
    );
  });

  it("spans Sunday to Saturday for a week", () => {
    // 2026-10-01 is a Thursday.
    const { start, end } = getPeriodRange("week", new Date(2026, 9, 1));

    expect(start).toEqual(new Date(2026, 8, 27, 0, 0, 0, 0));
    expect(end).toEqual(new Date(2026, 9, 3, 23, 59, 59, 999));
  });

  it("spans a single day", () => {
    const { start, end } = getPeriodRange("day", new Date(2026, 9, 1, 15, 30));

    expect(start).toEqual(new Date(2026, 9, 1, 0, 0, 0, 0));
    expect(end).toEqual(new Date(2026, 9, 1, 23, 59, 59, 999));
  });
});
