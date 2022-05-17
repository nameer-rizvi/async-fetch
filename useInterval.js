import { useEffect, useRef } from "react";

function useInterval(callback, poll) {
  const savedCallback = useRef(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!poll) return;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, poll);
    return () => {
      clearInterval(id);
    };
  }, [poll]);
}

export default useInterval;

// https://github.com/Hermanya/use-interval/blob/master/src/index.tsx
