import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ami Infracon API",
      version: "1.0.0",
      description:
        "REST API for Ami Infracon LLP — construction chemicals e-commerce platform",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3802}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
});
