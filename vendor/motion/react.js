import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

const MotionConfigContext = createContext({
  reducedMotion: "user"
});

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mediaQuery.matches);
    handler();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  return reduced;
};

export const MotionConfig = ({ reducedMotion = "user", children }) =>
  React.createElement(
    MotionConfigContext.Provider,
    { value: { reducedMotion } },
    children
  );

export const useReducedMotion = () => {
  const { reducedMotion } = useContext(MotionConfigContext);
  const prefersReduced = usePrefersReducedMotion();
  if (reducedMotion === "always") return true;
  if (reducedMotion === "never") return false;
  return prefersReduced;
};

const withTransition = (style, transition, shouldReduceMotion) => {
  if (!transition) return style;
  if (shouldReduceMotion) {
    return {
      ...style,
      transitionDuration: "0.01ms"
    };
  }
  const duration = transition.duration ?? 0.2;
  const ease = transition.ease
    ? `cubic-bezier(${transition.ease.join(",")})`
    : "ease";
  return {
    ...style,
    transitionProperty: "transform, opacity, stroke-dashoffset",
    transitionTimingFunction: ease,
    transitionDuration: `${duration}s`
  };
};

const mergeTransforms = (base, transform) => {
  if (!transform) return base;
  return base ? `${base} ${transform}` : transform;
};

const resolveTransform = (style, anim) => {
  const transforms = [];
  if (typeof anim.x === "number") transforms.push(`translateX(${anim.x}px)`);
  if (typeof anim.y === "number") transforms.push(`translateY(${anim.y}px)`);
  if (typeof anim.scale === "number") transforms.push(`scale(${anim.scale})`);
  const combined = transforms.join(" ");
  return {
    ...style,
    transform: mergeTransforms(style.transform, combined)
  };
};

const resolveAnimatedStyle = (style, anim) => {
  if (!anim) return style;
  const next = { ...style };
  if (anim.opacity !== undefined) next.opacity = anim.opacity;
  if (anim.strokeDashoffset !== undefined) {
    next.strokeDashoffset = anim.strokeDashoffset;
  }
  return resolveTransform(next, anim);
};

const MotionElement = React.forwardRef(
  (
    {
      as: Tag,
      initial,
      animate,
      exit,
      transition,
      whileTap,
      layout,
      onExitComplete,
      isPresent = true,
      style,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const [renderStyle, setRenderStyle] = useState(() =>
      resolveAnimatedStyle(style ?? {}, initial)
    );
    const tapStyleRef = useRef(null);

    useLayoutEffect(() => {
      const baseStyle = resolveAnimatedStyle(style ?? {}, initial);
      setRenderStyle(withTransition(baseStyle, transition, shouldReduceMotion));
      const frame = requestAnimationFrame(() => {
        setRenderStyle((prev) =>
          withTransition(resolveAnimatedStyle({ ...prev }, animate), transition, shouldReduceMotion)
        );
      });
      return () => cancelAnimationFrame(frame);
    }, [animate, initial, transition, shouldReduceMotion, style]);

    useEffect(() => {
      if (isPresent) return;
      const nextStyle = withTransition(
        resolveAnimatedStyle(style ?? {}, exit),
        transition,
        shouldReduceMotion
      );
      setRenderStyle(nextStyle);
      const duration = shouldReduceMotion ? 0 : (transition?.duration ?? 0.2) * 1000;
      const timer = window.setTimeout(() => onExitComplete?.(), duration);
      return () => window.clearTimeout(timer);
    }, [isPresent, exit, transition, shouldReduceMotion, onExitComplete, style]);

    const handlePointerDown = (event) => {
      if (whileTap) {
        tapStyleRef.current = renderStyle;
        setRenderStyle((prev) => resolveAnimatedStyle({ ...prev }, whileTap));
      }
      onPointerDown?.(event);
    };

    const handlePointerUp = (event) => {
      if (tapStyleRef.current) {
        setRenderStyle(tapStyleRef.current);
        tapStyleRef.current = null;
      }
      onPointerUp?.(event);
    };

    const handlePointerCancel = (event) => {
      if (tapStyleRef.current) {
        setRenderStyle(tapStyleRef.current);
        tapStyleRef.current = null;
      }
      onPointerCancel?.(event);
    };

    return React.createElement(Tag, {
      ref,
      style: renderStyle,
      "data-layout": layout ? "true" : undefined,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      ...props
    });
  }
);

const createMotionComponent = (Tag) =>
  React.forwardRef((props, ref) =>
    React.createElement(MotionElement, { ...props, as: Tag, ref })
  );

export const motion = new Proxy(
  {},
  {
    get: (_, tag) => createMotionComponent(tag)
  }
);

export const AnimatePresence = ({ children, initial = true }) => {
  const [items, setItems] = useState(() => React.Children.toArray(children));

  useEffect(() => {
    const next = React.Children.toArray(children);
    setItems((prev) => {
      const nextKeys = new Set(next.map((child) => child.key));
      const exiting = prev.filter((child) => !nextKeys.has(child.key));
      return [...next, ...exiting];
    });
  }, [children]);

  const handleExitComplete = useCallback(
    (key) => {
      setItems((prev) => prev.filter((child) => child.key !== key));
    },
    [setItems]
  );

  return React.createElement(
    React.Fragment,
    null,
    items.map((child) => {
      if (!React.isValidElement(child)) return child;
      const isPresent = React.Children.toArray(children).some(
        (current) => React.isValidElement(current) && current.key === child.key
      );
      return React.cloneElement(child, {
        isPresent,
        initial: initial ? child.props.initial : undefined,
        onExitComplete: () => handleExitComplete(child.key)
      });
    })
  );
};
