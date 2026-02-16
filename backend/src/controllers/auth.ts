import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import TryCatch from "../config/TryCatch.js";
import type { Request, Response } from "express";

export const register = TryCatch(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Manual Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email, and password" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  // Validate Email Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Default role to "user" if not provided or invalid
  const userRole = role === "admin" ? "admin" : "user";

  user = await User.create({ 
    name, 
    email, 
    password: hashedPassword, 
    role: userRole 
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "15d" });

  res.status(201).json({
    message: "Registered Successfully",
    token,
    user: { id: user._id, name, email, role: user.role }
  });
});

export const login = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Manual Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password as string))) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "15d" });

  res.json({
    message: "Logged In",
    token,
    user: { id: user._id, name: user.name, role: user.role }
  });
});