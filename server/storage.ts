import { users, questionBanks, questions } from "@shared/schema";
import type { User, InsertUser, QuestionBank, InsertQuestionBank, Question, InsertQuestion } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.SessionStore;
  
  // Question Bank methods
  createQuestionBank(questionBank: InsertQuestionBank): Promise<QuestionBank>;
  getQuestionBanks(creatorId?: number): Promise<QuestionBank[]>;
  getQuestionBank(id: number): Promise<QuestionBank | undefined>;
  updateQuestionBank(id: number, data: Partial<QuestionBank>): Promise<QuestionBank | undefined>;
  deleteQuestionBank(id: number): Promise<boolean>;
  getPublishedQuestionBanks(): Promise<QuestionBank[]>;
  
  // Question methods
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestions(questionBankId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  updateQuestion(id: number, data: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questionBanks: Map<number, QuestionBank>;
  private questions: Map<number, Question>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentQuestionBankId: number;
  currentQuestionId: number;

  constructor() {
    this.users = new Map();
    this.questionBanks = new Map();
    this.questions = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    this.currentUserId = 1;
    this.currentQuestionBankId = 1;
    this.currentQuestionId = 1;
    
    // Add admin user
    this.createUser({
      username: "admin",
      password: "password123", // This will be hashed by auth.ts
      organization: "Brackets Admin"
    }).then(user => {
      // Create a demo question bank
      this.createQuestionBank({
        title: "Solar System Basics",
        creatorId: user.id,
        organization: "Brackets Admin",
        introduction: "A comprehensive set of questions about the fundamental properties of our solar system.",
        published: true
      }).then(questionBank => {
        // Add some sample questions
        this.createQuestion({
          questionBankId: questionBank.id,
          examName: "Astronomy Basics",
          examYear: "2023",
          subject: "General Astronomy",
          questionText: "Which planet is known as the 'Red Planet'?",
          hasOptions: true,
          options: ["Earth", "Venus", "Mars", "Jupiter"],
          correctAnswer: "Mars",
          description: "Mars is often called the 'Red Planet' because of the reddish appearance given to its surface by iron oxide (rust).",
          serialNumber: 1
        });
        
        this.createQuestion({
          questionBankId: questionBank.id,
          examName: "Astronomy Basics",
          examYear: "2023",
          subject: "General Astronomy",
          questionText: "What is the largest planet in our solar system?",
          hasOptions: true,
          options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
          correctAnswer: "Jupiter",
          description: "Jupiter is the largest planet in our solar system, with a diameter of about 86,881 miles (139,822 km), which is approximately 11 times the diameter of Earth.",
          serialNumber: 2
        });
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: id === 1 }; // First user is admin
    this.users.set(id, user);
    return user;
  }
  
  // Question Bank methods
  async createQuestionBank(insertQuestionBank: InsertQuestionBank): Promise<QuestionBank> {
    const id = this.currentQuestionBankId++;
    const now = new Date();
    const questionBank: QuestionBank = { 
      ...insertQuestionBank, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.questionBanks.set(id, questionBank);
    return questionBank;
  }
  
  async getQuestionBanks(creatorId?: number): Promise<QuestionBank[]> {
    if (creatorId) {
      return Array.from(this.questionBanks.values()).filter(
        qb => qb.creatorId === creatorId
      ).sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
    }
    return Array.from(this.questionBanks.values())
      .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
  }
  
  async getQuestionBank(id: number): Promise<QuestionBank | undefined> {
    return this.questionBanks.get(id);
  }
  
  async updateQuestionBank(id: number, data: Partial<QuestionBank>): Promise<QuestionBank | undefined> {
    const questionBank = this.questionBanks.get(id);
    if (!questionBank) return undefined;
    
    const updatedQuestionBank = { 
      ...questionBank, 
      ...data, 
      updatedAt: new Date() 
    };
    this.questionBanks.set(id, updatedQuestionBank);
    return updatedQuestionBank;
  }
  
  async deleteQuestionBank(id: number): Promise<boolean> {
    // Also delete associated questions
    const questions = await this.getQuestions(id);
    for (const question of questions) {
      await this.deleteQuestion(question.id);
    }
    
    return this.questionBanks.delete(id);
  }
  
  async getPublishedQuestionBanks(): Promise<QuestionBank[]> {
    return Array.from(this.questionBanks.values())
      .filter(qb => qb.published)
      .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
  }
  
  // Question methods
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const now = new Date();
    const question: Question = { 
      ...insertQuestion, 
      id, 
      createdAt: now
    };
    this.questions.set(id, question);
    return question;
  }
  
  async getQuestions(questionBankId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(q => q.questionBankId === questionBankId)
      .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));
  }
  
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async updateQuestion(id: number, data: Partial<Question>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...data };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }
  
  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }
}

export const storage = new MemStorage();
