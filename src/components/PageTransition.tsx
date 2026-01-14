import type { PropsWithChildren } from "react";
import { motion } from "motion/react";
import { useMotionPreference } from "../utils/animation";

const PageTransition = ({ children }: PropsWithChildren) => {
  const { shouldReduceMotion, baseTransition } = useMotionPreference();
  const offset = shouldReduceMotion ? 0 : 10;

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -offset }}
      transition={baseTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
