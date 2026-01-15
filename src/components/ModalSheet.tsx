import { useEffect, useMemo, useRef } from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "../utils/animation";
import "../styles/modalSheet.css";

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  contentClassName?: string;
  returnFocusEl?: HTMLElement | null;
  closeOnBackdrop?: boolean;
}

const ModalSheet = ({
  open,
  onClose,
  children,
  ariaLabel,
  ariaLabelledBy,
  contentClassName,
  returnFocusEl,
  closeOnBackdrop = true
}: ModalSheetProps) => {
  const { shouldReduceMotion, baseTransition } = useMotionPreference();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousOverflow = useRef<string | null>(null);
  const wasOpen = useRef(open);

  const handleBackdropClose = (
    event: MouseEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>
  ) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) return;
    const { body } = document;
    previousOverflow.current = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      if (previousOverflow.current !== null) {
        body.style.overflow = previousOverflow.current;
      }
    };
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open && returnFocusEl) {
      returnFocusEl.focus();
    }
    wasOpen.current = open;
  }, [open, returnFocusEl]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const offset = shouldReduceMotion ? 0 : 22;
  const contentClassNames = useMemo(
    () => ["modal-sheet__content", contentClassName].filter(Boolean).join(" "),
    [contentClassName]
  );

  const portalRoot = typeof document === "undefined" ? null : document.body;
  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-sheet__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={baseTransition}
          onClick={handleBackdropClose}
          onPointerDown={handleBackdropClose}
        >
          <motion.div
            className="modal-sheet__container"
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offset }}
            transition={baseTransition}
          >
            <div
              className={contentClassNames}
              ref={contentRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
};

export default ModalSheet;
