import { Request, Response } from "express";
import { Task } from "../models/Task.js"; 
import TryCatch from "../config/TryCatch.js";
import { AuthRequest } from "../middlewares/isAuth.js";

export const createTask = TryCatch(async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;

  // 1. SECURITY CHECK 
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  // 2. CREATE TASK
  const task = await Task.create({
    title,
    description,
    user: req.user._id, 
  });

  res.status(201).json({ message: "Task Created", task });
});

export const getTasks = TryCatch(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // 3. DEFINE FILTER
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };

  const tasks = await Task.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({ tasks });
});

export const updateTaskStatus = TryCatch(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'pending' or 'completed'" });
  }

  const task = await Task.findById(id);

  if (!task) return res.status(404).json({ message: "Task not found" });

  // Authorization Check
  if (task.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  task.status = status;
  await task.save();

  res.json({ message: "Task Updated", task });
});

export const deleteTask = TryCatch(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // Authorization Check
  if (task.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  await task.deleteOne();
  res.json({ message: "Task Deleted" });
});