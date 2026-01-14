import { motion } from "motion/react";
import { useMotionPreference } from "../utils/animation";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

const MotionButton = ({
  children,
  type = "button",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  const { shouldReduceMotion } = useMotionPreference();

  return (
    <motion.button
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
      type={type}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MotionButton;
