// IndexedDB durable storage for large assets (covers, AI images, multi-megabyte canvas state)
// Unlike localStorage (which has a strict 5MB domain quota), IndexedDB supports hundreds of megabytes
// without blocking the main thread or throwing QuotaExceededError.

const DB_NAME = "KDPageStudioDB";
const DB_VERSION = 1;
const STORE_NAME = "cover_drafts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCoverDraftToIndexedDB(data: any): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record = { id: "current-cover-draft", data, updatedAt: Date.now() };
      store.put(record);

      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch (e) {
    console.warn("IndexedDB save failed:", e);
    return false;
  }
}

export async function loadCoverDraftFromIndexedDB(): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get("current-cover-draft");

      request.onsuccess = () => {
        db.close();
        resolve(request.result ? request.result.data : null);
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (e) {
    console.warn("IndexedDB load failed:", e);
    return null;
  }
}
