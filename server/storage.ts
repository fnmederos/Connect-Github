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
  type Company,
  type InsertCompany,
  type User,
  type RegisterUser,
  employees,
  vehicles,
  employeeAbsences,
  dailyAssignments,
  templates,
  roles as rolesTable,
  companies,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

// Storage interface with userId-scoped methods for multi-tenancy
export interface IStorage {
  // User methods - Traditional username/password authentication
  registerUser(userData: RegisterUser & { passwordHash: string }): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserApproval(id: string, isApproved: boolean): Promise<User | undefined>;
  updateUserPassword(id: string, passwordHash: string): Promise<User | undefined>;
  shouldPromoteToFirstAdmin(userId: string): Promise<boolean>;

  // Employee methods - scoped by userId
  getEmployee(userId: string, id: string): Promise<Employee | undefined>;
  getAllEmployees(userId: string): Promise<Employee[]>;
  createEmployee(userId: string, employee: InsertEmployee): Promise<Employee>;
  updateEmployee(userId: string, id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(userId: string, id: string): Promise<boolean>;

  // Vehicle methods - scoped by userId
  getVehicle(userId: string, id: string): Promise<Vehicle | undefined>;
  getAllVehicles(userId: string): Promise<Vehicle[]>;
  createVehicle(userId: string, vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(userId: string, id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(userId: string, id: string): Promise<boolean>;

  // Roles methods (legacy array-based) - scoped by userId
  getAllRoles(userId: string): Promise<string[]>;
  saveRoles(userId: string, roles: string[]): Promise<string[]>;
  
  // Roles CRUD methods (individual role management) - scoped by userId
  getRole(userId: string, id: string): Promise<Role | undefined>;
  getAllRolesDetailed(userId: string): Promise<Role[]>;
  createRole(userId: string, role: InsertRole): Promise<Role>;
  updateRole(userId: string, id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(userId: string, id: string): Promise<boolean>;

  // Employee Absence methods - scoped by userId
  getEmployeeAbsence(userId: string, id: string): Promise<EmployeeAbsence | undefined>;
  getAllAbsences(userId: string): Promise<EmployeeAbsence[]>;
  getEmployeeAbsencesByEmployeeId(userId: string, employeeId: string): Promise<EmployeeAbsence[]>;
  createEmployeeAbsence(userId: string, absence: InsertEmployeeAbsence): Promise<EmployeeAbsence>;
  deleteEmployeeAbsence(userId: string, id: string): Promise<boolean>;

  // Daily Assignment methods - scoped by userId
  getDailyAssignment(userId: string, id: string): Promise<DailyAssignment | undefined>;
  getAllDailyAssignments(userId: string): Promise<DailyAssignment[]>;
  getDailyAssignmentsByDate(userId: string, date: string): Promise<DailyAssignment[]>;
  createDailyAssignment(userId: string, assignment: InsertDailyAssignment): Promise<DailyAssignment>;
  updateDailyAssignment(userId: string, id: string, assignment: Partial<InsertDailyAssignment>): Promise<DailyAssignment | undefined>;
  deleteDailyAssignment(userId: string, id: string): Promise<boolean>;
  deleteDailyAssignmentsByDate(userId: string, date: string): Promise<number>;

  // Template methods - scoped by userId
  getTemplate(userId: string, id: string): Promise<Template | undefined>;
  getAllTemplates(userId: string): Promise<Template[]>;
  createTemplate(userId: string, template: InsertTemplate): Promise<Template>;
  deleteTemplate(userId: string, id: string): Promise<boolean>;

  // Company methods - scoped by userId
  getCompany(userId: string, id: string): Promise<Company | undefined>;
  getAllCompanies(userId: string): Promise<Company[]>;
  createCompany(userId: string, company: InsertCompany): Promise<Company>;
  deleteCompany(userId: string, id: string): Promise<boolean>;
  selectCompany(userId: string, companyId: string): Promise<User | undefined>;
  getSelectedCompany(userId: string): Promise<Company | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private vehicles: Map<string, Vehicle>;
  private roles: Map<string, Role>;
  private employeeAbsences: Map<string, EmployeeAbsence>;
  private dailyAssignments: Map<string, DailyAssignment>;
  private templates: Map<string, Template>;
  private companies: Map<string, Company>;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.vehicles = new Map();
    this.roles = new Map();
    this.employeeAbsences = new Map();
    this.dailyAssignments = new Map();
    this.templates = new Map();
    this.companies = new Map();
  }

  // User methods
  async registerUser(userData: RegisterUser & { passwordHash: string }): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: "user",
      isApproved: false,
      requestedAt: now,
      approvedAt: null,
      selectedCompanyId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
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

  async updateUserPassword(id: string, passwordHash: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated: User = {
      ...user,
      passwordHash,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async shouldPromoteToFirstAdmin(userId: string): Promise<boolean> {
    const hasAdmin = Array.from(this.users.values()).some(u => u.role === "admin");
    if (hasAdmin) return false;
    
    const user = this.users.get(userId);
    if (!user || user.role === "admin") return false;
    
    const updated: User = {
      ...user,
      role: "admin",
      isApproved: true,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    return true;
  }

  // Employee methods - with userId filtering
  async getEmployee(userId: string, id: string): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    return (employee && employee.userId === userId) ? employee : undefined;
  }

  async getAllEmployees(userId: string): Promise<Employee[]> {
    return Array.from(this.employees.values())
      .filter(e => e.userId === userId);
  }

  async createEmployee(userId: string, insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { 
      ...insertEmployee, 
      id, 
      userId,
      allowDuplicates: insertEmployee.allowDuplicates ?? false
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(userId: string, id: string, employeeData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee || employee.userId !== userId) return undefined;
    
    const updated = { ...employee, ...employeeData };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(userId: string, id: string): Promise<boolean> {
    const employee = this.employees.get(id);
    if (!employee || employee.userId !== userId) return false;
    return this.employees.delete(id);
  }

  // Vehicle methods - with userId filtering
  async getVehicle(userId: string, id: string): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    return (vehicle && vehicle.userId === userId) ? vehicle : undefined;
  }

  async getAllVehicles(userId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values())
      .filter(v => v.userId === userId);
  }

  async createVehicle(userId: string, insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { ...insertVehicle, id, userId };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(userId: string, id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle || vehicle.userId !== userId) return undefined;
    
    const updated = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updated);
    return updated;
  }

  async deleteVehicle(userId: string, id: string): Promise<boolean> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle || vehicle.userId !== userId) return false;
    return this.vehicles.delete(id);
  }

  // Roles methods (legacy array-based) - with userId filtering
  async getAllRoles(userId: string): Promise<string[]> {
    const roleRecords = Array.from(this.roles.values())
      .filter(r => r.userId === userId);
    return roleRecords.map(r => r.name);
  }

  async saveRoles(userId: string, roles: string[]): Promise<string[]> {
    // Delete existing roles for this user
    Array.from(this.roles.entries()).forEach(([id, role]) => {
      if (role.userId === userId) {
        this.roles.delete(id);
      }
    });
    
    // Insert new roles
    roles.forEach(name => {
      const id = randomUUID();
      this.roles.set(id, { id, userId, name });
    });
    
    return roles;
  }

  // Roles CRUD methods - with userId filtering
  async getRole(userId: string, id: string): Promise<Role | undefined> {
    const role = this.roles.get(id);
    return (role && role.userId === userId) ? role : undefined;
  }

  async getAllRolesDetailed(userId: string): Promise<Role[]> {
    return Array.from(this.roles.values())
      .filter(r => r.userId === userId);
  }

  async createRole(userId: string, insertRole: InsertRole): Promise<Role> {
    // Check for duplicate name within user's roles
    const existingRole = Array.from(this.roles.values()).find(
      r => r.userId === userId && r.name.toLowerCase() === insertRole.name.toLowerCase()
    );
    if (existingRole) {
      throw new Error(`Role with name "${insertRole.name}" already exists`);
    }
    
    const id = randomUUID();
    const role: Role = { id, userId, name: insertRole.name };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(userId: string, id: string, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const role = this.roles.get(id);
    if (!role || role.userId !== userId) return undefined;
    
    // Check for duplicate name if name is being updated
    if (roleData.name && roleData.name !== role.name) {
      const newName = roleData.name;
      const existingRole = Array.from(this.roles.values()).find(
        r => r.userId === userId && r.id !== id && r.name.toLowerCase() === newName.toLowerCase()
      );
      if (existingRole) {
        throw new Error(`Role with name "${newName}" already exists`);
      }
    }
    
    const updated = { ...role, ...roleData };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(userId: string, id: string): Promise<boolean> {
    const role = this.roles.get(id);
    if (!role || role.userId !== userId) return false;
    return this.roles.delete(id);
  }

  // Employee Absence methods - with userId filtering
  async getEmployeeAbsence(userId: string, id: string): Promise<EmployeeAbsence | undefined> {
    const absence = this.employeeAbsences.get(id);
    return (absence && absence.userId === userId) ? absence : undefined;
  }

  async getAllAbsences(userId: string): Promise<EmployeeAbsence[]> {
    return Array.from(this.employeeAbsences.values())
      .filter(a => a.userId === userId);
  }

  async getEmployeeAbsencesByEmployeeId(userId: string, employeeId: string): Promise<EmployeeAbsence[]> {
    return Array.from(this.employeeAbsences.values()).filter(
      absence => absence.userId === userId && absence.employeeId === employeeId
    );
  }

  async createEmployeeAbsence(userId: string, insertAbsence: InsertEmployeeAbsence): Promise<EmployeeAbsence> {
    const id = randomUUID();
    const absence: EmployeeAbsence = { ...insertAbsence, id, userId };
    this.employeeAbsences.set(id, absence);
    return absence;
  }

  async deleteEmployeeAbsence(userId: string, id: string): Promise<boolean> {
    const absence = this.employeeAbsences.get(id);
    if (!absence || absence.userId !== userId) return false;
    return this.employeeAbsences.delete(id);
  }

  // Daily Assignment methods - with userId filtering
  async getDailyAssignment(userId: string, id: string): Promise<DailyAssignment | undefined> {
    const assignment = this.dailyAssignments.get(id);
    return (assignment && assignment.userId === userId) ? assignment : undefined;
  }

  async getAllDailyAssignments(userId: string): Promise<DailyAssignment[]> {
    return Array.from(this.dailyAssignments.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getDailyAssignmentsByDate(userId: string, date: string): Promise<DailyAssignment[]> {
    return Array.from(this.dailyAssignments.values())
      .filter(assignment => assignment.userId === userId && assignment.date === date);
  }

  async createDailyAssignment(userId: string, insertAssignment: InsertDailyAssignment): Promise<DailyAssignment> {
    const id = randomUUID();
    const assignment: DailyAssignment = { 
      ...insertAssignment,
      userId,
      comments: insertAssignment.comments ?? '',
      loadingStatus: insertAssignment.loadingStatus ?? '',
      depositoAssignments: insertAssignment.depositoAssignments ?? '[]',
      depositoComments: insertAssignment.depositoComments ?? '',
      id,
      createdAt: new Date()
    };
    this.dailyAssignments.set(id, assignment);
    return assignment;
  }

  async updateDailyAssignment(userId: string, id: string, assignmentData: Partial<InsertDailyAssignment>): Promise<DailyAssignment | undefined> {
    const assignment = this.dailyAssignments.get(id);
    if (!assignment || assignment.userId !== userId) return undefined;
    
    const updated = { ...assignment, ...assignmentData };
    this.dailyAssignments.set(id, updated);
    return updated;
  }

  async deleteDailyAssignment(userId: string, id: string): Promise<boolean> {
    const assignment = this.dailyAssignments.get(id);
    if (!assignment || assignment.userId !== userId) return false;
    return this.dailyAssignments.delete(id);
  }

  async deleteDailyAssignmentsByDate(userId: string, date: string): Promise<number> {
    const assignmentsToDelete = Array.from(this.dailyAssignments.values())
      .filter(assignment => assignment.userId === userId && assignment.date === date);
    
    assignmentsToDelete.forEach(assignment => {
      this.dailyAssignments.delete(assignment.id);
    });
    
    return assignmentsToDelete.length;
  }

  // Template methods - with userId filtering
  async getTemplate(userId: string, id: string): Promise<Template | undefined> {
    const template = this.templates.get(id);
    return (template && template.userId === userId) ? template : undefined;
  }

  async getAllTemplates(userId: string): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async createTemplate(userId: string, insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { 
      ...insertTemplate,
      userId,
      comments: insertTemplate.comments ?? '',
      loadingStatusData: insertTemplate.loadingStatusData ?? '{}',
      depositoAssignments: insertTemplate.depositoAssignments ?? '[]',
      depositoComments: insertTemplate.depositoComments ?? '',
      id,
      createdAt: new Date()
    };
    this.templates.set(id, template);
    return template;
  }

  async deleteTemplate(userId: string, id: string): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template || template.userId !== userId) return false;
    return this.templates.delete(id);
  }

  // Company methods - with userId filtering
  async getCompany(userId: string, id: string): Promise<Company | undefined> {
    const company = this.companies.get(id);
    return (company && company.userId === userId) ? company : undefined;
  }

  async getAllCompanies(userId: string): Promise<Company[]> {
    return Array.from(this.companies.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async createCompany(userId: string, insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = { 
      ...insertCompany,
      userId,
      id,
      createdAt: new Date()
    };
    this.companies.set(id, company);
    return company;
  }

  async deleteCompany(userId: string, id: string): Promise<boolean> {
    const company = this.companies.get(id);
    if (!company || company.userId !== userId) return false;
    return this.companies.delete(id);
  }

  async selectCompany(userId: string, companyId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updated = { ...user, selectedCompanyId: companyId };
    this.users.set(userId, updated);
    return updated;
  }

  async getSelectedCompany(userId: string): Promise<Company | undefined> {
    const user = this.users.get(userId);
    if (!user || !user.selectedCompanyId) return undefined;
    
    const company = this.companies.get(user.selectedCompanyId);
    return (company && company.userId === userId) ? company : undefined;
  }
}

// DatabaseStorage implementation using PostgreSQL with Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User methods
  async registerUser(userData: RegisterUser & { passwordHash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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

  async updateUserPassword(id: string, passwordHash: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ 
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async shouldPromoteToFirstAdmin(userId: string): Promise<boolean> {
    // Atomically update user to admin if no other admins exist
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
    
    return (result.rowCount ?? 0) > 0;
  }

  // Employee methods - with userId filtering
  async getEmployee(userId: string, id: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.userId, userId)));
    return employee || undefined;
  }

  async getAllEmployees(userId: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.userId, userId));
  }

  async createEmployee(userId: string, insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values({ ...insertEmployee, userId })
      .returning();
    return employee;
  }

  async updateEmployee(userId: string, id: string, employeeData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set(employeeData)
      .where(and(eq(employees.id, id), eq(employees.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteEmployee(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(employees)
      .where(and(eq(employees.id, id), eq(employees.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Vehicle methods - with userId filtering
  async getVehicle(userId: string, id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
    return vehicle || undefined;
  }

  async getAllVehicles(userId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  async createVehicle(userId: string, insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values({ ...insertVehicle, userId })
      .returning();
    return vehicle;
  }

  async updateVehicle(userId: string, id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set(vehicleData)
      .where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteVehicle(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Roles methods (legacy array-based) - with userId filtering
  async getAllRoles(userId: string): Promise<string[]> {
    const roleRecords = await db.select().from(rolesTable).where(eq(rolesTable.userId, userId));
    return roleRecords.map(r => r.name);
  }

  async saveRoles(userId: string, roles: string[]): Promise<string[]> {
    // Clear existing roles for this user and insert new ones
    await db.delete(rolesTable).where(eq(rolesTable.userId, userId));
    
    if (roles.length > 0) {
      await db.insert(rolesTable).values(
        roles.map(name => ({ name, userId }))
      );
    }
    
    return roles;
  }

  // Roles CRUD methods - with userId filtering
  async getRole(userId: string, id: string): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(rolesTable)
      .where(and(eq(rolesTable.id, id), eq(rolesTable.userId, userId)));
    return role || undefined;
  }

  async getAllRolesDetailed(userId: string): Promise<Role[]> {
    return await db.select().from(rolesTable).where(eq(rolesTable.userId, userId));
  }

  async createRole(userId: string, insertRole: InsertRole): Promise<Role> {
    const [role] = await db
      .insert(rolesTable)
      .values({ ...insertRole, userId })
      .returning();
    return role;
  }

  async updateRole(userId: string, id: string, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const [updated] = await db
      .update(rolesTable)
      .set(roleData)
      .where(and(eq(rolesTable.id, id), eq(rolesTable.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteRole(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(rolesTable)
      .where(and(eq(rolesTable.id, id), eq(rolesTable.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Employee Absence methods - with userId filtering
  async getEmployeeAbsence(userId: string, id: string): Promise<EmployeeAbsence | undefined> {
    const [absence] = await db
      .select()
      .from(employeeAbsences)
      .where(and(eq(employeeAbsences.id, id), eq(employeeAbsences.userId, userId)));
    return absence || undefined;
  }

  async getAllAbsences(userId: string): Promise<EmployeeAbsence[]> {
    return await db.select().from(employeeAbsences).where(eq(employeeAbsences.userId, userId));
  }

  async getEmployeeAbsencesByEmployeeId(userId: string, employeeId: string): Promise<EmployeeAbsence[]> {
    return await db
      .select()
      .from(employeeAbsences)
      .where(and(eq(employeeAbsences.employeeId, employeeId), eq(employeeAbsences.userId, userId)));
  }

  async createEmployeeAbsence(userId: string, insertAbsence: InsertEmployeeAbsence): Promise<EmployeeAbsence> {
    const [absence] = await db
      .insert(employeeAbsences)
      .values({ ...insertAbsence, userId })
      .returning();
    return absence;
  }

  async deleteEmployeeAbsence(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(employeeAbsences)
      .where(and(eq(employeeAbsences.id, id), eq(employeeAbsences.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Daily Assignment methods - with userId filtering
  async getDailyAssignment(userId: string, id: string): Promise<DailyAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(dailyAssignments)
      .where(and(eq(dailyAssignments.id, id), eq(dailyAssignments.userId, userId)));
    return assignment || undefined;
  }

  async getAllDailyAssignments(userId: string): Promise<DailyAssignment[]> {
    return await db
      .select()
      .from(dailyAssignments)
      .where(eq(dailyAssignments.userId, userId))
      .orderBy(desc(dailyAssignments.date));
  }

  async getDailyAssignmentsByDate(userId: string, date: string): Promise<DailyAssignment[]> {
    return await db
      .select()
      .from(dailyAssignments)
      .where(and(eq(dailyAssignments.date, date), eq(dailyAssignments.userId, userId)));
  }

  async createDailyAssignment(userId: string, insertAssignment: InsertDailyAssignment): Promise<DailyAssignment> {
    const [assignment] = await db
      .insert(dailyAssignments)
      .values({ ...insertAssignment, userId })
      .returning();
    return assignment;
  }

  async updateDailyAssignment(userId: string, id: string, assignmentData: Partial<InsertDailyAssignment>): Promise<DailyAssignment | undefined> {
    const [updated] = await db
      .update(dailyAssignments)
      .set(assignmentData)
      .where(and(eq(dailyAssignments.id, id), eq(dailyAssignments.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteDailyAssignment(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(dailyAssignments)
      .where(and(eq(dailyAssignments.id, id), eq(dailyAssignments.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async deleteDailyAssignmentsByDate(userId: string, date: string): Promise<number> {
    const result = await db
      .delete(dailyAssignments)
      .where(and(eq(dailyAssignments.date, date), eq(dailyAssignments.userId, userId)))
      .returning();
    return result.length;
  }

  // Template methods - with userId filtering
  async getTemplate(userId: string, id: string): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)));
    return template || undefined;
  }

  async getAllTemplates(userId: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(desc(templates.createdAt));
  }

  async createTemplate(userId: string, insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values({ ...insertTemplate, userId })
      .returning();
    return template;
  }

  async deleteTemplate(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Company methods - with userId filtering
  async getCompany(userId: string, id: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)));
    return company || undefined;
  }

  async getAllCompanies(userId: string): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .orderBy(desc(companies.createdAt));
  }

  async createCompany(userId: string, insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values({ ...insertCompany, userId })
      .returning();
    return company;
  }

  async deleteCompany(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async selectCompany(userId: string, companyId: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ selectedCompanyId: companyId })
      .where(eq(users.id, userId))
      .returning();
    return updated || undefined;
  }

  async getSelectedCompany(userId: string): Promise<Company | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.selectedCompanyId) {
      return undefined;
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, user.selectedCompanyId), eq(companies.userId, userId)));
    
    return company || undefined;
  }
}

export const storage = new DatabaseStorage();
