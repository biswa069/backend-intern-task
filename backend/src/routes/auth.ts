import express from "express";
import { login, register } from "../controllers/auth.js";

const app = express.Router();

/**
 * @swagger
 * tags:
 * - name: Auth
 * description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * role:
 * type: string
 * enum: [user, admin]
 * responses:
 * 201:
 * description: User registered successfully
 * 400:
 * description: Bad request
 */
app.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Log in a user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 200:
 * description: Login successful
 * 400:
 * description: Invalid credentials
 */
app.post("/login", login);

export default app;