import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  roles: text("roles").array().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  licensePlate: text("license_plate").notNull(),
});

// Daily assignment for a vehicle - structured for Excel export
export const dailyAssignments = pgTable("daily_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeeAbsences = pgTable("employee_absences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason").notNull(),
});

// Templates for reusable daily planning configurations
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  vehicleIds: text("vehicle_ids").array().notNull(),
  // Store complete assignment configuration as JSON
  // Format: { [vehicleId]: [{ employeeId, employeeName, role, time }] }
  assignmentData: text("assignment_data").notNull(),
  // Comments field for template notes
  comments: text("comments").notNull().default(''),
  // DEPOSITO assignments for template
  depositoAssignments: text("deposito_assignments").notNull().default('[]'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roles configuration table
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertDailyAssignmentSchema = createInsertSchema(dailyAssignments).omit({ 
  id: true, 
  createdAt: true 
});
export const insertEmployeeAbsenceSchema = createInsertSchema(employeeAbsences).omit({ id: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ 
  id: true, 
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
