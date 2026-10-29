import { openDB } from "idb";
import { useCallback, useEffect, useRef, useState } from "react";
import { publicAsset } from "./assetPath";

const database = openDB("our-universe-v3", 1, {
  upgrade(db) {
    db.createObjectStore("documents");
    db.createObjectStore("images");
  },
});
export const uid = () => crypto.randomUUID();
export const today = () => localDate(new Date());
export function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function dayOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDate(d);
}

export function useStore<T>(scope: string, seed: () => T) {
  const [data, setData] = useState<T>(seed);
  const latest = useRef(data);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const hydration = useRef<Promise<void>>(Promise.resolve());
  const hydrated = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    hydrated.current = false;
    hydration.current = (async () => {
      try {
        const db = await database;
        const stored = await db.get("documents", scope);
        if (cancelled) return;
        const value =
          stored?.version === 1 ? (stored.data as T) : latest.current;
        if (!stored)
          await db.put("documents", { version: 1, data: value }, scope);
        if (cancelled) return;
        latest.current = value;
        hydrated.current = true;
        setData(value);
        setReady(true);
      } catch {
        if (!cancelled) {
          setReady(true);
          setError(
            "无法读取本机存储。当前输入会保留，请检查浏览器存储权限后重试。",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
      alive.current = false;
    };
  }, [scope]);
  const change = useCallback(
    (recipe: T | ((previous: T) => T)): Promise<boolean> => {
      const operation = queue.current.then(async () => {
        await hydration.current;
        if (!hydrated.current) {
          if (alive.current)
            setError(
              "尚未读取到本机记录，暂时无法保存。输入会保留，请刷新页面后重试。",
            );
          return false;
        }
        if (alive.current) {
          setSaving(true);
          setError("");
        }
        try {
          const value =
            typeof recipe === "function"
              ? (recipe as (p: T) => T)(latest.current)
              : recipe;
          const db = await database;
          await db.put("documents", { version: 1, data: value }, scope);
          latest.current = value;
          if (alive.current) setData(value);
          return true;
        } catch {
          if (alive.current)
            setError(
              "还没有保存成功，输入仍在。请释放浏览器存储空间或稍后重试。",
            );
          return false;
        } finally {
          if (alive.current) setSaving(false);
        }
      });
      queue.current = operation;
      return operation;
    },
    [scope],
  );
  const reset = useCallback(async () => {
    const ok = await change(seed());
    if (ok) {
      try {
        const db = await database;
        const keys = await db.getAllKeys("images");
        await Promise.all(
          keys
            .filter((k) => String(k).startsWith(scope + ":"))
            .map((k) => db.delete("images", k)),
        );
        for (const k of Object.keys(localStorage))
          if (k.startsWith(`draft:${scope}:`)) localStorage.removeItem(k);
      } catch {
        /* Content reset already persisted; unused blobs may be reclaimed later. */
      }
    }
    return ok;
  }, [scope, change, seed]);
  return { data, change, ready, saving, error, reset };
}

export function useDraft<T>(key: string, initial: T) {
  const storageKey = "draft:" + key;
  const [draft, setDraftState] = useState<T>(() => {
    try {
      const value = localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : initial;
    } catch {
      return initial;
    }
  });
  const previousKey = useRef(storageKey);
  useEffect(() => {
    if (previousKey.current === storageKey) return;
    previousKey.current = storageKey;
    try {
      const value = localStorage.getItem(storageKey);
      setDraftState(value ? JSON.parse(value) : initial);
    } catch {
      setDraftState(initial);
    }
  }, [storageKey, initial]);
  const setDraft = useCallback(
    (next: T | ((value: T) => T)) => {
      setDraftState((previous) => {
        const value =
          typeof next === "function" ? (next as (v: T) => T)(previous) : next;
        try {
          localStorage.setItem(storageKey, JSON.stringify(value));
        } catch {
          /* Current form stays intact when draft cache is unavailable. */
        }
        return value;
      });
    },
    [storageKey],
  );
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);
  return [draft, setDraft, clear] as const;
}

export async function saveImage(file: File, scope: string): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type))
    throw new Error("请选择 JPG、PNG、WebP 或 GIF 图片。");
  if (file.size > 15 * 1024 * 1024) throw new Error("单张图片请小于 15 MB。");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "这张图片暂时无法读取，请换一张 JPG、PNG 或 WebP 图片再试。",
    );
  }
  const ratio = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (v) => (v ? resolve(v) : reject(new Error("图片读取失败，请重试。"))),
      "image/webp",
      0.85,
    ),
  );
  const key = `${scope}:${uid()}`;
  await (await database).put("images", blob, key);
  return "image:" + key;
}
export async function deleteImage(ref: string) {
  if (ref.startsWith("image:"))
    await (await database).delete("images", ref.slice(6));
}
/** Reclaim unused uploads only after an editor commits, considering every saved draft. */
export async function collectUnusedImages(scope: string) {
  try {
    const db = await database;
    const doc = await db.get("documents", scope);
    let references = JSON.stringify(doc || {});
    for (const k of Object.keys(localStorage))
      if (k.startsWith(`draft:${scope}:`))
        references += localStorage.getItem(k) || "";
    const keys = await db.getAllKeys("images");
    await Promise.all(
      keys
        .filter(
          (k) =>
            String(k).startsWith(scope + ":") &&
            !references.includes("image:" + String(k)),
        )
        .map((k) => db.delete("images", k)),
    );
  } catch {
    /* Cleanup never turns a successful save into an error. */
  }
}
export function useImageUrl(ref: string | undefined) {
  const [url, setUrl] = useState(ref?.startsWith("image:") ? "" : publicAsset(ref, import.meta.env.BASE_URL));
  useEffect(() => {
    let cancelled = false,
      objectUrl = "";
    if (!ref?.startsWith("image:")) {
      setUrl(publicAsset(ref, import.meta.env.BASE_URL));
      return;
    }
    setUrl("");
    database
      .then((db) => db.get("images", ref.slice(6)))
      .then((blob) => {
        if (blob && !cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ref]);
  return url;
}
