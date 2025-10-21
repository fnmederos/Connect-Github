import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Traditional username/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull(),
  passwordHash: varchar("password_hash").notNull(),
  // Custom fields for approval system
  role: varchar("role").notNull().default("user"), // "admin" or "user"
  isApproved: boolean("is_approved").notNull().default(false),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Each user has their own employees
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  roles: text("roles").array().notNull(),
  allowDuplicates: boolean("allow_duplicates").notNull().default(false),
});

// Each user has their own vehicles
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  licensePlate: text("license_plate").notNull(),
});

// Daily assignments per user
export const dailyAssignments = pgTable("daily_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  vehicleId: varchar("vehicle_id").notNull(),
  vehicleName: text("vehicle_name").notNull(),
  vehicleLicensePlate: text("vehicle_license_plate").notNull(),
  // Store assignment rows as JSON for easy Excel export
  // Format: [{ employeeId, employeeName, role, time }]
  assignmentRows: text("assignment_rows").notNull(),
  // Comments field for notes
  comments: text("comments").notNull().default(''),
  // DEPOSITO assignments as JSON
  // Format: [{ timeSlot, employees: [{ employeeId, employeeName, isEncargado }] }]
  depositoAssignments: text("deposito_assignments").notNull().default('[]'),
  // Comments for DEPOSITO section
  depositoComments: text("deposito_comments").notNull().default(''),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Employee absences per user
export const employeeAbsences = pgTable("employee_absences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason").notNull(),
});

// Templates for reusable daily planning configurations per user
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  vehicleIds: text("vehicle_ids").array().notNull(),
  // Store complete assignment configuration as JSON
  // Format: { [vehicleId]: [{ employeeId, employeeName, role, time }] }
  assignmentData: text("assignment_data").notNull(),
  // Comments field for template notes
  comments: text("comments").notNull().default(''),
  // DEPOSITO assignments for template
  depositoAssignments: text("deposito_assignments").notNull().default('[]'),
  // Comments for DEPOSITO section in template
  depositoComments: text("deposito_comments").notNull().default(''),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roles configuration table per user
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
});

// User schemas
export const registerUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});
export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type LoginUser = z.infer<typeof loginUserSchema>;

export type User = typeof users.$inferSelect;

export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, userId: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, userId: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, userId: true });
export const insertDailyAssignmentSchema = createInsertSchema(dailyAssignments).omit({ 
  id: true, 
  userId: true,
  createdAt: true 
});
export const insertEmployeeAbsenceSchema = createInsertSchema(employeeAbsences).omit({ id: true, userId: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ 
  id: true, 
  userId: true,
  createdAt: true 
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertDailyAssignment = z.infer<typeof insertDailyAssignmentSchema>;
export type DailyAssignment = typeof dailyAssignments.$inferSelect;

export type InsertEmployeeAbsence = z.infer<typeof insertEmployeeAbsenceSchema>;
export type EmployeeAbsence = typeof employeeAbsences.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// Helper type for assignment row data
export interface AssignmentRowData {
  employeeId: string;
  employeeName: string;
  role: string;
  time: string;
}

// Helper type for deposito employee assignment
export interface DepositoEmployeeData {
  employeeId: string;
  employeeName: string;
  isEncargado: boolean;
}

// Helper type for deposito time slot
export interface DepositoTimeSlot {
  id: string;
  timeSlot: string; // e.g., "08:00-12:00"
  employees: DepositoEmployeeData[];
}
