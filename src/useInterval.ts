import { useRef, useEffect } from "react";

/**
 * Sets up a polling interval that calls a callback on a given delay.
 * The callback ref is kept up to date so stale closures are avoided.
 * No interval is created if `poll` is not a valid integer.
 * @see https://github.com/Hermanya/use-interval/blob/master/src/index.tsx
 * @example
 * useInterval(() => fetchData(), 5000) // calls fetchData every 5 seconds
 * useInterval(() => fetchData())       // no interval created
 */
function useInterval(callback: () => void, poll?: number): void {
  const callbackRef = useRef<() => void>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!Number.isInteger(poll)) return;

    const id = setInterval(() => callbackRef.current(), poll);

    return () => clearInterval(id);
  }, [poll]);
}

export default useInterval;
