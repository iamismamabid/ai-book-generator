// IndexedDB durable storage for large assets (covers, multi-page book outlines, AI images, canvas state)
// Unlike localStorage (which has a strict 5MB domain quota), IndexedDB supports hundreds of megabytes
// without blocking the main thread or throwing QuotaExceededError.

const DB_NAME = "KDPageStudioDB";
const DB_VERSION = 2;
const COVER_STORE = "cover_drafts";
const BOOK_STORE = "book_drafts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(COVER_STORE)) {
        db.createObjectStore(COVER_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(BOOK_STORE)) {
        db.createObjectStore(BOOK_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Cover Draft Persistence
export async function saveCoverDraftToIndexedDB(data: any): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(COVER_STORE, "readwrite");
      const store = tx.objectStore(COVER_STORE);
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
    console.warn("IndexedDB save cover failed:", e);
    return false;
  }
}

export async function loadCoverDraftFromIndexedDB(): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(COVER_STORE, "readonly");
      const store = tx.objectStore(COVER_STORE);
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
    console.warn("IndexedDB load cover failed:", e);
    return null;
  }
}

// Interior Multi-Page Book Draft Persistence
export async function saveBookDraftToIndexedDB(pages: any[]): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BOOK_STORE, "readwrite");
      const store = tx.objectStore(BOOK_STORE);
      const record = { id: "current-book-draft", pages, updatedAt: Date.now() };
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
    console.warn("IndexedDB save book failed:", e);
    return false;
  }
}

export async function loadBookDraftFromIndexedDB(): Promise<any[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BOOK_STORE, "readonly");
      const store = tx.objectStore(BOOK_STORE);
      const request = store.get("current-book-draft");

      request.onsuccess = () => {
        db.close();
        resolve(request.result ? request.result.pages : null);
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (e) {
    console.warn("IndexedDB load book failed:", e);
    return null;
  }
}
