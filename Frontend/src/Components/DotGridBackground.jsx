import { useEffect, useRef } from "react";
import anime from "animejs";

/**
 * Animated dot-grid background inspired by animejs.com
 * - Fixed behind all content (z-index: -1)
 * - Grid of small dots that pulse outward from center in staggered waves
 * - Brand-red color at very low opacity — subtle, non-distracting
 */

const CELL_SIZE = 56; // px spacing between dots

export default function DotGridBackground() {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const cols = Math.ceil(window.innerWidth / CELL_SIZE) + 2;
    const rows = Math.ceil(window.innerHeight / CELL_SIZE) + 2;
    const total = cols * rows;

    // Build dot elements
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.style.cssText = [
        "display:block",
        "width:3px",
        "height:3px",
        "border-radius:50%",
        "background:#E31E24",
        "justify-self:center",
        "align-self:center",
        "will-change:transform,opacity",
        "transform:scale(0)",
        "opacity:0",
      ].join(";");
      fragment.appendChild(dot);
    }
    el.appendChild(fragment);

    // Apply grid dimensions
    el.style.gridTemplateColumns = `repeat(${cols}, ${CELL_SIZE}px)`;
    el.style.gridTemplateRows = `repeat(${rows}, ${CELL_SIZE}px)`;

    const dots = Array.from(el.children);

    // Wave pulse from center — loop infinitely
    animRef.current = anime({
      targets: dots,
      scale: [
        { value: 0, duration: 0 },
        { value: 1.1, duration: 600, easing: "easeOutCubic" },
        { value: 0, duration: 900, easing: "easeInCubic" },
      ],
      opacity: [
        { value: 0, duration: 0 },
        { value: 0.25, duration: 600, easing: "easeOutCubic" },
        { value: 0, duration: 900, easing: "easeInCubic" },
      ],
      delay: anime.stagger(55, { grid: [cols, rows], from: "center" }),
      duration: 1500,
      loop: true,
      loopDelay: 800,
    });

    return () => {
      if (animRef.current) animRef.current.pause();
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden",
        userSelect: "none",
      }}
    />
  );
}
