import { useRef, useEffect } from "react";

function useInterval(callback: () => void, poll?: number): void {
  const callbackRef = useRef<() => void>(() => {}); // noop

  useEffect(() => {
    if (typeof callback === "function") {
      callbackRef.current = callback;
    }
  }, [callback]);

  useEffect(() => {
    if (typeof poll !== "number" || poll < 100) return;

    const interval = setInterval(() => callbackRef.current(), poll);

    return () => clearInterval(interval);
  }, [poll]);
}

export default useInterval;

// https://github.com/Hermanya/use-interval/blob/master/src/index.tsx
