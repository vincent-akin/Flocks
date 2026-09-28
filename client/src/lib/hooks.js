'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './api';

/**
 * Standard data-fetching hook used across every dashboard page so
 * loading / empty / success / error / permission-denied states behave
 * consistently everywhere (per the app's data-states convention).
 *
 * `fetcher` should be a stable callback (wrap in useCallback at the call
 * site, or pass a dependency array) that returns the backend's response
 * shape ({ data, pagination? }). Re-runs whenever `deps` changes.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | success | error | forbidden
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetcherRef.current();
      setData(res?.data ?? null);
      setPagination(res?.pagination ?? null);
      setStatus('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setStatus('forbidden');
      } else {
        setStatus('error');
      }
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, pagination, status, error, reload: load, setData };
}

/** Simple debounce for search inputs so we don't fire a request per keystroke. */
export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
