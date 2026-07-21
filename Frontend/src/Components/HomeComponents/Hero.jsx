import { useEffect, useRef } from "react";
import anime from "animejs";
import { COMPANY_INFO } from "../../config/constants";
import useParallax from "../../hooks/useParallax";
import { Link } from "react-router-dom";

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

    // 6. Badge pop-in
    anims.push(
      anime({
        targets: ".hero-badge",
        opacity: [0, 1],
        scale: [0.7, 1],
        translateY: [10, 0],
        duration: 600,
        delay: 300,
        easing: "easeOutElastic(1, .8)",
      }),
    );

    // 7. CTA button slide up
    anims.push(
      anime({
        targets: ".hero-cta",
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        delay: 1600,
        easing: "easeOutCubic",
      }),
    );

    // 8. Stats bar slide up
    anims.push(
      anime({
        targets: ".hero-stat-item",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(120, { start: 1800 }),
        duration: 600,
        easing: "easeOutCubic",
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
          <div className="hero-blob-2 w-full h-full bg-orange-500/15 rounded-full blur-3xl" />
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

      <div ref={parallaxTextRef} className="text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="hero-badge trust-badge mb-6 opacity-0 inline-flex">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          ISO 9001 Certified · Trusted Since 2010
        </div>

        <h1 className="type-hero text-pretty overflow-hidden">
          <span className="hero-word inline-block opacity-0">
            {COMPANY_INFO.name.prefix}{" "}
          </span>
          <span className="hero-word inline-block text-gradient-primary opacity-0">
            {COMPANY_INFO.name.main}{" "}
          </span>
          <span className="hero-word inline-block text-gradient-primary opacity-0">
            {COMPANY_INFO.name.suffix}
          </span>
        </h1>
        <p
          className="hero-subtitle mt-4 type-body text-gray-700 max-w-xl mx-auto opacity-0"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          Empowering Communities Through Seamless Infrastructure Solutions.
        </p>

        {/* CTA Button */}
        <div className="hero-cta mt-8 opacity-0">
          <a
            href="#products"
            className="btn-cta"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Explore Products
          </a>
        </div>

        {/* Stats Bar */}
        <div className="mt-14 flex items-center justify-center gap-4 md:gap-8 flex-wrap">
          <div className="hero-stat-item opacity-0 glass-card p-4 rounded-2xl flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
            <span className="hero-stat-number text-gradient-primary">15+</span>
            <span className="hero-stat-label">Years Experience</span>
          </div>
          <div className="hero-stat-item opacity-0 glass-card p-4 rounded-2xl flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
            <span className="hero-stat-number text-gradient-primary">500+</span>
            <span className="hero-stat-label">Products</span>
          </div>
          <div className="hero-stat-item opacity-0 glass-card p-4 rounded-2xl flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
            <span className="hero-stat-number text-gradient-primary">200+</span>
            <span className="hero-stat-label">Projects</span>
          </div>
          <div className="hero-stat-item opacity-0 glass-card p-4 rounded-2xl flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
            <span className="hero-stat-number text-gradient-primary">50+</span>
            <span className="hero-stat-label">Cities Served</span>
          </div>
        </div>
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
