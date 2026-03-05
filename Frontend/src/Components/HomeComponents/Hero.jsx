import { useEffect, useRef } from "react";
import anime from "animejs";
import { COMPANY_INFO } from "../../config/constants";
import useParallax from "../../hooks/useParallax";

const Hero = () => {
  const root = useRef(null);
  const parallaxSlowRef = useParallax(0.15);
  const parallaxFastRef = useParallax(0.35);
  const parallaxTextRef = useParallax(0.08);

  useEffect(() => {
    if (!root.current) return;

    const anims = [];

    // 1. Title words staggered blur-reveal with spring
    anims.push(
      anime({
        targets: ".hero-word",
        translateY: [80, 0],
        opacity: [0, 1],
        filter: ["blur(12px)", "blur(0px)"],
        rotate: [5, 0],
        scale: [0.85, 1],
        duration: 1200,
        delay: anime.stagger(180, { start: 400 }),
        easing: "easeOutElastic(1, .8)",
      }),
    );

    // 2. Subtitle text fade-in with slide
    anims.push(
      anime({
        targets: ".hero-subtitle",
        translateY: [40, 0],
        opacity: [0, 1],
        filter: ["blur(8px)", "blur(0px)"],
        duration: 1000,
        delay: 1200,
        easing: "easeOutQuart",
      }),
    );

    // 3. Decorative floating shapes (parallax blobs)
    anims.push(
      anime({
        targets: ".hero-blob-1",
        translateY: [-20, 20],
        translateX: [-10, 15],
        scale: [1, 1.15],
        duration: 6000,
        loop: true,
        direction: "alternate",
        easing: "easeInOutSine",
      }),
    );

    anims.push(
      anime({
        targets: ".hero-blob-2",
        translateY: [15, -25],
        translateX: [10, -10],
        scale: [1.1, 0.95],
        duration: 7000,
        loop: true,
        direction: "alternate",
        easing: "easeInOutSine",
      }),
    );

    anims.push(
      anime({
        targets: ".hero-blob-3",
        translateY: [10, -15],
        translateX: [-15, 20],
        rotate: [0, 360],
        duration: 20000,
        loop: true,
        easing: "linear",
      }),
    );

    // 4. Scroll indicator bounce
    anims.push(
      anime({
        targets: ".hero-scroll-indicator",
        translateY: [0, 12],
        opacity: [1, 0.3],
        duration: 1200,
        loop: true,
        direction: "alternate",
        easing: "easeInOutCubic",
        delay: 2000,
      }),
    );

    // 5. Background gradient line animation
    anims.push(
      anime({
        targets: ".hero-line",
        strokeDashoffset: [1000, 0],
        opacity: [0, 0.3],
        duration: 2500,
        delay: anime.stagger(300, { start: 600 }),
        easing: "easeOutQuart",
      }),
    );

    return () => {
      anims.forEach((a) => {
        a.pause();
      });
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Decorative animated blobs with parallax */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          ref={parallaxSlowRef}
          className="absolute -top-20 -left-20 w-72 h-72"
        >
          <div className="hero-blob-1 w-full h-full bg-primary/20 rounded-full blur-3xl" />
        </div>
        <div
          ref={parallaxFastRef}
          className="absolute bottom-20 -right-20 w-96 h-96"
        >
          <div className="hero-blob-2 w-full h-full bg-secondary/15 rounded-full blur-3xl" />
        </div>
        <div className="hero-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-primary/10 rounded-full" />
      </div>

      {/* Animated SVG lines */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full -z-5"
        viewBox="0 0 1200 800"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="hero-line"
          d="M0,400 Q300,200 600,400 T1200,400"
          stroke="rgba(227,30,36,0.15)"
          strokeWidth="1"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          fill="none"
        />
        <path
          className="hero-line"
          d="M0,500 Q400,300 800,500 T1200,350"
          stroke="rgba(128,128,128,0.1)"
          strokeWidth="1"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          fill="none"
        />
        <path
          className="hero-line"
          d="M0,300 Q200,500 600,300 T1200,450"
          stroke="rgba(227,30,36,0.08)"
          strokeWidth="1"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          fill="none"
        />
      </svg>

      <div ref={parallaxTextRef} className="text-center px-4">
        <h1 className="type-hero text-pretty overflow-hidden">
          <span className="hero-word inline-block opacity-0">
            {COMPANY_INFO.name.prefix}{" "}
          </span>
          <span className="hero-word inline-block text-primary opacity-0">
            {COMPANY_INFO.name.main}{" "}
          </span>
          <span className="hero-word inline-block text-primary opacity-0">
            {COMPANY_INFO.name.suffix}
          </span>
        </h1>
        <p
          className="hero-subtitle mt-4 type-body text-gray-700 max-w-xl mx-auto opacity-0"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          Empowering Communities Through Seamless Infrastructure Solutions.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="type-overline text-gray-500 tracking-widest">
          Scroll
        </span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
