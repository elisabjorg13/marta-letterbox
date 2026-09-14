/**
 * READ-ONLY backup of Firestore `letters`.
 * Uses HTTP GET only. Never writes, updates, or deletes.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ID = "marta-letterbo";
const COLLECTION = "letters";
const PAGE_SIZE = 100;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function decodeField(value) {
  if (value == null) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decodeField);
  if ("mapValue" in value) {
    const out = {};
    for (const [k, v] of Object.entries(value.mapValue.fields ?? {})) {
      out[k] = decodeField(v);
    }
    return out;
  }
  return value;
}

function decodeDocument(doc) {
  const id = doc.name.split("/").pop();
  const fields = {};
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    fields[k] = decodeField(v);
  }
  return {
    id,
    ...fields,
    _firestore: {
      name: doc.name,
      createTime: doc.createTime ?? null,
      updateTime: doc.updateTime ?? null,
    },
  };
}

async function fetchPage(pageToken) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`
  );
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Read failed (${res.status}): ${body}`);
  }
  return res.json();
}

async function fetchAllLetters() {
  const letters = [];
  let pageToken;
  do {
    const page = await fetchPage(pageToken);
    for (const doc of page.documents ?? []) {
      letters.push(decodeDocument(doc));
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  return letters;
}

const letters = await fetchAllLetters();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = join(ROOT, "backups");
await mkdir(dir, { recursive: true });

const backup = {
  source: "firestore-rest-get-only",
  projectId: PROJECT_ID,
  collection: COLLECTION,
  exportedAt: new Date().toISOString(),
  totalLetters: letters.length,
  letters,
};

const jsonPath = join(dir, `marta-letterbox-backup-${stamp}.json`);
await writeFile(jsonPath, JSON.stringify(backup, null, 2), "utf8");

const latestPath = join(dir, "marta-letterbox-backup-latest.json");
await writeFile(latestPath, JSON.stringify(backup, null, 2), "utf8");

console.log(`Saved ${letters.length} letters`);
console.log(jsonPath);
console.log(latestPath);
for (const letter of letters) {
  const preview = (letter.title || "(untitled)").slice(0, 80);
  const hasText = Boolean(letter.textContent);
  const hasImage = Boolean(letter.imageUrl);
  console.log(`- ${letter.id} | ${preview} | text=${hasText} image=${hasImage}`);
}
