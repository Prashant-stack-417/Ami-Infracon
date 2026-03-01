import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import anime from "animejs";

// Module-level flag — set to true when browser back/forward is used
let isGoingBack = false;
window.addEventListener("popstate", () => {
  isGoingBack = true;
});

const PageTransition = ({ children }) => {
  const location = useLocation();
  const ref = useRef(null);

  // Before paint: snap to the starting position so there's no flash
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = isGoingBack ? "translateY(-50px)" : "translateY(50px)";
  }, [location.key]);

  // After paint: animate in from the starting position
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const back = isGoingBack;
    isGoingBack = false; // reset for the next navigation

    anime({
      targets: el,
      translateY: [back ? -50 : 50, 0],
      opacity: [0, 1],
      duration: 480,
      easing: "easeOutCubic",
      complete: () => {
        // Clear the inline transform so position:fixed children are
        // positioned relative to the viewport again, not this element.
        if (el) {
          el.style.transform = "";
          el.style.opacity = "";
        }
      },
    });
  }, [location.key]);

  return <div ref={ref}>{children}</div>;
};

export default PageTransition;
