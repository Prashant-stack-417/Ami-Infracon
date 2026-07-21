

/**
 * Root route controller
 * Returns API information and available endpoints
 */
export const index = (req, res) => {
  res.json({
    success: true,
    data: {
      name: "Ami Infracon API",
      version: "1.0.0",
      docs: "/docs",
      health: "/api/healthCheck",
    },
    message: "Ami Infracon LLP API is running"
  });
};
