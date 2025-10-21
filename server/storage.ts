import { randomUUID } from "crypto";
import { 
  type Employee, 
  type InsertEmployee, 
  type Vehicle, 
  type InsertVehicle,
  type EmployeeAbsence,
  type InsertEmployeeAbsence,
  type DailyAssignment,
  type InsertDailyAssignment,
  type Template,
  type InsertTemplate,
  type Role,
  type InsertRole,
  type User,
  type UpsertUser,
  employees,
  vehicles,
  employeeAbsences,
  dailyAssignments,
  templates,
  roles as rolesTable,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined>;
  shouldPromoteToFirstAdmin(userId: string): Promise<boolean>;

  // Employee methods
  getEmployee(id: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Vehicle methods
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Roles methods (legacy array-based)
  getAllRoles(): Promise<string[]>;
  saveRoles(roles: string[]): Promise<string[]>;
  
  // Roles CRUD methods (individual role management)
  getRole(id: string): Promise<Role | undefined>;
  getAllRolesDetailed(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  // Employee Absence methods
  getEmployeeAbsence(id: string): Promise<EmployeeAbsence | undefined>;
  getAllAbsences(): Promise<EmployeeAbsence[]>;
  getEmployeeAbsencesByEmployeeId(employeeId: string): Promise<EmployeeAbsence[]>;
  createEmployeeAbsence(absence: InsertEmployeeAbsence): Promise<EmployeeAbsence>;
  deleteEmployeeAbsence(id: string): Promise<boolean>;

  // Daily Assignment methods
  getDailyAssignment(id: string): Promise<DailyAssignment | undefined>;
  getAllDailyAssignments(): Promise<DailyAssignment[]>;
  getDailyAssignmentsByDate(date: string): Promise<DailyAssignment[]>;
  createDailyAssignment(assignment: InsertDailyAssignment): Promise<DailyAssignment>;
  deleteDailyAssignment(id: string): Promise<boolean>;
  deleteDailyAssignmentsByDate(date: string): Promise<number>;

  // Template methods
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  deleteTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private vehicles: Map<string, Vehicle>;
  private roles: Map<string, Role>;
  private employeeAbsences: Map<string, EmployeeAbsence>;
  private dailyAssignments: Map<string, DailyAssignment>;
  private templates: Map<string, Template>;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.vehicles = new Map();
    this.roles = new Map();
    this.employeeAbsences = new Map();
    this.dailyAssignments = new Map();
    this.templates = new Map();
    
    // Initialize with default roles
    const defaultRoles = ['CHOFER', 'PEON', 'AYUDANTE', 'OPERARIO', 'SUPERVISOR'];
    defaultRoles.forEach(name => {
      const id = randomUUID();
      this.roles.set(id, { id, name });
    });
  }

  // User methods - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id || '');
    if (existing) {
      const updated: User = {
        ...existing,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(existing.id, updated);
      return updated;
    } else {
      const user: User = {
        id: userData.id || randomUUID(),
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'user',
        isApproved: userData.isApproved || false,
        requestedAt: new Date(),
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(user.id, user);
      return user;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated: User = {
      ...user,
      isApproved,
      approvedAt: isApproved ? new Date() : null,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async shouldPromoteToFirstAdmin(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || user.role === 'admin') return false;
    
    // Check if any admin exists
    const hasAdmin = Array.from(this.users.values()).some(u => u.role === 'admin');
    if (hasAdmin) return false;
    
    // Promote this user to admin
    const updated: User = {
      ...user,
      role: 'admin',
      isApproved: true,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    return true;
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { ...insertEmployee, id };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, employeeData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    const updated = { ...employee, ...employeeData };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Vehicle methods
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { ...insertVehicle, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    const updated = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updated);
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Roles methods (legacy array-based)
  async getAllRoles(): Promise<string[]> {
    return Array.from(this.roles.values()).map(r => r.name);
  }

  async saveRoles(roles: string[]): Promise<string[]> {
    // Check for duplicates in the input array (case-insensitive)
    const normalizedNames = roles.map(name => name.toLowerCase());
    const uniqueNames = new Set(normalizedNames);
    if (uniqueNames.size !== roles.length) {
      throw new Error('Duplicate role names are not allowed');
    }
    
    // Clear existing and add new roles
    this.roles.clear();
    roles.forEach(name => {
      const id = randomUUID();
      this.roles.set(id, { id, name });
    });
    return roles;
  }

  // Roles CRUD methods (individual role management)
  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getAllRolesDetailed(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    // Check for duplicate name
    const existingRole = Array.from(this.roles.values()).find(
      r => r.name.toLowerCase() === insertRole.name.toLowerCase()
    );
    if (existingRole) {
      throw new Error(`Role with name "${insertRole.name}" already exists`);
    }
    
    const id = randomUUID();
    const role: Role = { id, name: insertRole.name };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;
    
    // Check for duplicate name if name is being updated
    if (roleData.name && roleData.name !== role.name) {
      const newName = roleData.name;
      const existingRole = Array.from(this.roles.values()).find(
        r => r.id !== id && r.name.toLowerCase() === newName.toLowerCase()
      );
      if (existingRole) {
        throw new Error(`Role with name "${newName}" already exists`);
      }
    }
    
    const updated = { ...role, ...roleData };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roles.delete(id);
  }

  // Employee Absence methods
  async getEmployeeAbsence(id: string): Promise<EmployeeAbsence | undefined> {
    return this.employeeAbsences.get(id);
  }

  async getAllAbsences(): Promise<EmployeeAbsence[]> {
    return Array.from(this.employeeAbsences.values());
  }

  async getEmployeeAbsencesByEmployeeId(employeeId: string): Promise<EmployeeAbsence[]> {
    return Array.from(this.employeeAbsences.values()).filter(
      absence => absence.employeeId === employeeId
    );
  }

  async createEmployeeAbsence(insertAbsence: InsertEmployeeAbsence): Promise<EmployeeAbsence> {
    const id = randomUUID();
    const absence: EmployeeAbsence = { ...insertAbsence, id };
    this.employeeAbsences.set(id, absence);
    return absence;
  }

  async deleteEmployeeAbsence(id: string): Promise<boolean> {
    return this.employeeAbsences.delete(id);
  }

  // Daily Assignment methods
  async getDailyAssignment(id: string): Promise<DailyAssignment | undefined> {
    return this.dailyAssignments.get(id);
  }

  async getAllDailyAssignments(): Promise<DailyAssignment[]> {
    // Sort by date descending (newest first)
    return Array.from(this.dailyAssignments.values())
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getDailyAssignmentsByDate(date: string): Promise<DailyAssignment[]> {
    return Array.from(this.dailyAssignments.values())
      .filter(assignment => assignment.date === date);
  }

  async createDailyAssignment(insertAssignment: InsertDailyAssignment): Promise<DailyAssignment> {
    const id = randomUUID();
    const assignment: DailyAssignment = { 
      ...insertAssignment,
      comments: insertAssignment.comments ?? '',
      depositoAssignments: insertAssignment.depositoAssignments ?? '[]',
      id,
      createdAt: new Date()
    };
    this.dailyAssignments.set(id, assignment);
    return assignment;
  }

  async deleteDailyAssignment(id: string): Promise<boolean> {
    return this.dailyAssignments.delete(id);
  }

  async deleteDailyAssignmentsByDate(date: string): Promise<number> {
    const assignmentsToDelete = Array.from(this.dailyAssignments.values())
      .filter(assignment => assignment.date === date);
    
    assignmentsToDelete.forEach(assignment => {
      this.dailyAssignments.delete(assignment.id);
    });
    
    return assignmentsToDelete.length;
  }

  // Template methods
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    // Sort by createdAt descending (newest first)
    return Array.from(this.templates.values())
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { 
      ...insertTemplate,
      comments: insertTemplate.comments ?? '',
      depositoAssignments: insertTemplate.depositoAssignments ?? '[]',
      id,
      createdAt: new Date()
    };
    this.templates.set(id, template);
    return template;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }
}

// DatabaseStorage implementation using PostgreSQL with Drizzle ORM
// Referenced from blueprint:javascript_database
export class DatabaseStorage implements IStorage {
  // User methods - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.requestedAt));
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ 
        isApproved, 
        approvedAt: isApproved ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async shouldPromoteToFirstAdmin(userId: string): Promise<boolean> {
    // Atomically update user to admin if no other admins exist
    // This prevents race conditions where multiple users could become admin
    const result = await db.execute(
      sql`
        UPDATE ${users}
        SET role = 'admin', 
            is_approved = true, 
            approved_at = NOW(), 
            updated_at = NOW()
        WHERE id = ${userId}
          AND role != 'admin'
          AND NOT EXISTS (
            SELECT 1 FROM ${users} WHERE role = 'admin'
          )
      `
    );
    
    // Return true if a row was updated (meaning this user became the first admin)
    return (result.rowCount ?? 0) > 0;
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: string, employeeData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set(employeeData)
      .where(eq(employees.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id)).returning();
    return result.length > 0;
  }

  // Vehicle methods
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set(vehicleData)
      .where(eq(vehicles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result.length > 0;
  }

  // Roles methods (legacy array-based)
  async getAllRoles(): Promise<string[]> {
    const roleRecords = await db.select().from(rolesTable);
    return roleRecords.map(r => r.name);
  }

  async saveRoles(roles: string[]): Promise<string[]> {
    // Clear existing roles and insert new ones
    await db.delete(rolesTable);
    
    if (roles.length > 0) {
      await db.insert(rolesTable).values(
        roles.map(name => ({ name }))
      );
    }
    
    return roles;
  }

  // Roles CRUD methods (individual role management)
  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, id));
    return role || undefined;
  }

  async getAllRolesDetailed(): Promise<Role[]> {
    return await db.select().from(rolesTable);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db
      .insert(rolesTable)
      .values(insertRole)
      .returning();
    return role;
  }

  async updateRole(id: string, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const [updated] = await db
      .update(rolesTable)
      .set(roleData)
      .where(eq(rolesTable.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(rolesTable).where(eq(rolesTable.id, id)).returning();
    return result.length > 0;
  }

  // Employee Absence methods
  async getEmployeeAbsence(id: string): Promise<EmployeeAbsence | undefined> {
    const [absence] = await db.select().from(employeeAbsences).where(eq(employeeAbsences.id, id));
    return absence || undefined;
  }

  async getAllAbsences(): Promise<EmployeeAbsence[]> {
    return await db.select().from(employeeAbsences);
  }

  async getEmployeeAbsencesByEmployeeId(employeeId: string): Promise<EmployeeAbsence[]> {
    return await db.select().from(employeeAbsences).where(eq(employeeAbsences.employeeId, employeeId));
  }

  async createEmployeeAbsence(insertAbsence: InsertEmployeeAbsence): Promise<EmployeeAbsence> {
    const [absence] = await db
      .insert(employeeAbsences)
      .values(insertAbsence)
      .returning();
    return absence;
  }

  async deleteEmployeeAbsence(id: string): Promise<boolean> {
    const result = await db.delete(employeeAbsences).where(eq(employeeAbsences.id, id)).returning();
    return result.length > 0;
  }

  // Daily Assignment methods
  async getDailyAssignment(id: string): Promise<DailyAssignment | undefined> {
    const [assignment] = await db.select().from(dailyAssignments).where(eq(dailyAssignments.id, id));
    return assignment || undefined;
  }

  async getAllDailyAssignments(): Promise<DailyAssignment[]> {
    return await db.select().from(dailyAssignments).orderBy(desc(dailyAssignments.date));
  }

  async getDailyAssignmentsByDate(date: string): Promise<DailyAssignment[]> {
    return await db.select().from(dailyAssignments).where(eq(dailyAssignments.date, date));
  }

  async createDailyAssignment(insertAssignment: InsertDailyAssignment): Promise<DailyAssignment> {
    const [assignment] = await db
      .insert(dailyAssignments)
      .values(insertAssignment)
      .returning();
    return assignment;
  }

  async deleteDailyAssignment(id: string): Promise<boolean> {
    const result = await db.delete(dailyAssignments).where(eq(dailyAssignments.id, id)).returning();
    return result.length > 0;
  }

  async deleteDailyAssignmentsByDate(date: string): Promise<number> {
    const result = await db.delete(dailyAssignments).where(eq(dailyAssignments.date, date)).returning();
    return result.length;
  }

  // Template methods
  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
