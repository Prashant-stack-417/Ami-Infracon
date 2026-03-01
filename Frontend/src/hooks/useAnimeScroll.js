import { useEffect, useRef } from "react";
import anime from "animejs";

/**
 * useAnimeScroll — Bidirectional scroll-triggered animation.
 *
 * Scrolling DOWN → element slides/fades IN from its configured direction.
 * Scrolling UP   → element slides/fades IN from the opposite direction
 *                  (and exits in the forward direction when leaving from above).
 *
 * @param {Object}  options
 * @param {string}  options.animateChildren — CSS selector for children to stagger (optional)
 * @param {number}  options.translateY      — custom start translateY offset
 * @param {number}  options.translateX      — custom start translateX offset
 * @param {number}  options.scale           — starting scale (default 1)
 * @param {number}  options.rotate          — starting rotate deg (default 0)
 * @param {number}  options.duration        — animation duration ms (default 800)
 * @param {number}  options.staggerDelay    — stagger delay between children (default 100)
 * @param {number}  options.threshold       — IntersectionObserver threshold (default 0.12)
 * @param {boolean} options.once            — animate only once (default false)
 * @param {number}  options.delay           — initial delay ms (default 0)
 * @param {string}  options.direction       — 'up'|'down'|'left'|'right' (default 'up')
 */
const useAnimeScroll = (options = {}) => {
    const ref = useRef(null);
    const scrollDirRef = useRef("down");
    const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
    const hasAnimatedIn = useRef(false);

    // Track scroll direction
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            scrollDirRef.current = y > lastScrollY.current ? "down" : "up";
            lastScrollY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const {
            animateChildren,
            translateY: customTY,
            translateX: customTX,
            scale = 1,
            rotate = 0,
            duration = 800,
            staggerDelay = 100,
            threshold = 0.12,
            once = false,
            delay = 0,
            direction = "up",
        } = options;

        // Base enter offset (scrolling DOWN → reveal from this position)
        const baseTY = customTY ?? (direction === "up" ? 60 : direction === "down" ? -60 : 0);
        const baseTX = customTX ?? (direction === "left" ? 60 : direction === "right" ? -60 : 0);

        const getTargets = () =>
            animateChildren ? el.querySelectorAll(animateChildren) : [el];

        // Set initial hidden state
        getTargets().forEach((t) => {
            t.style.opacity = "0";
            t.style.transform = `translateY(${baseTY}px) translateX(${baseTX}px) scale(${scale}) rotate(${rotate}deg)`;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const targets = getTargets();
                    const scrollingDown = scrollDirRef.current === "down";

                    if (entry.isIntersecting) {
                        if (once && hasAnimatedIn.current) return;
                        hasAnimatedIn.current = true;

                        // When scrolling UP, element enters from the opposite side
                        const fromTY = scrollingDown ? baseTY : -baseTY;
                        const fromTX = scrollingDown ? baseTX : -baseTX;

                        anime({
                            targets,
                            opacity: [0, 1],
                            translateY: [fromTY, 0],
                            translateX: [fromTX, 0],
                            scale: [scale, 1],
                            rotate: [rotate, 0],
                            duration,
                            delay: animateChildren
                                ? anime.stagger(staggerDelay, { start: delay })
                                : delay,
                            easing: "easeOutCubic",
                        });

                        if (once) observer.unobserve(el);
                    } else if (!once) {
                        // Exit: slide out in the direction it's leaving
                        const rect = entry.boundingClientRect;
                        const leavingTop = rect.bottom < 0; // scrolled past going down
                        const leavingBottom = rect.top > window.innerHeight; // below viewport

                        const exitTY = leavingTop ? -baseTY : leavingBottom ? baseTY : 0;
                        const exitTX = leavingTop ? -baseTX : leavingBottom ? baseTX : 0;

                        anime({
                            targets,
                            opacity: [1, 0],
                            translateY: [0, exitTY],
                            translateX: [0, exitTX],
                            scale: [1, scale],
                            rotate: [0, rotate],
                            duration: Math.round(duration * 0.55),
                            easing: "easeInCubic",
                        });
                        hasAnimatedIn.current = false;
                    }
                });
            },
            { threshold },
        );

        observer.observe(el);
        return () => observer.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return ref;
};

export default useAnimeScroll;
