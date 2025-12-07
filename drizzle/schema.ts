import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionNumber: int("sessionNumber").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  groupName: varchar("groupName", { length: 255 }).notNull(),
  facilitator: varchar("facilitator", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").references(() => sessions.id),
  sessionNumber: int("sessionNumber").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  groupName: varchar("groupName", { length: 255 }).notNull(),
  facilitator: varchar("facilitator", { length: 255 }).notNull(),
  
  // ANTES (Baseline)
  beforeGrouping: text("beforeGrouping"),
  beforeIsolation: text("beforeIsolation"),
  beforeTensions: text("beforeTensions"),
  beforeCommunication: text("beforeCommunication"),
  beforeMixedInteractions: int("beforeMixedInteractions"),
  
  // DURANTE (Session)
  duringParticipation: text("duringParticipation"),
  duringRespect: text("duringRespect"),
  duringOpenness: text("duringOpenness"),
  duringLaughter: text("duringLaughter"),
  duringMixedInteractions: text("duringMixedInteractions"),
  
  // DESPUÉS (Final)
  afterGrouping: text("afterGrouping"),
  afterMixedInteractions: int("afterMixedInteractions"),
  afterStereotypes: text("afterStereotypes"),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;