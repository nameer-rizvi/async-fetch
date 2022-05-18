import { useEffect, useRef } from "react";

function useInterval(callback, poll) {
  const callbackRef = useRef(() => {}); // noop

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!poll) return;
    const onTick = () => callbackRef.current();
    const interval = setInterval(onTick, poll);
    return () => {
      clearInterval(interval);
    };
  }, [poll]);
}

export default useInterval;

// https://github.com/Hermanya/use-interval/blob/master/src/index.tsx
