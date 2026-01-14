import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export const useCountUp = (value: number, durationMs = 450) => {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      previousValueRef.current = value;
      return;
    }

    let frame = 0;
    const start = performance.now();
    const startValue = previousValueRef.current;
    const delta = value - startValue;
    previousValueRef.current = value;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplayValue(startValue + delta * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reduceMotion]);

  return displayValue;
};
