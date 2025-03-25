import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  organization: text("organization"),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  organization: true,
});

export const questionBanks = pgTable("question_banks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  organization: text("organization").notNull(),
  introduction: text("introduction"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuestionBankSchema = createInsertSchema(questionBanks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionBankId: integer("question_bank_id").notNull().references(() => questionBanks.id),
  examName: text("exam_name").notNull(),
  examYear: text("exam_year").notNull(),
  subject: text("subject").notNull(),
  questionText: text("question_text").notNull(),
  hasOptions: boolean("has_options").default(true),
  options: text("options").array(),
  correctAnswer: text("correct_answer").notNull(),
  description: text("description"),
  serialNumber: integer("serial_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

// Extended schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const questionBankFormSchema = insertQuestionBankSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  organization: z.string().min(2, "Organization name is required"),
});

export const questionFormSchema = insertQuestionSchema.extend({
  examName: z.string().min(1, "Exam name is required"),
  examYear: z.string().regex(/^\d{4}$/, "Year must be in YYYY format"),
  subject: z.string().min(1, "Subject is required"),
  questionText: z.string().min(5, "Question text is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  description: z.string().max(2000, "Description must be less than 2000 words").optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type QuestionBank = typeof questionBanks.$inferSelect;
export type InsertQuestionBank = z.infer<typeof insertQuestionBankSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
