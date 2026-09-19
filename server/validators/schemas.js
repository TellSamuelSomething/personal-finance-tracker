import { z } from "zod";

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
const password = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .refine((value) => Buffer.byteLength(value) <= 72, "Password must be at most 72 bytes");

const username = z
  .string({ error: "Username is required" })
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters");

export const registerSchema = z.object({ username, password });

export const loginSchema = z.object({
  username: z.string({ error: "Username is required" }).trim().toLowerCase().min(1, "Username is required"),
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export const transactionSchema = z.object({
  type: z.enum(["Income", "Expense"], { error: "Type must be Income or Expense" }),
  amount: z
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(1_000_000_000, "Amount is too large"),
  category: z.string({ error: "Category is required" }).trim().min(1, "Category is required").max(50, "Category is too long"),
  date: z.coerce.date({ error: "Date is not valid" }),
});
