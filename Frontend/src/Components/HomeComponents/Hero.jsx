import { motion } from "framer-motion";
import { COMPANY_INFO } from "../../config/constants";

const Hero = () => {
  const headingParentVariants = {
    initial: { opacity: 0, filter: "blur(10px)", scale: 0.95 },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.5,
        staggerChildren: 0.2,
        staggerDirection: 1,
        ease: "easeInOut",
      },
    },
  };

  const headingChildVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 1 } },
  };


  return (
    <>
      {/* Hero full-viewport section */}
      <motion.section
        variants={headingParentVariants}
        initial="initial"
        animate="animate"
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-24"
      >
        <div className="text-center px-4">
          <motion.h1
            variants={headingChildVariants}
            className="type-hero text-pretty"
          >
            {COMPANY_INFO.name.prefix}{" "}
            <span className="text-primary">{COMPANY_INFO.name.main}</span>{" "}
            <span className="text-primary">{COMPANY_INFO.name.suffix}</span>
          </motion.h1>
          <motion.p
            variants={headingChildVariants}
            className="mt-4 type-body text-gray-700 max-w-xl mx-auto"
            style={{ fontSize: "var(--font-size-lg)" }}
          >
            Empowering Communities Through Seamless.
          </motion.p>
        </div>
      </motion.section>
    </>
  );
};

export default Hero;
