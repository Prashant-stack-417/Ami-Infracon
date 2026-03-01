import useAnimeScroll from "../hooks/useAnimeScroll";

const About = () => {
  const heroRef = useAnimeScroll({ direction: "up", duration: 700 });
  const titleRef = useAnimeScroll({ direction: "up", duration: 600, delay: 100 });
  const gridRef = useAnimeScroll({ animateChildren: ".about-grid-item", staggerDelay: 150, duration: 600, direction: "up" });

  return (
    <div className="max-w-7xl mx-auto mt-24 mb-8 px-4">
      <div ref={heroRef} className="bg-white rounded-lg shadow-lg p-6 md:p-12">
        <h1 ref={titleRef} className="type-page-title mb-phi-lg">About Ami Infracon LLP</h1>
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
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-phi-lg">
          <div className="border border-gray-300 rounded-lg p-5 about-grid-item">
            <p className="type-overline text-gray-600">Focus</p>
            <h3 className="type-subtitle mt-2">Quality Construction</h3>
          </div>
          <div className="border border-gray-300 rounded-lg p-5 about-grid-item">
            <p className="type-overline text-gray-600">Strength</p>
            <h3 className="type-subtitle mt-2">Skilled Team</h3>
          </div>
          <div className="border border-gray-300 rounded-lg p-5 about-grid-item">
            <p className="type-overline text-gray-600">Promise</p>
            <h3 className="type-subtitle mt-2">Trusted Delivery</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
