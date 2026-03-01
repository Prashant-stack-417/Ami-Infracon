import { useEffect, useRef } from "react";

/**
 * useParallax — real-time scroll-driven parallax via requestAnimationFrame.
 *
 * @param {number} speed  — parallax intensity (default 0.25). Positive = slower than scroll (moves up),
 *                          negative = faster than scroll (moves down).
 * @param {string} axis   — 'y' | 'x'  (default 'y')
 */
const useParallax = (speed = 0.25, axis = "y") => {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const lastVal = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
      const viewH = window.innerHeight;
      // how far the parent has scrolled past the viewport centre
      const relativeY = rect.top + rect.height / 2 - viewH / 2;
      const val = relativeY * speed;

      if (Math.abs(val - lastVal.current) > 0.2) {
        lastVal.current = val;
        if (axis === "y") {
          el.style.transform = `translateY(${val}px)`;
        } else {
          el.style.transform = `translateX(${val}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, axis]);

  return ref;
};

export default useParallax;
