import { useEffect, useRef } from "react";

function useInterval(callback, poll) {
  const callbackRef = useRef(() => {}); // noop

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (typeof poll !== "number") return;
    const interval = setInterval(() => callbackRef.current(), poll);
    return () => {
      clearInterval(interval);
    };
  }, [poll]);
}

export default useInterval;

// https://github.com/Hermanya/use-interval/blob/master/src/index.tsx
