import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.js";

export const setupSwagger = (app: Express) => {
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.json(openApiSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(JSON.parse(JSON.stringify(openApiSpec)), {
      customSiteTitle: "Credit Co-operation API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
};
