import { Request, Response } from "express";
import { Task } from "../models/Task.js"; 
import TryCatch from "../config/TryCatch.js";
import { AuthRequest } from "../middlewares/isAuth.js";
import redisClient from "../config/redis.js"; // <--- Import the client

export const createTask = TryCatch(async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  const task = await Task.create({
    title,
    description,
    user: req.user._id, 
  });


  const cacheKey = `tasks:${req.user._id}`;
  await redisClient.del(cacheKey);

  res.status(201).json({ message: "Task Created", task });
});

export const getTasks = TryCatch(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const cacheKey = `tasks:${req.user._id}`;

  // 1. CHECK REDIS CACHE
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.json({ 
      tasks: JSON.parse(cachedData),
      source: "cache"
    });
  }

  //
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };
  const tasks = await Task.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });


  await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 3600 });

  res.json({ tasks, source: "database" });
});

export const updateTaskStatus = TryCatch(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user) return res.status(401).json({ message: "User not authenticated" });

  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'pending' or 'completed'" });
  }

  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  task.status = status;
  await task.save();

  // INVALIDATE CACHE
  const cacheKey = `tasks:${task.user}`;
  await redisClient.del(cacheKey);

  res.json({ message: "Task Updated", task });
});

export const deleteTask = TryCatch(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) return res.status(401).json({ message: "User not authenticated" });

  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  await task.deleteOne();

  // INVALIDATE CACHE
  const cacheKey = `tasks:${task.user}`;
  await redisClient.del(cacheKey);

  res.json({ message: "Task Deleted" });
});