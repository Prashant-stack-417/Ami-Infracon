import useAnimeScroll from "../hooks/useAnimeScroll";
import { useEffect, useRef } from "react";
import anime from "animejs";

const About = () => {
  const heroRef = useAnimeScroll({ direction: "up", duration: 700 });
  const titleRef = useAnimeScroll({ direction: "up", duration: 600, delay: 100 });
  const gridRef = useAnimeScroll({ animateChildren: ".about-grid-item", staggerDelay: 150, duration: 600, direction: "up" });
  const statsRef = useAnimeScroll({ animateChildren: ".about-stat", staggerDelay: 120, duration: 600, direction: "up" });

  return (
    <div className="max-w-7xl mx-auto mt-24 mb-8 px-4">
      <div ref={heroRef} className="bg-white rounded-2xl shadow-lg p-6 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <span className="type-overline text-primary">Who We Are</span>
          </div>
          <h1 ref={titleRef} className="type-page-title mb-phi">About Ami Infracon LLP</h1>
        </div>

        <p className="type-body leading-relaxed mb-phi">
          Ami Infracon LLP is a leading provider of construction chemicals and
          infrastructure solutions in India. With a commitment to quality and
          innovation, we deliver reliable products that enhance the durability
          and performance of construction projects across various sectors.
        </p>
        <p className="type-body leading-relaxed mb-phi">
          Our comprehensive range of construction chemicals includes
          waterproofing solutions, concrete admixtures, repair mortars,
          protective coatings, and specialty products designed to meet the
          evolving needs of modern construction.
        </p>
        <p className="type-body leading-relaxed mb-phi-xl">
          We combine technical expertise, stringent quality control, and
          customer-focused service to ensure every product meets the highest
          standards. From residential buildings to large infrastructure
          projects, we are committed to building a stronger, more sustainable
          future.
        </p>

        {/* Stats Row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-phi-xl p-6 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div className="about-stat text-center">
            <p className="text-3xl font-bold text-primary font-heading mb-1">15+</p>
            <p className="type-overline text-gray-500">Years Experience</p>
          </div>
          <div className="about-stat text-center">
            <p className="text-3xl font-bold text-primary font-heading mb-1">500+</p>
            <p className="type-overline text-gray-500">Products</p>
          </div>
          <div className="about-stat text-center">
            <p className="text-3xl font-bold text-primary font-heading mb-1">200+</p>
            <p className="type-overline text-gray-500">Projects</p>
          </div>
          <div className="about-stat text-center">
            <p className="text-3xl font-bold text-primary font-heading mb-1">50+</p>
            <p className="type-overline text-gray-500">Cities</p>
          </div>
        </div>

        {/* Values Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-phi-lg">
          <div className="border border-gray-200 rounded-xl p-6 about-grid-item hover:border-primary/40 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="type-overline text-primary mb-2">Focus</p>
            <h3 className="type-subtitle mb-2">Quality Construction</h3>
            <p className="type-caption text-gray-500">ISO-certified processes ensuring every product meets international standards.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6 about-grid-item hover:border-primary/40 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="type-overline text-primary mb-2">Strength</p>
            <h3 className="type-subtitle mb-2">Expert Team</h3>
            <p className="type-caption text-gray-500">A skilled team of engineers and specialists dedicated to your project's success.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6 about-grid-item hover:border-primary/40 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="type-overline text-primary mb-2">Promise</p>
            <h3 className="type-subtitle mb-2">Trusted Delivery</h3>
            <p className="type-caption text-gray-500">On-time delivery and after-sales support that builds lasting partnerships.</p>
          </div>
        </div>

        {/* Certifications Strip */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="type-overline text-gray-500">Recognized &amp; Certified</p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              ISO 9001:2015
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              BIS Approved
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              NABL Tested
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
