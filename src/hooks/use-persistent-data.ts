"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PersistentDataRecord = Record<string, unknown>;

interface UsePersistentDataReturn {
  data: PersistentDataRecord | null;
  loading: boolean;
  save: (updates: Partial<PersistentDataRecord>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePersistentData(apiPath: string): UsePersistentDataReturn {
  const [data, setData] = useState<PersistentDataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef<Partial<PersistentDataRecord>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(apiPath);

  useEffect(() => {
    pathRef.current = apiPath;
  }, [apiPath]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(pathRef.current);
      if (res.ok) {
        const json: PersistentDataRecord = await res.json();
        setData(json);
      } else {
        setData({});
      }
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const save = useCallback(
    async (updates: Partial<PersistentDataRecord>) => {
      Object.assign(pendingRef.current, updates);

      if (timerRef.current) clearTimeout(timerRef.current);

      return new Promise<void>((resolve) => {
        timerRef.current = setTimeout(async () => {
          const toSave = { ...pendingRef.current };
          pendingRef.current = {};

          setData((prev) => (prev ? { ...prev, ...toSave } : prev));

          try {
            await fetch(pathRef.current, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toSave),
            });
          } catch {
            loadData();
          }
          resolve();
        }, 300);
      });
    },
    [loadData]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { data, loading, save, refresh: loadData };
}
