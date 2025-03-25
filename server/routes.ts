import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertQuestionBankSchema, insertQuestionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Question Bank routes
  app.post("/api/question-banks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedData = insertQuestionBankSchema.parse({
        ...req.body,
        creatorId: req.user.id
      });
      
      const questionBank = await storage.createQuestionBank(parsedData);
      res.status(201).json(questionBank);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.get("/api/question-banks", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        // If not authenticated, only return published question banks
        const publishedBanks = await storage.getPublishedQuestionBanks();
        return res.json(publishedBanks);
      }
      
      // If creator_id is provided, filter by creator
      const creatorId = req.query.creator_id ? Number(req.query.creator_id) : undefined;
      
      // If user is not admin and creator_id is provided, ensure they can only see their own
      if (creatorId && !req.user.isAdmin && creatorId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get question banks (filtered by creator if specified)
      const questionBanks = await storage.getQuestionBanks(
        creatorId || (req.user.isAdmin ? undefined : req.user.id)
      );
      
      res.json(questionBanks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/question-banks/published", async (req, res, next) => {
    try {
      const publishedBanks = await storage.getPublishedQuestionBanks();
      res.json(publishedBanks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/question-banks/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const questionBank = await storage.getQuestionBank(id);
      
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      
      // Check if user is authorized to view this question bank
      if (!questionBank.published && 
          !req.isAuthenticated() || 
          (req.user.id !== questionBank.creatorId && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(questionBank);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/question-banks/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = Number(req.params.id);
      const questionBank = await storage.getQuestionBank(id);
      
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      
      // Check if user is authorized to update this question bank
      if (req.user.id !== questionBank.creatorId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedBank = await storage.updateQuestionBank(id, req.body);
      res.json(updatedBank);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/question-banks/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = Number(req.params.id);
      const questionBank = await storage.getQuestionBank(id);
      
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      
      // Check if user is authorized to delete this question bank
      if (req.user.id !== questionBank.creatorId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteQuestionBank(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Question routes
  app.post("/api/questions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const questionBankId = Number(req.body.questionBankId);
      const questionBank = await storage.getQuestionBank(questionBankId);
      
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      
      // Check if user is authorized to add a question to this question bank
      if (req.user.id !== questionBank.creatorId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Calculate next serial number
      const questions = await storage.getQuestions(questionBankId);
      const serialNumber = questions.length > 0 
        ? Math.max(...questions.map(q => q.serialNumber || 0)) + 1 
        : 1;
      
      const parsedData = insertQuestionSchema.parse({
        ...req.body,
        serialNumber
      });
      
      const question = await storage.createQuestion(parsedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  app.get("/api/question-banks/:id/questions", async (req, res, next) => {
    try {
      const questionBankId = Number(req.params.id);
      const questionBank = await storage.getQuestionBank(questionBankId);
      
      if (!questionBank) {
        return res.status(404).json({ message: "Question bank not found" });
      }
      
      // Check if user is authorized to view questions
      if (!questionBank.published && 
          !req.isAuthenticated() || 
          (req.user.id !== questionBank.creatorId && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const questions = await storage.getQuestions(questionBankId);
      res.json(questions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/questions/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const questionBank = await storage.getQuestionBank(question.questionBankId);
      
      // Check if user is authorized to view this question
      if (!questionBank?.published && 
          !req.isAuthenticated() || 
          (req.user.id !== questionBank?.creatorId && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(question);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/questions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = Number(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const questionBank = await storage.getQuestionBank(question.questionBankId);
      
      // Check if user is authorized to update this question
      if (req.user.id !== questionBank?.creatorId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedQuestion = await storage.updateQuestion(id, req.body);
      res.json(updatedQuestion);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/questions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = Number(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const questionBank = await storage.getQuestionBank(question.questionBankId);
      
      // Check if user is authorized to delete this question
      if (req.user.id !== questionBank?.creatorId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteQuestion(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
