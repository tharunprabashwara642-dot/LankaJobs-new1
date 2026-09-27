import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const id = () => text("id").primaryKey();

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN", "SUPER_ADMIN"]);
export const accountStatusEnum = pgEnum("account_status", ["ACTIVE", "SUSPENDED"]);
export const jobStatusEnum = pgEnum("job_status", [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "EXPIRED",
  "SUSPENDED",
]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
]);
export const workModeEnum = pgEnum("work_mode", ["On-site", "Hybrid", "Remote"]);
export const reportStatusEnum = pgEnum("report_status", ["OPEN", "RESOLVED", "REJECTED"]);

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email"),
    phone: text("phone"),
    googleSub: text("google_sub"),
    name: text("name").notNull().default(""),
    role: userRoleEnum("role").notNull().default("USER"),
    status: accountStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    phoneUnique: uniqueIndex("users_phone_unique").on(table.phone),
    googleSubUnique: uniqueIndex("users_google_sub_unique").on(table.googleSub),
  }),
);

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  location: text("location").notNull().default(""),
  interests: text("interests").array().notNull().default([]),
  experience: text("experience").notNull().default(""),
  education: text("education").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  employmentType: text("employment_type").notNull().default(""),
  workPreference: text("work_preference").notNull().default(""),
  workMode: text("work_mode").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon").notNull().default("briefcase-outline"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("categories_name_unique").on(table.name),
    slugUnique: uniqueIndex("categories_slug_unique").on(table.slug),
  }),
);

export const jobs = pgTable(
  "jobs",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    company: text("company").notNull(),
    description: text("description").notNull(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    location: text("location").notNull(),
    employmentType: employmentTypeEnum("employment_type").notNull(),
    workMode: workModeEnum("work_mode").notNull(),
    salary: text("salary"),
    experience: text("experience").notNull().default(""),
    education: text("education").notNull().default(""),
    skills: text("skills").array().notNull().default([]),
    applicationEmail: text("application_email"),
    applicationUrl: text("application_url"),
    closingDate: date("closing_date"),
    status: jobStatusEnum("status").notNull().default("DRAFT"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerIndex: index("jobs_owner_created_idx").on(table.ownerId, table.createdAt),
  }),
);

export const savedJobs = pgTable(
  "saved_jobs",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.jobId] }),
  }),
);

export const applications = pgTable("applications", {
  id: id(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  applicantId: text("applicant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("SUBMITTED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: id(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobId: text("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  reportedUserId: text("reported_user_id").references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("OPEN"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformSettings = pgTable("platform_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("auth_sessions_token_unique").on(table.tokenHash),
    userIndex: uniqueIndex("auth_sessions_user_idx").on(table.userId, table.createdAt),
  }),
);

export const otpChallenges = pgTable("otp_challenges", {
  id: id(),
  phone: text("phone").notNull(),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertCategorySchema = createInsertSchema(categories);
export const insertJobSchema = createInsertSchema(jobs);

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type SavedJob = typeof savedJobs.$inferSelect;