import assert from "node:assert/strict";
import test from "node:test";
import { buildGuestHeaderWhatsAppMessage } from "./guest-whatsapp-message.ts";

test("booking page message asks for help finding a stay", () => {
  assert.equal(
    buildGuestHeaderWhatsAppMessage(),
    "Hi! I’m looking for a stay in Goa. Could you help me find a suitable property?",
  );
  assert.equal(buildGuestHeaderWhatsAppMessage(null), buildGuestHeaderWhatsAppMessage());
  assert.equal(buildGuestHeaderWhatsAppMessage("   "), buildGuestHeaderWhatsAppMessage());
});

test("property page message names the property", () => {
  assert.equal(
    buildGuestHeaderWhatsAppMessage(" 3BHK Villa Varca "),
    "Hi! I’m interested in 3BHK Villa Varca in Goa. Could you help me with availability and pricing?",
  );
});
