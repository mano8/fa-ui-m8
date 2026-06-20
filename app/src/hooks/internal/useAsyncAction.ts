// src/hooks/internal/useAsyncAction.ts
import { useState, useCallback } from "react";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred.";
}

export function useAsyncAction<T, Args extends unknown[]>(
  actionFn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(
    async (...args: Args): Promise<T> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await actionFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        setState({ data: null, loading: false, error: errorMessage(err) });
        throw err;
      }
    },
    [actionFn]
  );

  const clear = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, run, clear };
}
