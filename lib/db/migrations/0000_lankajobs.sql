CREATE TYPE "user_role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "job_status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'EXPIRED', 'SUSPENDED');
CREATE TYPE "employment_type" AS ENUM ('Full-time', 'Part-time', 'Internship', 'Contract');
CREATE TYPE "work_mode" AS ENUM ('On-site', 'Hybrid', 'Remote');
CREATE TYPE "report_status" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

CREATE TABLE "users" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text,
  "phone" text,
  "google_sub" text,
  "name" text DEFAULT '' NOT NULL,
  "role" "user_role" DEFAULT 'USER' NOT NULL,
  "status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
CREATE UNIQUE INDEX "users_phone_unique" ON "users" ("phone");
CREATE UNIQUE INDEX "users_google_sub_unique" ON "users" ("google_sub");

CREATE TABLE "profiles" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "location" text DEFAULT '' NOT NULL,
  "interests" text[] DEFAULT '{}' NOT NULL,
  "experience" text DEFAULT '' NOT NULL,
  "education" text DEFAULT '' NOT NULL,
  "skills" text[] DEFAULT '{}' NOT NULL,
  "employment_type" text DEFAULT '' NOT NULL,
  "work_preference" text DEFAULT '' NOT NULL,
  "work_mode" text DEFAULT '' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "categories" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "icon" text DEFAULT 'briefcase-outline' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "categories_name_unique" ON "categories" ("name");
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" ("slug");

CREATE TABLE "jobs" (
  "id" text PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "company" text NOT NULL,
  "description" text NOT NULL,
  "category_id" text REFERENCES "categories"("id") ON DELETE SET NULL,
  "location" text NOT NULL,
  "employment_type" "employment_type" NOT NULL,
  "work_mode" "work_mode" NOT NULL,
  "salary" text,
  "experience" text DEFAULT '' NOT NULL,
  "education" text DEFAULT '' NOT NULL,
  "skills" text[] DEFAULT '{}' NOT NULL,
  "application_email" text,
  "application_url" text,
  "closing_date" date,
  "status" "job_status" DEFAULT 'DRAFT' NOT NULL,
  "rejection_reason" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "jobs_owner_created_idx" ON "jobs" ("owner_id", "created_at");

CREATE TABLE "saved_jobs" (
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "job_id")
);
CREATE TABLE "applications" (
  "id" text PRIMARY KEY NOT NULL,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "applicant_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text DEFAULT 'SUBMITTED' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE TABLE "reports" (
  "id" text PRIMARY KEY NOT NULL,
  "reporter_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "job_id" text REFERENCES "jobs"("id") ON DELETE CASCADE,
  "reported_user_id" text REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" text NOT NULL,
  "status" "report_status" DEFAULT 'OPEN' NOT NULL,
  "resolution" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE TABLE "platform_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "updated_by" text REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE TABLE "auth_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "auth_sessions_token_unique" ON "auth_sessions" ("token_hash");
CREATE INDEX "auth_sessions_user_idx" ON "auth_sessions" ("user_id", "created_at");
CREATE TABLE "otp_challenges" (
  "id" text PRIMARY KEY NOT NULL,
  "phone" text NOT NULL,
  "code_hash" text NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "consumed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);