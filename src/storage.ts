import type { InventoryState } from "./types";
import { DEFAULT_STATE } from "./constants";

const DB_NAME = "house_inventory_db";
const DB_VERSION = 1;
const STORE_NAME = "inventory_state";
const STATE_KEY = "state";
const LS_KEY = "house_inventory_state";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIndexedDB(): Promise<InventoryState | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STATE_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function saveToIndexedDB(state: InventoryState): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(state, STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore, fallback handles it
  }
}

function loadFromLocalStorage(): InventoryState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToLocalStorage(state: InventoryState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export async function loadState(): Promise<InventoryState> {
  const fromIdb = await loadFromIndexedDB();
  if (fromIdb) {
    saveToLocalStorage(fromIdb);
    return fromIdb;
  }
  const fromLs = loadFromLocalStorage();
  if (fromLs) return fromLs;
  return DEFAULT_STATE;
}

export async function saveState(state: InventoryState): Promise<void> {
  saveToLocalStorage(state);
  await saveToIndexedDB(state);
}

export async function clearState(): Promise<void> {
  saveToLocalStorage(DEFAULT_STATE);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}
