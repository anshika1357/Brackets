import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['creator', 'admin']);
export const questionBankStatusEnum = pgEnum('question_bank_status', ['draft', 'published']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('creator'),
  companyName: text('company_name'),
  introduction: text('introduction'),
});

// Question Banks table
export const questionBanks = pgTable('question_banks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  creatorId: integer('creator_id').notNull(),
  status: questionBankStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subjects table
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

// Exams table
export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

// Questions table
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  questionBankId: integer('question_bank_id').notNull(),
  examId: integer('exam_id').notNull(),
  examYear: text('exam_year').notNull(),
  subjectId: integer('subject_id').notNull(),
  questionText: text('question_text').notNull(),
  options: text('options').array(),
  correctAnswer: text('correct_answer').notNull(),
  description: text('description'),
  serialNumber: integer('serial_number').notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertQuestionBankSchema = createInsertSchema(questionBanks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });

// Extended Schemas
export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type QuestionBank = typeof questionBanks.$inferSelect;
export type InsertQuestionBank = z.infer<typeof insertQuestionBankSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
