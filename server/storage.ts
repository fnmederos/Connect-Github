import { randomUUID } from "crypto";
import { type Employee, type InsertEmployee, type Vehicle, type InsertVehicle } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private vehicles: Map<string, Vehicle>;
  private roles: string[];

  constructor() {
    this.employees = new Map();
    this.vehicles = new Map();
    this.roles = ['CHOFER', 'PEON', 'AYUDANTE', 'OPERARIO', 'SUPERVISOR'];
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
}

export const storage = new MemStorage();
