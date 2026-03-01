import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollProgressBar = () => {
  const barRef = useRef(null);
  const rafRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Reset on route change
    bar.style.width = "0%";
    bar.style.opacity = "1";

    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = `${pct}%`;
      // Fade out when fully scrolled
      bar.style.opacity = pct >= 99.5 ? "0" : "1";
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [location.key]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-0.75 z-9999 bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full bg-linear-to-r from-primary via-red-400 to-primary transition-opacity duration-300"
        style={{ width: "0%", boxShadow: "0 0 8px rgba(227,30,36,0.6)" }}
      />
    </div>
  );
};

export default ScrollProgressBar;
