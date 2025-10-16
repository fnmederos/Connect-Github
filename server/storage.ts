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
  type InsertTemplate
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
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

  // Roles methods
  getAllRoles(): Promise<string[]>;
  saveRoles(roles: string[]): Promise<string[]>;

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

  // Template methods
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  deleteTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private vehicles: Map<string, Vehicle>;
  private roles: string[];
  private employeeAbsences: Map<string, EmployeeAbsence>;
  private dailyAssignments: Map<string, DailyAssignment>;
  private templates: Map<string, Template>;

  constructor() {
    this.employees = new Map();
    this.vehicles = new Map();
    this.roles = ['CHOFER', 'PEON', 'AYUDANTE', 'OPERARIO', 'SUPERVISOR'];
    this.employeeAbsences = new Map();
    this.dailyAssignments = new Map();
    this.templates = new Map();
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

  // Roles methods
  async getAllRoles(): Promise<string[]> {
    return [...this.roles];
  }

  async saveRoles(roles: string[]): Promise<string[]> {
    this.roles = [...roles];
    return this.roles;
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
      id,
      createdAt: new Date()
    };
    this.dailyAssignments.set(id, assignment);
    return assignment;
  }

  async deleteDailyAssignment(id: string): Promise<boolean> {
    return this.dailyAssignments.delete(id);
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

export const storage = new MemStorage();
