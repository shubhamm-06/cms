import assert from "node:assert/strict";
import { test } from "node:test";
import { addOneDay, buildStayEnquiryMessage, countNights, formatStayRange, parseDateInputValue, validateStayDates } from "./property-enquiry-message.ts";

const today = "2026-10-13";

test("missing dates identify the input to focus, check-in first", () => {
  assert.equal(validateStayDates("", "", today)?.field, "check-in");
  assert.equal(validateStayDates("2026-10-18", "", today)?.field, "check-out");
});

test("past and reversed or same-day dates are rejected with specific errors", () => {
  assert.equal(validateStayDates("2026-10-12", "2026-10-18", today)?.message, "Check-in cannot be in the past.");
  for (const checkOut of ["2026-10-17", "2026-10-18"]) {
    assert.equal(validateStayDates("2026-10-18", checkOut, today)?.message, "Check-out must be after check-in.");
  }
  assert.equal(validateStayDates(today, "2026-10-14", today), null);
});

test("calendar dates reject rollover and allow valid leap days", () => {
  assert.equal(parseDateInputValue("2026-02-30"), null);
  assert.ok(parseDateInputValue("2028-02-29"));
  assert.equal(addOneDay("2026-12-31"), "2027-01-01");
});

test("the WhatsApp message includes readable dates, nights, guests and the canonical property", () => {
  const message = buildStayEnquiryMessage({ checkIn: "2026-10-18", checkOut: "2026-10-21", guestCount: 2, propertyName: "Villa & Pool", propertyUrl: "https://www.curatemystay.net/property/villa" });
  assert.ok(message.includes("Villa & Pool"));
  assert.ok(message.includes("Check-in: 18 Oct 2026, Check-out: 21 Oct 2026 (3 nights), Guests: 2."));
  assert.ok(message.includes("https://www.curatemystay.net/property/villa"));
  assert.equal(decodeURIComponent(encodeURIComponent(message)), message);
});

test("nights count calendar days across a daylight-saving boundary", () => {
  const message = buildStayEnquiryMessage({ checkIn: "2026-03-07", checkOut: "2026-03-10", guestCount: 1, propertyName: "Villa", propertyUrl: "https://www.curatemystay.net/property/villa" });
  assert.ok(message.includes("(3 nights)"));
});

test("nights between two dates, including across a month and a DST change", () => {
  assert.equal(countNights("2026-10-18", "2026-10-21"), 3);
  assert.equal(countNights("2026-10-30", "2026-11-02"), 3);
  assert.equal(countNights("2026-03-28", "2026-03-30"), 2);
  assert.equal(countNights("2026-10-18", "2026-10-18"), null);
  assert.equal(countNights("", "2026-10-21"), null);
});

test("stay range reads naturally within and across months", () => {
  assert.equal(formatStayRange("2026-10-18", "2026-10-21"), "18 to 21 Oct");
  assert.equal(formatStayRange("2026-10-30", "2026-11-02"), "30 Oct to 2 Nov");
  assert.equal(formatStayRange("2026-12-30", "2027-01-02"), "30 Dec to 2 Jan");
  assert.equal(formatStayRange("2026-10-18", ""), null);
});

test("the enquiry message still carries the night count", () => {
  assert.match(buildStayEnquiryMessage({ checkIn: "2026-10-18", checkOut: "2026-10-21", guestCount: 2, propertyName: "Villa", propertyUrl: "https://x/p" }), /\(3 nights\)/);
});
