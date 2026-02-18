// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDb from "./config/db.js";
// import authRoutes from "./routes/auth.js";
// import taskRoutes from "./routes/task.js";
// import swaggerUi from "swagger-ui-express";
// import swaggerJsdoc from "swagger-jsdoc";

// dotenv.config();
// connectDb();

// const app = express();

// app.use(express.json());
// app.use(cors());

// // Swagger Configuration
// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Intern Task API",
//       version: "1.0.0",
//       description: "API for Authentication and Task Management",
//     },
//     components: {
//       securitySchemes: {
//         BearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//     security: [{ BearerAuth: [] }],
//   },
//   apis: ["./src/routes/*.ts"], 
// };

// const specs = swaggerJsdoc(options);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/tasks", taskRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/task.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import morgan from "morgan"; 
import fs from "fs";         
import path from "path";     

dotenv.config();
connectDb();

const app = express();

app.use(express.json());
app.use(cors());

// --- LOGGING CONFIGURATION START ---
const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));

app.use(morgan('dev'));
// --- LOGGING CONFIGURATION END ---

// Swagger Configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Intern Task API",
      version: "1.0.0",
      description: "API for Authentication and Task Management",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"], 
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});