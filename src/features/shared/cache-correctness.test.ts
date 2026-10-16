import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const requirePackage = createRequire(resolve(root, "package.json"));
const ownerA = "11111111-1111-4111-8111-111111111111";
const ownerB = "22222222-2222-4222-8222-222222222222";
const propertyId = "33333333-3333-4333-8333-333333333333";
const expenseId = "44444444-4444-4444-8444-444444444444";
const imageId = "55555555-5555-4555-8555-555555555555";
type Row = Record<string, unknown>;

/** Executes the real loaders/actions offline; provider and Next cache transport are test doubles. */
function harness() {
  const tables: Record<string, Row[]> = {
    profiles: [{ id: ownerA, role: "owner", status: "active", email: "owner@example.test" }, { id: ownerB, role: "owner", status: "active" }],
    properties: [{ id: propertyId, owner_id: ownerA, name: "Villa" }],
    bookings: [{ id: "booking-a", property_id: propertyId }],
    expenses: [{ id: expenseId, property_id: propertyId, expense_for: "property", category: "Cleaning", amount: 100 }],
    owner_payouts: [], owner_queries: [], settings: [], property_images: [],
    public_property_catalogue: [{ id: propertyId, slug: "villa", public_name: "Villa" }],
    public_property_details: [{ id: propertyId, slug: "villa", public_name: "Villa" }],
    public_property_gallery: [{ property_id: propertyId, storage_path: "public-photo.jpg" }],
  };
  const reads: string[] = [];
  const paths: string[] = [];
  const tags: string[] = [];
  const entries = new Map<string, { tags: string[]; value: Promise<unknown> }>();
  let actor: string | null = ownerA;
  let now = Date.UTC(2026, 9, 14, 10, 0, 0);
  let failure: (table: string, operation: string, payload: Row | Row[] | undefined) => boolean = () => false;

  function from(table: string) {
    const filters: Array<(row: Row) => boolean> = [];
    let operation = "read";
    let payload: Row | Row[] | undefined;
    let single = false;
    const query = {
      select() { return query; }, order() { return query; },
      eq(key: string, value: unknown) { filters.push((row) => row[key] === value); return query; },
      in(key: string, values: unknown[]) { filters.push((row) => values.includes(row[key])); return query; },
      update(value: Row) { operation = "update"; payload = value; return query; },
      upsert(value: Row) { operation = "upsert"; payload = value; return query; },
      insert(value: Row | Row[]) { operation = "insert"; payload = value; return query; },
      delete() { operation = "delete"; return query; },
      maybeSingle() { single = true; return query; }, single() { single = true; return query; },
      then(onResolve: (value: unknown) => unknown, onReject: (reason: unknown) => unknown) {
        reads.push(table);
        if (failure(table, operation, payload)) return Promise.resolve({ data: null, error: { code: "TEST_FAILURE" } }).then(onResolve, onReject);
        let rows = (tables[table] || []).filter((row) => filters.every((filter) => filter(row)));
        if (operation === "update") rows.forEach((row) => Object.assign(row, payload));
        if (operation === "delete") tables[table] = tables[table].filter((row) => !rows.includes(row));
        if (operation === "insert" || operation === "upsert") {
          rows = (Array.isArray(payload) ? payload : [payload]).map((value) => ({ id: imageId, ...value }));
          tables[table].push(...rows);
        }
        return Promise.resolve({ data: single ? rows[0] || null : rows, error: null }).then(onResolve, onReject);
      },
    };
    return query;
  }
  const client = { from, auth: { getUser: async () => ({ data: { user: actor ? { id: actor, email: "owner@example.test", user_metadata: {} } : null } }) } };
  const modules = new Map<string, Record<string, unknown>>();
  const nextCache = {
    unstable_cache(fn: (...args: unknown[]) => Promise<unknown>, keyParts: string[], options: { tags: string[] }) {
      return (...args: unknown[]) => {
        const key = JSON.stringify([keyParts, args]);
        if (!entries.has(key)) {
          const value = fn(...args).catch((error) => { entries.delete(key); throw error; });
          entries.set(key, { value, tags: options.tags });
        }
        return entries.get(key)!.value;
      };
    },
    updateTag(tag: string) {
      tags.push(tag);
      for (const [key, entry] of entries) if (entry.tags.includes(tag)) entries.delete(key);
    },
    revalidatePath(path: string) { paths.push(path); },
  };
  // Transpiled test modules have dynamic exports; runtime assertions cover their concrete contracts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function load(path: string): Record<string, any> {
    const filename = resolve(root, path);
    if (modules.has(filename)) return modules.get(filename)!;
    const testModule = { exports: {} as Record<string, unknown> };
    modules.set(filename, testModule.exports);
    function localRequire(name: string) {
      if (name === "server-only") return {};
      if (name === "react") return { cache: (fn: unknown) => fn }; // Separate requests in this harness, no React render dispatcher.
      if (name === "next/cache") return nextCache;
      if (name === "next/server") return { connection: async () => undefined };
      if (name === "next/navigation") return { redirect: (url: string) => { throw new Error(`REDIRECT ${url}`); } };
      if (name === "@/src/lib/supabase/server") return { createClient: async () => client };
      if (name === "@/src/lib/supabase/public") return { createPublicClient: () => client };
      if (name === "@/src/lib/supabase/admin") return { createAdminClient: () => { throw new Error("Auth admin is not used in these tests"); } };
      if (name === "@/src/features/queries/owner-query-email") return { sendOwnerQueryAdminEmail: async () => undefined };
      if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
      return requirePackage(name);
    }
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    class Clock extends Date { static now() { return now; } }
    runInNewContext(output, { require: localRequire, exports: testModule.exports, module: testModule, Date: Clock, console: { error() {}, warn() {} }, process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://project.example.test", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-public-key" } }, URL, FormData, TextEncoder, AbortController, setTimeout, clearTimeout, fetch: () => { throw new Error("Network must not be used in offline tests"); } }, { filename });
    return testModule.exports;
  }
  return { load, tables, reads, paths, tags, actor: (id: string | null) => { actor = id; }, fail: (fn: typeof failure) => { failure = fn; }, advance: () => { now += 60000; } };
}

test("page-specific admin loading skips unrelated tables without changing return shapes", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  const result = await h.load("src/features/shared/data.ts").getAdminData(["properties"]);
  assert.equal(result.properties.length, 1);
  assert.equal(result.bookings.length, 0);
  assert.ok(!h.reads.includes("bookings") && !h.reads.includes("owner_payouts"));
});

test("owner reassignment and account switching cannot reuse another owner's records", async () => {
  const h = harness(); const data = h.load("src/features/shared/data.ts");
  assert.equal((await data.getOwnerData(["bookings"])).bookings.length, 1);
  h.tables.properties[0].owner_id = ownerB;
  assert.equal((await data.getOwnerData(["bookings"])).bookings.length, 0);
  h.actor(ownerB);
  assert.equal((await data.getOwnerData(["bookings"])).bookings.length, 1);
  assert.ok(!h.reads.includes("expenses") && !h.reads.includes("owner_queries"));
});

test("inactive, changed-role and signed-out sessions are rejected before private reads", async () => {
  const h = harness(); const data = h.load("src/features/shared/data.ts");
  h.tables.profiles[0].status = "inactive";
  await assert.rejects(data.getOwnerData([]), /REDIRECT \/account-disabled/);
  h.tables.profiles[0].status = "active"; h.tables.profiles[0].role = "admin";
  await assert.rejects(data.getOwnerData([]), /REDIRECT \/dashboard/);
  h.actor(null);
  await assert.rejects(data.getOwnerData([]), /REDIRECT \/login/);
  assert.ok(!h.reads.includes("properties"));
});

test("failed financial reads fail closed instead of returning successful zero figures", async () => {
  const h = harness(); h.fail((table) => table === "expenses");
  await assert.rejects(h.load("src/features/shared/data.ts").getOwnerData(["expenses"]), /could not be loaded/);
});

test("public cache reuse and property invalidation are connected through the real loaders", async () => {
  const h = harness(); const catalogue = h.load("src/features/catalogue/public-catalogue-data.ts");
  await catalogue.loadPublicCatalogue(); await catalogue.loadPublicCatalogue();
  assert.equal(h.reads.filter((table) => table === "public_property_catalogue").length, 1);
  h.tables.public_property_catalogue = [];
  h.load("src/features/shared/cache-invalidation.ts").invalidateBusinessData("properties");
  assert.equal((await catalogue.loadPublicCatalogue()).properties.length, 0);
  assert.ok(h.paths.includes("/owner/property") && h.paths.includes("/owner/bookings"));
});

test("expiry forces a fresh public read and never returns expired data after a failed read", async () => {
  const h = harness(); const catalogue = h.load("src/features/catalogue/public-catalogue-data.ts");
  await catalogue.loadPublicCatalogue(); h.advance(); h.fail((table) => table === "public_property_catalogue");
  assert.equal((await catalogue.loadPublicCatalogue()).failed, true);
  h.fail(() => false); h.tables.public_property_catalogue = [];
  assert.equal((await catalogue.loadPublicCatalogue()).properties.length, 0);
});

test("a failed gallery is retried rather than cached as a successful empty gallery", async () => {
  const h = harness(); const detail = h.load("src/features/catalogue/public-property-detail-data.ts");
  h.fail((table) => table === "public_property_gallery");
  assert.equal((await detail.loadPublicPropertyDetail("villa")).gallery.length, 0);
  h.fail(() => false);
  assert.equal((await detail.loadPublicPropertyDetail("villa")).gallery.length, 1);
});

test("delete failure never reports success; selected expense deletion invalidates financial and owner views", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.tables.expenses.push({ id: "unrelated", expense_for: "cms" });
  const action = h.load("src/features/shared/actions.ts").deleteExpenseAction;
  const form = new FormData(); form.set("id", expenseId);
  h.fail((table, operation) => table === "expenses" && operation === "delete");
  await assert.rejects(action(form), /expense_delete_failed/);
  assert.equal(h.paths.length, 0);
  h.fail(() => false);
  await assert.rejects(action(form), /expense_deleted/);
  assert.equal(h.tables.expenses.length, 1);
  assert.equal(h.tables.expenses[0].id, "unrelated");
  assert.ok(h.paths.includes("/owner/expenses") && h.paths.includes("/dashboard/pnl"));
});

test("partial settings writes invalidate dependent forms even when the action fails", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.fail((table, operation, payload) => table === "settings" && operation === "upsert" && !Array.isArray(payload) && payload?.key === "expense_categories");
  const form = new FormData(); form.set("booking_sources", "Direct");
  await assert.rejects(h.load("src/features/shared/actions.ts").saveSettingsAction(form), /settings-save-failed/);
  assert.ok(h.paths.includes("/dashboard/bookings") && h.paths.includes("/dashboard/expenses"));
});

test("a partial cover update expires public data even when selecting/restoring the cover fails", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.tables.property_images = [{ id: imageId, property_id: propertyId, is_cover: false }, { id: "old-cover", property_id: propertyId, is_cover: true }];
  h.fail((table, operation, payload) => table === "property_images" && operation === "update" && !Array.isArray(payload) && payload?.is_cover === true);
  const result = await h.load("src/features/properties/property-image-actions.ts").setPropertyImageCoverAction({ imageId, propertyId });
  assert.equal(result.ok, false);
  assert.ok(h.tags.length > 0 && h.paths.includes("/booking"));
});

test("booking create, edit and delete invalidate dependent views without duplicating an edited record", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  const actions = h.load("src/features/shared/actions.ts");
  const form = new FormData();
  for (const [key, value] of Object.entries({ property_id: propertyId, guest_name: "Test guest", check_in: "2026-10-14", check_out: "2026-10-16", nights: "2", nightly_rate: "100", total_amount: "200" })) form.set(key, value);
  await assert.rejects(actions.saveBookingAction(form), /booking_created/);
  assert.equal(h.tables.bookings.length, 2);
  h.paths.length = 0; form.set("id", imageId); form.set("total_amount", "300");
  await assert.rejects(actions.saveBookingAction(form), /booking_updated/);
  assert.equal(h.tables.bookings.length, 2);
  assert.equal(h.tables.bookings[1].total_amount, 300);
  assert.ok(h.paths.includes("/owner") && h.paths.includes("/dashboard/pnl") && h.paths.includes("/dashboard/payouts"));
  await assert.rejects(actions.deleteBookingAction(form), /booking_deleted/);
  assert.equal(h.tables.bookings.length, 1);
});

test("expense create/edit preserves CMS exclusion and invalidates owner financial views", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  const action = h.load("src/features/shared/actions.ts").saveExpenseAction;
  const form = new FormData();
  for (const [key, value] of Object.entries({ expense_for: "cms", category: "Cleaning", date: "2026-10-14", amount: "20" })) form.set(key, value);
  await assert.rejects(action(form), /expense_created/);
  assert.equal(h.tables.expenses[1].property_id, null);
  form.set("id", imageId); form.set("expense_for", "property"); form.set("property_id", propertyId);
  await assert.rejects(action(form), /expense_updated/);
  assert.equal(h.tables.expenses.length, 2);
  assert.equal(h.tables.expenses[1].property_id, propertyId);
  assert.ok(h.paths.includes("/owner/payout") && h.paths.includes("/owner/expenses"));
});

test("real expense CSV action invalidates only after successful bulk insertion", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.tables.settings = [{ key: "expense_categories", value: ["Cleaning"] }];
  const form = new FormData(); form.set("fileName", "expenses.csv");
  form.set("csv", "expense_date,expense_for,property_name,category,amount,vendor,note\n2026-10-14,cms,,Cleaning,20,,CSV test\n");
  const action = h.load("src/features/expenses/expense-import-actions.ts").importExpensesCsvAction;
  h.fail((table, operation) => table === "expenses" && operation === "insert");
  assert.equal((await action({ ok: false }, form)).ok, false);
  assert.equal(h.paths.length, 0);
  h.fail(() => false);
  const imported = await action({ ok: false }, form);
  assert.equal(imported.ok, true); assert.equal(imported.result.inserted, 1);
  assert.ok(h.paths.includes("/dashboard/pnl") && h.paths.includes("/owner/payout"));
});

test("a failed post-delete read still invalidates the expense that was actually deleted", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.fail((table, operation) => table === "expenses" && operation === "read" && h.tables.expenses.length === 0);
  const form = new FormData(); form.set("id", expenseId);
  await assert.rejects(h.load("src/features/shared/actions.ts").deleteExpenseAction(form), /expense_delete_failed/);
  assert.equal(h.tables.expenses.length, 0);
  assert.ok(h.paths.includes("/owner/expenses"));
});

test("property reassignment through the real action expires public data and removes the old owner's access", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  const form = new FormData();
  for (const [key, value] of Object.entries({ mode: "edit", id: propertyId, name: "Villa", owner_id: ownerB, owner_share: "70", cms_share: "30", status: "active" })) form.set(key, value);
  await assert.rejects(h.load("src/features/shared/actions.ts").savePropertyAction(form), /property_updated/);
  assert.ok(h.tags.includes("cms-public-properties-v1"));
  h.tables.profiles[0].role = "owner";
  const data = h.load("src/features/shared/data.ts");
  assert.equal((await data.getOwnerData(["bookings"])).bookings.length, 0);
  h.actor(ownerB);
  assert.equal((await data.getOwnerData(["bookings"])).bookings.length, 1);
});

test("property CSV invalidates public listings and both owner route trees after insertion", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.tables.profiles[1].email = "new-owner@example.test";
  const form = new FormData(); form.set("fileName", "properties.csv");
  form.set("csv", "property_name,owner_email,address,city,bedrooms,owner_share_percentage,status\nNew villa,new-owner@example.test,Goa,Varca,2,70,active\n");
  const imported = await h.load("src/features/properties/property-import-actions.ts").importPropertiesCsvAction({ ok: false }, form);
  assert.equal(imported.ok, true); assert.equal(imported.result.inserted, 1);
  assert.ok(h.tags.includes("cms-public-properties-v1") && h.paths.includes("/owner/property") && h.paths.includes("/owner/payout"));
});

test("booking CSV invalidates owner booking and dependent financial views after insertion", async () => {
  const h = harness(); h.tables.profiles[0].role = "admin";
  h.tables.settings = [{ key: "booking_sources", value: ["Direct"] }, { key: "concierge_options", value: ["No"] }];
  h.tables.bookings = [];
  const form = new FormData(); form.set("fileName", "bookings.csv");
  form.set("csv", "property_name,guest_name,guest_phone,check_in,check_out,guests,nightly_rate,total_amount,booking_source,concierge,notes\nVilla,Test guest,+919999999999,2026-10-14,2026-10-16,2,100,200,Direct,No,CSV test\n");
  const imported = await h.load("src/features/bookings/booking-import-actions.ts").importBookingsCsvAction({ ok: false }, form);
  assert.equal(imported.ok, true); assert.equal(imported.result.inserted, 1);
  assert.ok(h.paths.includes("/owner/bookings") && h.paths.includes("/dashboard/pnl") && h.paths.includes("/owner/payout"));
});
