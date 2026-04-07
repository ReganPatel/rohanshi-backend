import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'A minimal Swagger (OpenAPI 3.0) setup for the backend',
    },
    servers: [
      {
        url: 'https://rohanshi-backend.vercel.app',
        description: 'Production server',
      },
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
  },
  // Look for API definitions in server.js and inside routes folders
  apis: ['./server.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  // Use CDN for CSS and JS to ensure they load when deployed serverless (e.g., on Vercel)
  const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css";

  // Expose docs at /docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCssUrl: CSS_URL,
    customSiteTitle: "E-Commerce API Docs",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js"
    ]
  }));
  console.log(`Swagger docs available at /docs`);
};
