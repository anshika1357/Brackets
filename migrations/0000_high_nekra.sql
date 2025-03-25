CREATE TYPE "public"."question_bank_status" AS ENUM('draft', 'pending_approval', 'published');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('creator', 'admin');--> statement-breakpoint
CREATE TABLE "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "exams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "question_banks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"creator_id" integer NOT NULL,
	"status" "question_bank_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_bank_id" integer NOT NULL,
	"exam_id" integer NOT NULL,
	"exam_year" text NOT NULL,
	"subject_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"options" text[],
	"correct_answer" text NOT NULL,
	"description" text,
	"serial_number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'creator' NOT NULL,
	"company_name" text,
	"introduction" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
