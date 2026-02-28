import { ApiResponse } from "../utils/apiResponse.js";

/**
 * Root route controller
 * Returns API information and available endpoints
 */
export const index = (req, res) => {
  res.json(
    new ApiResponse(
      200,
      {
        name: "Ami Infracon API",
        version: "1.0.0",
        docs: "/docs",
        health: "/api/healthCheck",
      },
      "Ami Infracon LLP API is running",
    ),
  );
};
