import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addHoursToDateTimeLocal,
  dateTimeLocalToIso,
  eventDirectionsUrl,
  eventMapEmbedUrl,
  eventOrganizer,
  eventStatus,
  formatEventAttendeeNames,
  formatEventDateLabel,
  formatEventDateTile,
  formatEventDuration,
  formatEventTimeLabel,
  googleMapsEmbedUrl,
  safeExternalUrl,
  splitEventLocation,
  toDateTimeLocal,
} from "../lib/event-ui";
import { formatOrganizerName } from "../lib/organizer";
import { formatSpecialBodyName } from "../lib/special-body";

test("a map always comes from Google, preferring a stored embed", () => {
  const embed = "https://www.google.com/maps/embed?pb=abc";
  assert.equal(eventMapEmbedUrl(embed, "Monas"), embed);
  assert.equal(
    eventMapEmbedUrl("https://evil.test/maps/embed", "Monas, Jakarta!"),
    "https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sMonas%2C%20Jakarta%21",
  );
  assert.equal(eventMapEmbedUrl(null, "  "), null);
  assert.ok(googleMapsEmbedUrl(eventMapEmbedUrl(null, "Monas")));
});

test("directions skip embeds and unsafe links", () => {
  assert.equal(eventDirectionsUrl("https://maps.app.goo.gl/x", "Monas"), "https://maps.app.goo.gl/x");
  assert.match(
    eventDirectionsUrl("https://www.google.com/maps/embed?pb=a", "Monas") ?? "",
    /maps\/search/,
  );
  assert.match(eventDirectionsUrl("javascript:alert(1)", "Monas") ?? "", /maps\/search/);
  assert.equal(eventDirectionsUrl(null, null), null);
});

test("location text splits into a place and its address", () => {
  assert.deepEqual(splitEventLocation("Monas, Gambir, Jakarta"), {
    place: "Monas",
    address: "Gambir, Jakarta",
  });
  assert.deepEqual(splitEventLocation("Monas"), { place: "Monas", address: "" });
  assert.deepEqual(splitEventLocation(undefined), { place: "", address: "" });
});

test("attendee names lead the sentence and the rest are counted", () => {
  assert.equal(
    formatEventAttendeeNames(["Kamu", "Rizky", "Fajar"], 12),
    "Kamu, Rizky, dan 10 lainnya",
  );
  assert.equal(formatEventAttendeeNames(["Kamu"], 12), "Kamu dan 11 lainnya");
  assert.equal(formatEventAttendeeNames(["Kamu"], 1), "Kamu");
  assert.equal(formatEventAttendeeNames(["Rizky", "Fajar"], 2), "Rizky dan Fajar");
  assert.equal(formatEventAttendeeNames([], 5), "");
});

test("labels stay in WIB whatever zone the runtime is in", () => {
  const start = "2026-11-15T01:00:00Z";
  const end = "2026-11-15T05:00:00Z";
  assert.equal(formatEventTimeLabel(start, end), "08.00–12.00 WIB");
  assert.equal(formatEventDateLabel(start, end), "Minggu, 15 November 2026");
});

test("a UTC evening already counts as the next WIB day", () => {
  assert.equal(formatEventDateTile("2026-11-14T20:00:00Z").day, "15");
});

test("multi-day events show a date range", () => {
  assert.equal(
    formatEventDateLabel("2026-11-15T01:00:00Z", "2026-11-17T05:00:00Z"),
    "15 Nov – 17 Nov 2026",
  );
});

test("form values round-trip through wall-clock WIB", () => {
  assert.equal(toDateTimeLocal("2026-11-15T01:00:00Z"), "2026-11-15T08:00");
  assert.equal(toDateTimeLocal("2026-11-15T08:00:00+07:00"), "2026-11-15T08:00");
  assert.equal(dateTimeLocalToIso("2026-11-15T08:00"), "2026-11-15T08:00:00+07:00");
  assert.equal(toDateTimeLocal(dateTimeLocalToIso("2026-11-15T23:30")), "2026-11-15T23:30");
});

test("the default end time rolls over midnight", () => {
  assert.equal(addHoursToDateTimeLocal("2026-11-15T23:00", 2), "2026-11-16T01:00");
});

test("status follows the WIB calendar", () => {
  const now = new Date("2026-11-15T02:00:00Z");
  const status = (start: string, end: string) => eventStatus(start, end, now).label;
  assert.equal(status("2026-11-10T01:00:00Z", "2026-11-10T05:00:00Z"), "Selesai");
  assert.equal(status("2026-11-15T01:00:00Z", "2026-11-15T05:00:00Z"), "Sedang berlangsung");
  assert.equal(status("2026-11-15T09:00:00Z", "2026-11-15T10:00:00Z"), "Hari ini");
  assert.equal(status("2026-11-16T01:00:00Z", "2026-11-16T02:00:00Z"), "Besok");
  assert.equal(status("2026-11-20T01:00:00Z", "2026-11-20T02:00:00Z"), "Akan datang");
});

test("duration reads in hours, minutes, or days", () => {
  assert.equal(formatEventDuration(240), "4 jam");
  assert.equal(formatEventDuration(90), "1 jam 30 menit");
  assert.equal(formatEventDuration(45), "45 menit");
  assert.equal(formatEventDuration(2 * 24 * 60), "2 hari");
  assert.equal(formatEventDuration(0), null);
});

test("stored links only pass as http or https", () => {
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl("data:text/html,x"), null);
  assert.equal(safeExternalUrl("bukan url"), null);
  assert.equal(safeExternalUrl(""), null);
  assert.equal(safeExternalUrl("https://forms.gle/abc"), "https://forms.gle/abc");
});

test("only Google's own embed path may become an iframe", () => {
  const embed = "https://www.google.com/maps/embed?pb=abc";
  assert.equal(googleMapsEmbedUrl(embed), embed);
  assert.equal(googleMapsEmbedUrl("https://www.google.com/maps/place/x"), null);
  assert.equal(googleMapsEmbedUrl("https://www.google.com.evil.test/maps/embed"), null);
  assert.equal(googleMapsEmbedUrl("http://www.google.com/maps/embed?pb=abc"), null);
  assert.equal(googleMapsEmbedUrl("javascript:alert(1)"), null);
});

test("organizers read as entities, and special bodies get no profile link", () => {
  const branch = eventOrganizer({
    entity_type: "branch",
    entity_id: "b1",
    entity_name: "Depok",
  });
  assert.equal(branch.author.name, "HMI Cabang Depok");
  assert.equal(branch.href, "/branches/b1");

  const body = eventOrganizer({
    entity_type: "special_body",
    entity_id: "s1",
    entity_name: "KOHATI Cabang Depok",
  });
  assert.equal(body.author.name, "KOHATI Cabang Depok");
  assert.equal(body.href, null);
});

test("training organizer names include entity level without duplicate prefixes", () => {
  assert.equal(formatOrganizerName({ organizer_type: "chapter", organizer_name: "Komisariat X" }), "HMI Komisariat X");
  assert.equal(formatOrganizerName({ organizer_type: "branch", organizer_name: "HMI Cabang Y" }), "HMI Cabang Y");
  assert.equal(formatOrganizerName({ organizer_type: "coordinating_chapter", organizer_name: "F" }), "HMI Korkom F");
  assert.equal(formatOrganizerName({ organizer_type: "organization", organizer_name: "HMI" }), "HMI");
  assert.equal(formatOrganizerName({ organizer_type: "special_body", organizer_name: "G", level: "LKK" }), "KOHATI Cabang G");
  assert.equal(formatOrganizerName({ organizer_type: "special_body", organizer_name: "BPL HMI", level: "SC" }), "BPL PB HMI");
  assert.equal(formatSpecialBodyName("kohati", "organization", "HMI"), "KOHATI PB HMI");
});
