import React from "react";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto mt-24 mb-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-12">
        <h1 className="text-4xl font-bold mb-6">About Ami Infracon LLP</h1>
        <p className="text-base leading-relaxed mb-4">
          Ami Infracon LLP is a leading provider of construction chemicals and
          infrastructure solutions in India. With a commitment to quality and
          innovation, we deliver reliable products that enhance the durability
          and performance of construction projects across various sectors.
        </p>
        <p className="text-base leading-relaxed mb-4">
          Our comprehensive range of construction chemicals includes
          waterproofing solutions, concrete admixtures, repair mortars,
          protective coatings, and specialty products designed to meet the
          evolving needs of modern construction.
        </p>
        <p className="text-base leading-relaxed mb-8">
          We combine technical expertise, stringent quality control, and
          customer-focused service to ensure every product meets the highest
          standards. From residential buildings to large infrastructure
          projects, we are committed to building a stronger, more sustainable
          future.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-300 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase">Focus</p>
            <h3 className="text-xl font-semibold mt-2">Quality Construction</h3>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase">Strength</p>
            <h3 className="text-xl font-semibold mt-2">Skilled Team</h3>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase">Promise</p>
            <h3 className="text-xl font-semibold mt-2">Trusted Delivery</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
