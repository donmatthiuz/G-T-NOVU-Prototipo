"use client";

import { novuOverview } from "@/data/novu";
import { novuApi } from "@/lib/api";
import type { NovuOverview } from "@/types/novu";
import { useCallback, useEffect, useState } from "react";

export interface UseNovuDataResult {
  data: NovuOverview;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useNovuData(): UseNovuDataResult {
  const [data, setData] = useState<NovuOverview>(novuOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await novuApi.getOverview();
      setData(response.data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar los datos de NOVU.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    novuApi
      .getOverview()
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los datos de NOVU.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error, reload };
}
