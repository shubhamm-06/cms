/**
 * Room detection for gallery photos, from the `alt_text` the gallery already
 * stores. Pure functions with no imports, so the admin form, the public photo
 * tour and the unit tests share one implementation.
 *
 * How a photo's room is decided, in order:
 *
 * 1. An explicit prefix, `Room name | description` (for example
 *    `Bedroom 2 | Bed with ceiling fan and balcony`). The part before the first
 *    pipe is the room; the rest is the description. The room name is normalised
 *    (trimmed, spaces collapsed, sentence case, number words as digits) so
 *    "bedroom 2 " and "Bedroom 2" are the same section.
 * 2. Keyword inference from the whole text, with a room number when the text
 *    gives one ("Bedroom 2", "2nd bathroom", "Bedroom two"). With no number the
 *    plain room name is used ("Bedroom").
 * 3. Nothing recognisable (empty, generic or unmatched text) returns no room, and
 *    the photo lands in the final "Additional photos" section.
 */

export const ADDITIONAL_PHOTOS_LABEL = "Additional photos";

/** A prefix longer than this is a sentence that happens to contain a pipe. */
const MAX_PREFIX_LENGTH = 40;

type RoomRule = {
  keywords: string[];
  /** Room nouns that can carry a number ("Bedroom 2"); only these are numbered. */
  numberedBy?: string[];
  room: string;
};

/**
 * Keyword map in PRIORITY ORDER, most specific first. When several rooms match
 * one text, the earliest rule wins, never the earliest word. So
 * "Bedroom with attached bathroom" is a Bathroom, because Bathroom is listed
 * before Bedroom, and "Kitchen with pool view" is a Kitchen, not a Pool.
 */
const ROOM_RULES: RoomRule[] = [
  { room: "WC", keywords: ["wc", "toilet", "powder room"] },
  { room: "Bathroom", keywords: ["bathroom", "washroom", "shower"], numberedBy: ["bathroom", "washroom"] },
  { room: "Kitchen", keywords: ["kitchen", "microwave", "fridge"] },
  { room: "Pool", keywords: ["pool", "swimming"] },
  { room: "Dining area", keywords: ["dining"] },
  { room: "Work area", keywords: ["study", "work", "desk"] },
  { room: "Balcony", keywords: ["balcony", "sit-out", "sitout", "terrace"] },
  { room: "Bedroom", keywords: ["bedroom", "bed", "master", "suite"], numberedBy: ["bedroom"] },
  { room: "Living room", keywords: ["living", "hall", "lounge", "sofa"] },
  { room: "Exterior", keywords: ["villa", "exterior", "facade", "front", "garden", "entrance", "outside"] },
  { room: "Common area", keywords: ["community", "clubhouse", "gate", "parking"] },
];

/** Rooms offered in the admin picker, in a sensible tour order. */
export const ROOM_SUGGESTIONS = [
  "Exterior",
  "Living room",
  "Dining area",
  "Kitchen",
  "Bedroom 1",
  "Bedroom 2",
  "Bedroom 3",
  "Bedroom 4",
  "Bathroom 1",
  "Bathroom 2",
  "Bathroom 3",
  "WC",
  "Balcony",
  "Pool",
  "Work area",
  "Common area",
] as const;

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const ordinalWords: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

const upperCaseWords = new Set(["wc", "tv", "ac"]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word match that also accepts a plural ("beds", "balconies"). */
function keywordPattern(keyword: string) {
  const escaped = escapeRegExp(keyword);
  const plural = keyword.endsWith("y") ? `${escapeRegExp(keyword.slice(0, -1))}(?:y|ies)` : `${escaped}(?:s|es)?`;
  return `(?<![a-z0-9])${plural}(?![a-z0-9])`;
}

const rulePatterns = ROOM_RULES.map((rule) => ({
  rule,
  pattern: new RegExp(rule.keywords.map(keywordPattern).join("|"), "i"),
}));

const numberToken = `(\\d{1,2}|${Object.keys(numberWords).join("|")})`;
const ordinalToken = `(\\d{1,2}(?:st|nd|rd|th)|${Object.keys(ordinalWords).join("|")})`;

function toNumber(token: string) {
  const lower = token.toLowerCase();
  const value = numberWords[lower] ?? ordinalWords[lower] ?? Number.parseInt(lower, 10);
  return Number.isInteger(value) && value >= 1 && value <= 20 ? value : null;
}

/** "Bedroom 2", "bedroom #2", "Bedroom two" or "2nd bedroom" give 2. */
function readRoomNumber(text: string, nouns: string[]) {
  const noun = `(?:${nouns.map(keywordPattern).join("|")})`;
  const after = new RegExp(`${noun}\\s*[-#:.]?\\s*(?:no\\.?\\s*)?${numberToken}(?![a-z0-9])`, "i").exec(text);
  if (after) return toNumber(after[after.length - 1]);

  const before = new RegExp(`(?<![a-z0-9])${ordinalToken}\\s+${noun}`, "i").exec(text);
  return before ? toNumber(before[1]) : null;
}

/** Generic text names no room: "Image", "Photo 3", "Villa photo 2", "IMG_0042.jpg". */
function isGenericAlt(text: string) {
  return (
    /\.(?:jpe?g|png|webp|heic)$/i.test(text) ||
    /^(?:\S+\s+){0,3}(?:photo|image|picture|pic|img)[\s_-]*\d*$/i.test(text) ||
    /^(?:img|dsc|dscn|pxl)[\s_-]*\d+$/i.test(text)
  );
}

/** Trims, collapses spaces, writes a trailing number word as a digit and uses sentence case. */
export function normaliseRoomName(raw: string) {
  const words = raw.replace(/\s+/g, " ").trim().toLowerCase().split(" ").filter(Boolean);
  if (words.length === 0) return "";

  const last = words[words.length - 1];
  if (words.length > 1 && numberWords[last]) words[words.length - 1] = String(numberWords[last]);

  const name = words.map((word) => (upperCaseWords.has(word) ? word.toUpperCase() : word)).join(" ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Case-insensitive identity of a room, so spelling variants share one section. */
export function roomKey(room: string) {
  return normaliseRoomName(room).toLowerCase();
}

/** Infers a canonical room from keywords, or null when nothing matches. */
export function inferRoom(altText: string | null | undefined): string | null {
  const text = altText?.trim();
  if (!text || isGenericAlt(text)) return null;

  for (const { pattern, rule } of rulePatterns) {
    if (!pattern.test(text)) continue;

    const number = rule.numberedBy ? readRoomNumber(text, rule.numberedBy) : null;
    return number ? `${rule.room} ${number}` : rule.room;
  }

  return null;
}

export type PhotoRoomInfo = {
  /** Text for the caption and the image alt, without any room prefix. Null when generic or empty. */
  description: string | null;
  /** Display name of the room, or null for "Additional photos". */
  room: string | null;
  /** Grouping identity of the room (lowercase), or null. */
  roomKey: string | null;
  source: "inferred" | "prefix" | null;
};

/** Splits `Room | description`. Returns null when the text has no usable prefix. */
export function splitRoomPrefix(altText: string | null | undefined) {
  const text = altText?.trim() ?? "";
  const pipe = text.indexOf("|");
  if (pipe <= 0) return null;

  const room = normaliseRoomName(text.slice(0, pipe));
  if (!room || room.length > MAX_PREFIX_LENGTH) return null;

  return { description: text.slice(pipe + 1).trim(), room };
}

export function parsePhotoRoom(altText: string | null | undefined): PhotoRoomInfo {
  const text = altText?.trim() ?? "";
  if (!text) return { description: null, room: null, roomKey: null, source: null };

  const prefixed = splitRoomPrefix(text);
  if (prefixed) {
    return {
      description: prefixed.description || null,
      room: prefixed.room,
      roomKey: roomKey(prefixed.room),
      source: "prefix",
    };
  }

  const room = inferRoom(text);
  return {
    description: isGenericAlt(text) ? null : text,
    room,
    roomKey: room ? roomKey(room) : null,
    source: room ? "inferred" : null,
  };
}

/**
 * Writes (or replaces) the `Room | ` prefix on an alt text, keeping the
 * description. An empty room removes the prefix.
 */
export function applyRoomPrefix(altText: string | null | undefined, room: string) {
  const text = altText?.trim() ?? "";
  const description = (splitRoomPrefix(text)?.description ?? text).trim();
  const name = normaliseRoomName(room);

  if (!name) return description;
  return description ? `${name} | ${description}` : `${name} |`;
}

type AdminOrdered = { created_at: string; sort_order: number };

/**
 * The admin photo order: `sort_order`, then creation time. The cover flag is
 * deliberately ignored, so the tour's room order is exactly the order set in the
 * admin gallery. (The page's top grid may still put the cover first.)
 */
export function orderByAdminOrder<T extends AdminOrdered>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
}

export type RoomGroup<T> = {
  items: T[];
  /** Room identity, or null for the "Additional photos" group. */
  key: string | null;
  /** Display name, or null for "Additional photos". */
  room: string | null;
};

/**
 * Groups photos into the tour's room sections. Photos are first put in admin
 * order; each room's position is then that of its earliest photo, photos keep
 * admin order inside a room, and photos with no room go to a final group.
 *
 * Returns null when fewer than two named rooms are detected: the tour then shows
 * one plain grid (still in admin order) instead of room sections.
 */
export function groupByRoom<T extends AdminOrdered & { alt_text: string | null }>(items: T[]): RoomGroup<T>[] | null {
  const rooms = new Map<string, RoomGroup<T>>();
  const additional: T[] = [];

  for (const item of orderByAdminOrder(items)) {
    const { room, roomKey: key } = parsePhotoRoom(item.alt_text);
    if (!room || !key) {
      additional.push(item);
      continue;
    }
    const group = rooms.get(key) ?? { items: [], key, room };
    group.items.push(item);
    rooms.set(key, group);
  }

  if (rooms.size < 2) return null;

  const groups = [...rooms.values()];
  if (additional.length > 0) groups.push({ items: additional, key: null, room: null });
  return groups;
}

/** Section labels in tour order, for a read-only preview in the admin. Empty when no grouping applies. */
export function tourRoomOrder<T extends AdminOrdered & { alt_text: string | null }>(items: T[]): string[] {
  return (groupByRoom(items) ?? []).map((group) => group.room ?? ADDITIONAL_PHOTOS_LABEL);
}
