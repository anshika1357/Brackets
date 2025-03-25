import { users, type User, type InsertUser, questionBanks, type QuestionBank, type InsertQuestionBank, 
  subjects, type Subject, type InsertSubject, exams, type Exam, type InsertExam, 
  questions, type Question, type InsertQuestion } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store for auth
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question Bank methods
  getQuestionBanks(): Promise<QuestionBank[]>;
  getQuestionBanksByCreator(creatorId: number): Promise<QuestionBank[]>;
  getQuestionBank(id: number): Promise<QuestionBank | undefined>;
  createQuestionBank(bank: InsertQuestionBank): Promise<QuestionBank>;
  updateQuestionBank(id: number, bank: Partial<InsertQuestionBank>): Promise<QuestionBank | undefined>;
  deleteQuestionBank(id: number): Promise<boolean>;
  
  // Subject methods
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Exam methods
  getExams(): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  
  // Question methods
  getQuestions(questionBankId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questionBanks: Map<number, QuestionBank>;
  private subjects: Map<number, Subject>;
  private exams: Map<number, Exam>;
  private questions: Map<number, Question>;
  
  private currentUserId: number;
  private currentQuestionBankId: number;
  private currentSubjectId: number;
  private currentExamId: number;
  private currentQuestionId: number;

  constructor() {
    this.users = new Map();
    this.questionBanks = new Map();
    this.subjects = new Map();
    this.exams = new Map();
    this.questions = new Map();
    
    this.currentUserId = 1;
    this.currentQuestionBankId = 1;
    this.currentSubjectId = 1;
    this.currentExamId = 1;
    this.currentQuestionId = 1;
    
    // Add some initial data
    this.seedInitialData();
  }
  
  private seedInitialData() {
    // Add some sample subjects
    const subjectNames = ["Building Services", "Structures", "Design", "Theory"];
    subjectNames.forEach(name => this.createSubject({ name }));
    
    // Add some sample exams
    const examNames = ["GATE Architecture", "HPSC Architecture", "COA Professional Practice"];
    examNames.forEach(name => this.createExam({ name }));
  }

  // User methods
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Question Bank methods
  async getQuestionBanks(): Promise<QuestionBank[]> {
    return Array.from(this.questionBanks.values());
  }
  
  async getQuestionBanksByCreator(creatorId: number): Promise<QuestionBank[]> {
    return Array.from(this.questionBanks.values()).filter(
      bank => bank.creatorId === creatorId
    );
  }
  
  async getQuestionBank(id: number): Promise<QuestionBank | undefined> {
    return this.questionBanks.get(id);
  }
  
  async createQuestionBank(bank: InsertQuestionBank): Promise<QuestionBank> {
    const id = this.currentQuestionBankId++;
    const now = new Date();
    const questionBank: QuestionBank = { 
      ...bank, 
      id,
      createdAt: now,
      updatedAt: now 
    };
    this.questionBanks.set(id, questionBank);
    return questionBank;
  }
  
  async updateQuestionBank(id: number, bank: Partial<InsertQuestionBank>): Promise<QuestionBank | undefined> {
    const existingBank = this.questionBanks.get(id);
    if (!existingBank) return undefined;
    
    const updatedBank: QuestionBank = { 
      ...existingBank, 
      ...bank,
      updatedAt: new Date()
    };
    this.questionBanks.set(id, updatedBank);
    return updatedBank;
  }
  
  async deleteQuestionBank(id: number): Promise<boolean> {
    return this.questionBanks.delete(id);
  }
  
  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }
  
  async createSubject(subject: InsertSubject): Promise<Subject> {
    // Check if subject with same name already exists
    const existing = Array.from(this.subjects.values()).find(
      s => s.name.toLowerCase() === subject.name.toLowerCase()
    );
    if (existing) return existing;
    
    const id = this.currentSubjectId++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }
  
  // Exam methods
  async getExams(): Promise<Exam[]> {
    return Array.from(this.exams.values());
  }
  
  async createExam(exam: InsertExam): Promise<Exam> {
    // Check if exam with same name already exists
    const existing = Array.from(this.exams.values()).find(
      e => e.name.toLowerCase() === exam.name.toLowerCase()
    );
    if (existing) return existing;
    
    const id = this.currentExamId++;
    const newExam: Exam = { ...exam, id };
    this.exams.set(id, newExam);
    return newExam;
  }
  
  // Question methods
  async getQuestions(questionBankId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(q => q.questionBankId === questionBankId)
      .sort((a, b) => a.serialNumber - b.serialNumber);
  }
  
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }
  
  async updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined> {
    const existingQuestion = this.questions.get(id);
    if (!existingQuestion) return undefined;
    
    const updatedQuestion: Question = { 
      ...existingQuestion, 
      ...question 
    };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }
  
  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }
}

// Database implementation of IStorage
export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Question Bank methods
  async getQuestionBanks(): Promise<QuestionBank[]> {
    return await db.select().from(questionBanks);
  }

  async getQuestionBanksByCreator(creatorId: number): Promise<QuestionBank[]> {
    return await db.select()
      .from(questionBanks)
      .where(eq(questionBanks.creatorId, creatorId));
  }

  async getQuestionBank(id: number): Promise<QuestionBank | undefined> {
    const [bank] = await db.select()
      .from(questionBanks)
      .where(eq(questionBanks.id, id));
    return bank;
  }

  async createQuestionBank(bank: InsertQuestionBank): Promise<QuestionBank> {
    const now = new Date();
    const [questionBank] = await db.insert(questionBanks)
      .values({
        ...bank,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return questionBank;
  }

  async updateQuestionBank(id: number, bank: Partial<InsertQuestionBank>): Promise<QuestionBank | undefined> {
    const [updatedBank] = await db.update(questionBanks)
      .set({
        ...bank,
        updatedAt: new Date()
      })
      .where(eq(questionBanks.id, id))
      .returning();
    return updatedBank;
  }

  async deleteQuestionBank(id: number): Promise<boolean> {
    const result = await db.delete(questionBanks)
      .where(eq(questionBanks.id, id))
      .returning();
    return result.length > 0;
  }

  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    // Check if subject with same name already exists
    const [existing] = await db.select()
      .from(subjects)
      .where(eq(subjects.name, subject.name));
    
    if (existing) return existing;
    
    const [newSubject] = await db.insert(subjects)
      .values(subject)
      .returning();
    return newSubject;
  }

  // Exam methods
  async getExams(): Promise<Exam[]> {
    return await db.select().from(exams);
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    // Check if exam with same name already exists
    const [existing] = await db.select()
      .from(exams)
      .where(eq(exams.name, exam.name));
    
    if (existing) return existing;
    
    const [newExam] = await db.insert(exams)
      .values(exam)
      .returning();
    return newExam;
  }

  // Question methods
  async getQuestions(questionBankId: number): Promise<Question[]> {
    return await db.select()
      .from(questions)
      .where(eq(questions.questionBankId, questionBankId))
      .orderBy(questions.serialNumber);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select()
      .from(questions)
      .where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updatedQuestion] = await db.update(questions)
      .set(question)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await db.delete(questions)
      .where(eq(questions.id, id))
      .returning();
    return result.length > 0;
  }
}

// Initialize storage with database implementation
export const storage = new DatabaseStorage();
