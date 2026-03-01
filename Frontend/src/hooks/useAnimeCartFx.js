import { useRef, useCallback } from "react";
import anime from "animejs";

/**
 * useAnimeCartFx — Cart animation effects using anime.js
 */
const useAnimeCartFx = () => {
    const addAnimRef = useRef(null);

    /**
     * Spring bounce effect on the "Add to Cart" button
     */
    const playAddBounce = useCallback((buttonEl) => {
        if (!buttonEl) return;

        // Cancel any existing animation
        if (addAnimRef.current) {
            addAnimRef.current.pause();
        }

        addAnimRef.current = anime({
            targets: buttonEl,
            scale: [
                { value: 1.15, duration: 120, easing: "easeOutCubic" },
                { value: 0.95, duration: 100, easing: "easeInCubic" },
                { value: 1, duration: 300, easing: "spring(1, 80, 10, 0)" },
            ],
        });

        // Also create a ripple effect
        const rect = buttonEl.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.style.cssText = `
      position: absolute; border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      width: ${rect.width}px; height: ${rect.width}px;
      left: 50%; top: 50%;
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
    `;
        buttonEl.style.position = "relative";
        buttonEl.style.overflow = "hidden";
        buttonEl.appendChild(ripple);

        anime({
            targets: ripple,
            scale: [0, 2.5],
            opacity: [1, 0],
            duration: 600,
            easing: "easeOutCubic",
            complete: () => {
                if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            },
        });
    }, []);

    /**
     * Slide-out + shrink animation for removing a cart item
     */
    const playRemoveSlide = useCallback((rowEl) => {
        if (!rowEl) return Promise.resolve();

        return new Promise((resolve) => {
            // First: slide right and fade
            anime({
                targets: rowEl,
                translateX: [0, 80],
                opacity: [1, 0],
                scale: [1, 0.8],
                duration: 400,
                easing: "easeInCubic",
                complete: () => {
                    // Then: collapse height
                    const currentHeight = rowEl.offsetHeight;
                    rowEl.style.height = `${currentHeight}px`;
                    rowEl.style.overflow = "hidden";

                    anime({
                        targets: rowEl,
                        height: [currentHeight, 0],
                        marginTop: 0,
                        marginBottom: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        duration: 250,
                        easing: "easeOutQuad",
                        complete: resolve,
                    });
                },
            });
        });
    }, []);

    /**
     * Cart badge pop/bounce animation
     */
    const playCartBadgeBounce = useCallback((el) => {
        if (!el) return;

        anime({
            targets: el,
            scale: [
                { value: 1.6, duration: 150, easing: "easeOutCubic" },
                { value: 0.8, duration: 100, easing: "easeInCubic" },
                { value: 1, duration: 400, easing: "spring(1, 80, 10, 0)" },
            ],
            rotate: [
                { value: -15, duration: 100, easing: "easeOutCubic" },
                { value: 10, duration: 100, easing: "easeInCubic" },
                { value: 0, duration: 300, easing: "spring(1, 80, 10, 0)" },
            ],
        });
    }, []);

    return { playAddBounce, playRemoveSlide, playCartBadgeBounce };
};

export default useAnimeCartFx;
