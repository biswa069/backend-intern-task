import express from "express";
import { createTask, deleteTask, getTasks, updateTaskStatus } from "../controllers/task.js";
import { isAuth } from "../middlewares/isAuth.js";

const app = express.Router();

app.use(isAuth); // Protect all routes

app.post("/", createTask);
app.get("/", getTasks);
app.put("/:id", updateTaskStatus);
app.delete("/:id", deleteTask);

export default app;