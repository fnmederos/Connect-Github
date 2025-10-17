import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEmployeeAbsenceSchema, 
  insertDailyAssignmentSchema,
  insertEmployeeSchema,
  insertVehicleSchema,
  insertTemplateSchema,
  insertRoleSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const result = insertEmployeeSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const employee = await storage.createEmployee(result.data);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertEmployeeSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const employee = await storage.updateEmployee(id, result.data);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEmployee(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const result = insertVehicleSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const vehicle = await storage.createVehicle(result.data);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertVehicleSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const vehicle = await storage.updateVehicle(id, result.data);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteVehicle(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Roles routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const { roles } = req.body;
      
      if (!Array.isArray(roles)) {
        return res.status(400).json({ message: "Roles must be an array" });
      }
      
      const updatedRoles = await storage.saveRoles(roles);
      res.json(updatedRoles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Individual Role CRUD routes
  app.get("/api/roles-detailed", async (req, res) => {
    try {
      const roles = await storage.getAllRolesDetailed();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roles-detailed", async (req, res) => {
    try {
      const result = insertRoleSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const role = await storage.createRole(result.data);
      res.status(201).json(role);
    } catch (error: any) {
      // Handle duplicate role errors
      if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('unique')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/roles-detailed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertRoleSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const role = await storage.updateRole(id, result.data);
      
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.json(role);
    } catch (error: any) {
      // Handle duplicate role errors
      if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('unique')) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/roles-detailed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRole(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Daily Assignments routes
  app.get("/api/daily-assignments", async (req, res) => {
    try {
      const date = req.query.date as string | undefined;
      
      if (date) {
        const assignments = await storage.getDailyAssignmentsByDate(date);
        res.json(assignments);
      } else {
        // Get all assignments (for history view)
        const assignments = await storage.getAllDailyAssignments();
        res.json(assignments);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/daily-assignments", async (req, res) => {
    try {
      const result = insertDailyAssignmentSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const assignment = await storage.createDailyAssignment(result.data);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/daily-assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDailyAssignment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employee Absences routes
  app.get("/api/absences", async (req, res) => {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      
      if (employeeId) {
        const absences = await storage.getEmployeeAbsencesByEmployeeId(employeeId);
        res.json(absences);
      } else {
        // Get all absences
        const absences = await storage.getAllAbsences();
        res.json(absences);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/absences", async (req, res) => {
    try {
      const result = insertEmployeeAbsenceSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const absence = await storage.createEmployeeAbsence(result.data);
      res.status(201).json(absence);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/absences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEmployeeAbsence(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Absence not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const result = insertTemplateSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const template = await storage.createTemplate(result.data);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTemplate(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Template not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
