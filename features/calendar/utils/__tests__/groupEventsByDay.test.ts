import { DateTime } from "luxon";
import type { CalendarEvent } from "../../api/calendar.api";
import { groupEventsByDay } from "../groupEventsByDay";

const ZONE = "America/Argentina/Salta";

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: "e1",
    coupleId: "c1",
    createdBy: "u1",
    type: "appointment",
    category: "date_plan",
    title: "Evento",
    description: null,
    location: null,
    startAt: "2026-10-10T15:00:00.000Z",
    endAt: null,
    allDay: false,
    timeZone: ZONE,
    recurrence: "none",
    reminderMinutesBefore: null,
    status: "confirmed",
    proposedBy: null,
    respondedBy: null,
    respondedAt: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

const range = (from: string, to: string) => ({
  start: DateTime.fromISO(from, { zone: ZONE }).startOf("day").toJSDate(),
  end: DateTime.fromISO(to, { zone: ZONE }).endOf("day").toJSDate(),
});
const group = (events: CalendarEvent[], from: string, to: string) => {
  const { start, end } = range(from, to);
  return groupEventsByDay(events, start, end, { deviceZone: ZONE });
};

describe("groupEventsByDay", () => {
  it("drops a non-recurring event outside the period", () => {
    const september = event({ id: "sep", startAt: "2025-09-19T00:00:00.000Z" });
    const october = event({ id: "oct" });

    const groups = group([september, october], "2026-10-01", "2026-10-31");

    expect(groups.map((g) => g.events.map((e) => e.id))).toEqual([["oct"]]);
  });

  it("places a past monthly all-day event on its day within the period", () => {
    const anniversary = event({
      id: "anniv",
      allDay: true,
      recurrence: "monthly",
      startAt: "2025-05-03T03:00:00.000Z",
    });

    const groups = group([anniversary], "2026-10-01", "2026-10-31");

    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe("2026-10-03");
    expect(groups[0].events).toHaveLength(1);
  });

  it("orders days chronologically, all-day first and then by time", () => {
    const late = event({ id: "late", startAt: "2026-10-10T23:00:00.000Z" });
    const early = event({ id: "early", startAt: "2026-10-10T12:00:00.000Z" });
    const allDay = event({ id: "all-day", allDay: true, startAt: "2026-10-10T03:00:00.000Z" });
    const earlier = event({ id: "earlier-day", startAt: "2026-10-05T12:00:00.000Z" });

    const groups = group([late, early, allDay, earlier], "2026-10-01", "2026-10-31");

    expect(groups.map((g) => g.dateKey)).toEqual(["2026-10-05", "2026-10-10"]);
    expect(groups[1].events.map((e) => e.id)).toEqual(["all-day", "early", "late"]);
  });
});
