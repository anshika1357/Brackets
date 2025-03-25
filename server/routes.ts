import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertQuestionBankSchema,
  insertSubjectSchema,
  insertExamSchema,
  insertQuestionSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes
  // Get all subjects
  app.get("/api/subjects", async (_req, res) => {
    const subjects = await storage.getSubjects();
    res.json(subjects);
  });

  // Get all exams
  app.get("/api/exams", async (_req, res) => {
    const exams = await storage.getExams();
    res.json(exams);
  });

  // Create new subject
  app.post("/api/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Create new exam
  app.post("/api/exams", async (req, res) => {
    try {
      const validatedData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam(validatedData);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Question Bank routes
  // Get all question banks (for learners - only published ones)
  app.get("/api/question-banks", async (_req, res) => {
    const questionBanks = await storage.getQuestionBanks();
    const publishedBanks = questionBanks.filter(bank => bank.status === 'published');
    res.json(publishedBanks);
  });

  // Get creator's question banks
  app.get("/api/creator/question-banks", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const questionBanks = await storage.getQuestionBanksByCreator(req.user.id);
    res.json(questionBanks);
  });

  // Get a specific question bank
  app.get("/api/question-banks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const questionBank = await storage.getQuestionBank(id);
    
    if (!questionBank) {
      return res.status(404).json({ error: "Question bank not found" });
    }
    
    // If user not authenticated and bank is draft, don't show
    if (questionBank.status === 'draft' && !req.isAuthenticated()) {
      return res.status(404).json({ error: "Question bank not found" });
    }
    
    // If user is authenticated but not the creator or admin, don't show draft banks
    if (questionBank.status === 'draft' && req.user && 
        req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
      return res.status(404).json({ error: "Question bank not found" });
    }
    
    res.json(questionBank);
  });

  // Create a question bank
  app.post("/api/question-banks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const validatedData = insertQuestionBankSchema.parse({
        ...req.body,
        creatorId: req.user.id
      });
      
      const questionBank = await storage.createQuestionBank(validatedData);
      res.status(201).json(questionBank);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Update a question bank
  app.put("/api/question-banks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const questionBank = await storage.getQuestionBank(id);
      
      if (!questionBank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      // Check if user is the creator or admin
      if (req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const validatedData = insertQuestionBankSchema.partial().parse(req.body);
      const updatedBank = await storage.updateQuestionBank(id, validatedData);
      res.json(updatedBank);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Delete a question bank
  app.delete("/api/question-banks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const questionBank = await storage.getQuestionBank(id);
      
      if (!questionBank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      // Check if user is the creator or admin
      if (req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const result = await storage.deleteQuestionBank(id);
      if (result) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: "Failed to delete question bank" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Question routes
  // Get questions for a specific bank
  app.get("/api/question-banks/:bankId/questions", async (req, res) => {
    const bankId = parseInt(req.params.bankId);
    const questionBank = await storage.getQuestionBank(bankId);
    
    if (!questionBank) {
      return res.status(404).json({ error: "Question bank not found" });
    }
    
    // If user not authenticated and bank is draft, don't show
    if (questionBank.status === 'draft' && !req.isAuthenticated()) {
      return res.status(404).json({ error: "Question bank not found" });
    }
    
    // If user is authenticated but not the creator or admin, don't show draft banks
    if (questionBank.status === 'draft' && req.user && 
        req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
      return res.status(404).json({ error: "Question bank not found" });
    }
    
    const questions = await storage.getQuestions(bankId);
    res.json(questions);
  });

  // Create a question
  app.post("/api/question-banks/:bankId/questions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const bankId = parseInt(req.params.bankId);
      const questionBank = await storage.getQuestionBank(bankId);
      
      if (!questionBank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      // Check if user is the creator or admin
      if (req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Get current question count for this bank for proper serial numbering
      const questions = await storage.getQuestions(bankId);
      const nextSerialNumber = questions.length + 1;
      
      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        questionBankId: bankId,
        serialNumber: nextSerialNumber
      });
      
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Update a question
  app.put("/api/questions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      
      const questionBank = await storage.getQuestionBank(question.questionBankId);
      
      if (!questionBank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      // Check if user is the creator or admin
      if (req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const validatedData = insertQuestionSchema.partial().parse(req.body);
      const updatedQuestion = await storage.updateQuestion(id, validatedData);
      res.json(updatedQuestion);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Delete a question
  app.delete("/api/questions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      
      const questionBank = await storage.getQuestionBank(question.questionBankId);
      
      if (!questionBank) {
        return res.status(404).json({ error: "Question bank not found" });
      }
      
      // Check if user is the creator or admin
      if (req.user.id !== questionBank.creatorId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const result = await storage.deleteQuestion(id);
      if (result) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: "Failed to delete question" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Middleware for checking authentication
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}
