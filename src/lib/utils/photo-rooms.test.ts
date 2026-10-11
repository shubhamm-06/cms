import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyRoomPrefix,
  inferRoom,
  normaliseRoomName,
  parsePhotoRoom,
  roomKey,
} from "./photo-rooms.ts";

/**
 * No real alt text exists yet (every stored value is empty), so these strings
 * are realistic examples of what an admin would write for the Varca 3 BHK
 * listing: its three AC bedrooms with balconies, shared pool, dining hall,
 * kitchen with microwave and fridge, and top-floor study tables.
 */

test("explicit prefix: room before the pipe, description after", () => {
  const info = parsePhotoRoom("Bedroom 2 | Bed with ceiling fan and balcony");
  assert.equal(info.room, "Bedroom 2");
  assert.equal(info.description, "Bed with ceiling fan and balcony");
  assert.equal(info.source, "prefix");
});

test("explicit prefix wins over keywords in the description", () => {
  const info = parsePhotoRoom("Living room | Sofa facing the balcony and pool");
  assert.equal(info.room, "Living room");
});

test("prefix room names are normalised so spelling variants share a section", () => {
  const a = parsePhotoRoom("bedroom 2  | Twin beds");
  const b = parsePhotoRoom("  Bedroom 2| Wardrobe");
  const c = parsePhotoRoom("BEDROOM TWO | Desk by the window");
  assert.equal(a.room, "Bedroom 2");
  assert.equal(a.roomKey, b.roomKey);
  assert.equal(a.roomKey, c.roomKey);
  assert.equal(c.room, "Bedroom 2");
  assert.equal(roomKey("wc"), "wc");
  assert.equal(normaliseRoomName("wc"), "WC");
});

test("a prefix with an empty description keeps the room and has no description", () => {
  const info = parsePhotoRoom("Pool |");
  assert.equal(info.room, "Pool");
  assert.equal(info.description, null);
});

test("a long sentence containing a pipe is not a prefix", () => {
  const info = parsePhotoRoom("A very long description of the shared community swimming pool area | at dusk");
  assert.equal(info.source, "inferred");
  assert.equal(info.room, "Pool");
});

test("only the first pipe splits; later pipes stay in the description", () => {
  const info = parsePhotoRoom("Kitchen | Fridge | microwave | stove");
  assert.equal(info.room, "Kitchen");
  assert.equal(info.description, "Fridge | microwave | stove");
});

test("inference reads numbers: digits, words and ordinals", () => {
  assert.equal(inferRoom("Bedroom 2 with ceiling fan"), "Bedroom 2");
  assert.equal(inferRoom("Bedroom two"), "Bedroom 2");
  assert.equal(inferRoom("Bathroom 3"), "Bathroom 3");
  assert.equal(inferRoom("2nd bedroom with ceiling fan"), "Bedroom 2");
  assert.equal(inferRoom("Second bathroom"), "Bathroom 2");
  assert.equal(inferRoom("Bedroom #3"), "Bedroom 3");
});

test("no number gives the plain room name", () => {
  assert.equal(inferRoom("Master bedroom with AC"), "Bedroom");
  assert.equal(inferRoom("Bathroom with hot water"), "Bathroom");
});

test("a number that is not the room's is ignored", () => {
  assert.equal(inferRoom("Bedroom with 2 single beds"), "Bedroom");
  assert.equal(inferRoom("3 AC bedrooms with ceiling fans"), "Bedroom");
});

test("priority order, not word position, resolves multiple matches", () => {
  assert.equal(inferRoom("Bedroom with attached bathroom"), "Bathroom");
  assert.equal(inferRoom("Bathroom and toilet"), "WC");
  assert.equal(inferRoom("Kitchen with a view of the pool"), "Kitchen");
  assert.equal(inferRoom("Dining hall next to the kitchen"), "Kitchen");
  assert.equal(inferRoom("Study table on the balcony"), "Work area");
  // Balcony outranks Bedroom by design, so mixed text lands in Balcony. Use the
  // "Bedroom 2 | ..." prefix to keep such a photo in its bedroom.
  assert.equal(inferRoom("Bedroom opening to the balcony"), "Balcony");
  assert.equal(parsePhotoRoom("Bedroom 2 | Opens to the balcony").room, "Bedroom 2");
  assert.equal(inferRoom("Front view of the master bedroom"), "Bedroom");
  assert.equal(inferRoom("Sofa in the living room"), "Living room");
});

test("keyword map covers every room", () => {
  const cases: Array<[string, string]> = [
    ["Villa front view", "Exterior"],
    ["Entrance and garden", "Exterior"],
    ["Living area with sofa", "Living room"],
    ["Hall", "Living room"],
    ["Dining table for eight", "Dining area"],
    ["Fully equipped kitchen", "Kitchen"],
    ["Microwave and fridge", "Kitchen"],
    ["Shower area", "Bathroom"],
    ["Washroom", "Bathroom"],
    ["WC", "WC"],
    ["Toilet", "WC"],
    ["Powder room", "WC"],
    ["Sit-out", "Balcony"],
    ["Terrace", "Balcony"],
    ["Shared swimming pool", "Pool"],
    ["Study desk", "Work area"],
    ["Clubhouse", "Common area"],
    ["Main gate", "Common area"],
    ["Car parking", "Common area"],
  ];
  for (const [alt, room] of cases) assert.equal(inferRoom(alt), room, alt);
});

test("matching is whole-word and case-insensitive, with plurals", () => {
  assert.equal(inferRoom("BEDROOMS"), "Bedroom");
  assert.equal(inferRoom("Balconies"), "Balcony");
  assert.equal(inferRoom("Network rack"), null);
  assert.equal(inferRoom("Bedroomy"), null);
  assert.equal(inferRoom("Hallway"), null);
});

test("empty, generic and unmatched text has no room", () => {
  for (const alt of [null, undefined, "", "   ", "Image", "Photo 3", "Villa photo 2", "IMG_0042.jpg", "Property gallery image"]) {
    const info = parsePhotoRoom(alt);
    assert.equal(info.room, null, String(alt));
    assert.equal(info.roomKey, null, String(alt));
  }
  assert.equal(parsePhotoRoom("A sunny afternoon").room, null);
});

test("generic text is not offered as a description", () => {
  assert.equal(parsePhotoRoom("IMG_0042.jpg").description, null);
  assert.equal(parsePhotoRoom("A sunny afternoon").description, "A sunny afternoon");
});

test("inferred rooms keep the full text as the description", () => {
  const info = parsePhotoRoom("Fully equipped kitchen with microwave");
  assert.equal(info.room, "Kitchen");
  assert.equal(info.description, "Fully equipped kitchen with microwave");
  assert.equal(info.source, "inferred");
});

test("applyRoomPrefix adds, replaces and removes the prefix", () => {
  assert.equal(applyRoomPrefix("Bed with ceiling fan", "Bedroom 2"), "Bedroom 2 | Bed with ceiling fan");
  assert.equal(applyRoomPrefix("Bedroom 1 | Bed with ceiling fan", "Bedroom 2"), "Bedroom 2 | Bed with ceiling fan");
  assert.equal(applyRoomPrefix("", "Pool"), "Pool |");
  assert.equal(applyRoomPrefix(null, "bedroom two"), "Bedroom 2 |");
  assert.equal(applyRoomPrefix("Pool | Evening light", ""), "Evening light");
  assert.equal(parsePhotoRoom(applyRoomPrefix("Evening light", "Pool")).room, "Pool");
});
