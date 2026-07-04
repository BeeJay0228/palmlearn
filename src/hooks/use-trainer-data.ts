"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

export type TrainerDataRecord = Record<string, unknown>;

interface UseTrainerDataReturn {
  data: TrainerDataRecord | null;
  loading: boolean;
  save: (updates: Partial<TrainerDataRecord>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTrainerData(): UseTrainerDataReturn {
  const [data, setData] = useState<TrainerDataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const pendingRef = useRef<Partial<TrainerDataRecord>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/data");
      if (res.ok) {
        const json: TrainerDataRecord = await res.json();
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
    async (updates: Partial<TrainerDataRecord>) => {
      Object.assign(pendingRef.current, updates);

      if (timerRef.current) clearTimeout(timerRef.current);

      return new Promise<void>((resolve) => {
        timerRef.current = setTimeout(async () => {
          const toSave = { ...pendingRef.current };
          pendingRef.current = {};

          setData((prev) => (prev ? { ...prev, ...toSave } : prev));

          try {
            await fetch("/api/trainer/data", {
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
