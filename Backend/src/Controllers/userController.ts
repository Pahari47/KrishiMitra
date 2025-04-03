import { Request, Response } from "express";

// Dummy database
let users: { id: number; email: string; name?: string }[] = [];

// CREATE or UPDATE user
export const createOrUpdateUser = (req: Request, res: Response): void => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  let user = users.find((u) => u.email === email);
  if (user) {
    user.name = name || user.name;
    res.status(200).json({ message: "User updated", user });
  } else {
    const newUser = { id: users.length + 1, email, name: name || "Unknown" };
    users.push(newUser);
    res.status(201).json({ message: "User created", user: newUser });
  }
};

// GET user by email
export const getUser = (req: Request, res: Response): void => {
  const { email } = req.params;
  const user = users.find((u) => u.email === email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
};

// GET all users
export const getAllUsers = (req: Request, res: Response): void => {
  res.json(users);
};

// DELETE user
export const deleteUser = (req: Request, res: Response): void => {
  const { email } = req.params;
  users = users.filter((u) => u.email !== email);
  res.json({ message: "User deleted" });
};
