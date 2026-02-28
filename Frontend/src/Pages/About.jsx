/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto mt-24 mb-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 md:p-12"
      >
        <h1 className="type-page-title mb-phi-lg">About Ami Infracon LLP</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-phi-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-gray-300 rounded-lg p-5"
          >
            <p className="type-overline text-gray-600">Focus</p>
            <h3 className="type-subtitle mt-2">Quality Construction</h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border border-gray-300 rounded-lg p-5"
          >
            <p className="type-overline text-gray-600">Strength</p>
            <h3 className="type-subtitle mt-2">Skilled Team</h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-gray-300 rounded-lg p-5"
          >
            <p className="type-overline text-gray-600">Promise</p>
            <h3 className="type-subtitle mt-2">Trusted Delivery</h3>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
