import { useReducedMotion } from "motion/react";

export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export const getMotionTransition = (reduced: boolean, duration = 0.2) => ({
  duration: reduced ? 0.01 : duration,
  ease: MOTION_EASE
});

export const useMotionPreference = () => {
  const shouldReduceMotion = useReducedMotion();
  return {
    shouldReduceMotion,
    fastTransition: getMotionTransition(shouldReduceMotion, 0.18),
    baseTransition: getMotionTransition(shouldReduceMotion, 0.2),
    slowTransition: getMotionTransition(shouldReduceMotion, 0.35)
  };
};
