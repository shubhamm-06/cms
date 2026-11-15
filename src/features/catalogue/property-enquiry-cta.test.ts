import assert from "node:assert/strict";
import { test } from "node:test";
import { getPropertyEnquiryCtas } from "./property-enquiry-cta.ts";

const listing = "https://www.airbnb.co.in/rooms/12345678";

test("a valid Airbnb link on an accepting property shows the Airbnb option", () => {
  assert.deepEqual(getPropertyEnquiryCtas(true, listing), { paused: false, showAirbnb: true, airbnbUrl: listing });
  assert.equal(getPropertyEnquiryCtas(true, `  ${listing}  `).airbnbUrl, listing);
});

test("no Airbnb link keeps the WhatsApp and Call layout", () => {
  const expected = { paused: false, showAirbnb: false, airbnbUrl: null };
  assert.deepEqual(getPropertyEnquiryCtas(true, null), expected);
  assert.deepEqual(getPropertyEnquiryCtas(true, undefined), expected);
  assert.deepEqual(getPropertyEnquiryCtas(true, ""), expected);
});

test("an invalid Airbnb link is treated as no link", () => {
  const expected = { paused: false, showAirbnb: false, airbnbUrl: null };
  for (const value of ["not a url", "http://www.airbnb.com/rooms/123", "https://example.com/rooms/123", "https://www.airbnb.com/s/goa", "javascript:alert(1)"]) {
    assert.deepEqual(getPropertyEnquiryCtas(true, value), expected, value);
  }
});

test("paused enquiries suppress booking CTAs even with a valid listing", () => {
  assert.deepEqual(getPropertyEnquiryCtas(false, listing), { paused: true, showAirbnb: false, airbnbUrl: null });
  assert.deepEqual(getPropertyEnquiryCtas(false, null), { paused: true, showAirbnb: false, airbnbUrl: null });
});
