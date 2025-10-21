import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isApproved, isAdmin } from "./replitAuth";
import { 
  insertEmployeeAbsenceSchema, 
  insertDailyAssignmentSchema,
  insertEmployeeSchema,
  insertVehicleSchema,
  insertTemplateSchema,
  insertRoleSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth status route (public)
  app.get("/api/auth/status", isAuthenticated, async (req, res) => {
    try {
      const sessionUser = req.user as any;
      const userId = sessionUser?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ authenticated: false });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ authenticated: true, user: null });
      }

      res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          isApproved: user.isApproved,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes - user management
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/approve-user/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUserApproval(id, true);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/reject-user/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUserApproval(id, false);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employee routes (protected - requires approved user)
  app.get("/api/employees", isApproved, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/employees", isApproved, async (req, res) => {
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

  app.put("/api/employees/:id", isApproved, async (req, res) => {
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

  app.delete("/api/employees/:id", isApproved, async (req, res) => {
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

  // Vehicle routes (protected)
  app.get("/api/vehicles", isApproved, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vehicles", isApproved, async (req, res) => {
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

  app.put("/api/vehicles/:id", isApproved, async (req, res) => {
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

  app.delete("/api/vehicles/:id", isApproved, async (req, res) => {
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

  // Roles routes (protected)
  app.get("/api/roles", isApproved, async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roles", isApproved, async (req, res) => {
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

  // Individual Role CRUD routes (protected)
  app.get("/api/roles-detailed", isApproved, async (req, res) => {
    try {
      const roles = await storage.getAllRolesDetailed();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roles-detailed", isApproved, async (req, res) => {
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

  app.put("/api/roles-detailed/:id", isApproved, async (req, res) => {
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

  app.delete("/api/roles-detailed/:id", isApproved, async (req, res) => {
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

  // Daily Assignments routes (protected)
  app.get("/api/daily-assignments", isApproved, async (req, res) => {
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

  app.post("/api/daily-assignments", isApproved, async (req, res) => {
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

  app.delete("/api/daily-assignments/:id", isApproved, async (req, res) => {
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

  app.delete("/api/daily-assignments/by-date/:date", isApproved, async (req, res) => {
    try {
      const { date } = req.params;
      const deletedCount = await storage.deleteDailyAssignmentsByDate(date);
      
      res.status(200).json({ deletedCount });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employee Absences routes (protected)
  app.get("/api/absences", isApproved, async (req, res) => {
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

  app.post("/api/absences", isApproved, async (req, res) => {
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

  app.delete("/api/absences/:id", isApproved, async (req, res) => {
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

  // Template routes (protected)
  app.get("/api/templates", isApproved, async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/templates", isApproved, async (req, res) => {
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

  app.delete("/api/templates/:id", isApproved, async (req, res) => {
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
