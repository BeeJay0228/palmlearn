"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

export type AdminDataRecord = Record<string, unknown>;

interface UseAdminDataReturn {
  data: AdminDataRecord | null;
  loading: boolean;
  save: (updates: Partial<AdminDataRecord>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAdminData(): UseAdminDataReturn {
  const [data, setData] = useState<AdminDataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const pendingRef = useRef<Partial<AdminDataRecord>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const json: AdminDataRecord = await res.json();
        setData(json);
      } else {
        setData({});
      }
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const save = useCallback(
    async (updates: Partial<AdminDataRecord>) => {
      Object.assign(pendingRef.current, updates);

      if (timerRef.current) clearTimeout(timerRef.current);

      return new Promise<void>((resolve) => {
        timerRef.current = setTimeout(async () => {
          const toSave = { ...pendingRef.current };
          pendingRef.current = {};

          setData((prev) => (prev ? { ...prev, ...toSave } : prev));

          try {
            await fetch("/api/admin/data", {
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
