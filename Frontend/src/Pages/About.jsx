import React from "react";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto mt-24 mb-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-12">
        <h1 className="text-4xl font-bold mb-6">About Ami Infracon LLP</h1>
        <p className="text-base leading-relaxed mb-4">
          Ami Infracon LLP delivers reliable infrastructure solutions with a
          focus on quality, safety, and on‑time execution. Our team works
          closely with clients to plan, build, and manage projects that stand
          the test of time.
        </p>
        <p className="text-base leading-relaxed mb-8">
          We combine experienced professionals, transparent processes, and
          modern tools to ensure each project meets its goals. From early
          planning to final delivery, we prioritize durability, compliance, and
          long‑term value.
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
