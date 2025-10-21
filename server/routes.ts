import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, isAuthenticated, isApproved, isAdmin } from "./auth";
import { 
  insertEmployeeAbsenceSchema, 
  insertDailyAssignmentSchema,
  insertEmployeeSchema,
  insertVehicleSchema,
  insertTemplateSchema,
  insertRoleSchema,
  registerUserSchema,
  loginUserSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================================================
  // Authentication Routes (public)
  // ============================================================================
  
  // Register a new user
  app.post("/api/register", async (req, res) => {
    try {
      const result = registerUserSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash password
      const passwordHash = await hashPassword(result.data.password);

      // Create user
      const user = await storage.registerUser({
        username: result.data.username,
        email: result.data.email,
        password: result.data.password,
        passwordHash,
      });

      // Check if this should be the first admin
      await storage.shouldPromoteToFirstAdmin(user.id);

      // Get updated user (may now be admin)
      const updatedUser = await storage.getUser(user.id);

      // Auto-login the user
      req.session.userId = user.id;

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          role: updatedUser!.role,
          isApproved: updatedUser!.isApproved,
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Login with username and password
  app.post("/api/login", async (req, res) => {
    try {
      const result = loginUserSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      // Find user by username
      const user = await storage.getUserByUsername(result.data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Verify password
      const isValid = await comparePassword(result.data.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user info
  app.get("/api/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // Admin Routes - User Management
  // ============================================================================
  
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

  // ============================================================================
  // Employee Routes (protected - scoped by userId)
  // ============================================================================
  
  app.get("/api/employees", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const employees = await storage.getAllEmployees(userId);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/employees", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertEmployeeSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const employee = await storage.createEmployee(userId, result.data);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/employees/:id", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;
      const result = insertEmployeeSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const employee = await storage.updateEmployee(userId, id, result.data);
      
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
      const userId = req.session.userId!;
      const { id } = req.params;
      const deleted = await storage.deleteEmployee(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // Vehicle Routes (protected - scoped by userId)
  // ============================================================================
  
  app.get("/api/vehicles", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const vehicles = await storage.getAllVehicles(userId);
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vehicles", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertVehicleSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const vehicle = await storage.createVehicle(userId, result.data);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/vehicles/:id", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;
      const result = insertVehicleSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const vehicle = await storage.updateVehicle(userId, id, result.data);
      
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
      const userId = req.session.userId!;
      const { id } = req.params;
      const deleted = await storage.deleteVehicle(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // Roles Routes (protected - scoped by userId)
  // ============================================================================
  
  app.get("/api/roles", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const roles = await storage.getAllRoles(userId);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roles", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { roles } = req.body;
      
      if (!Array.isArray(roles)) {
        return res.status(400).json({ message: "Roles must be an array" });
      }
      
      const updatedRoles = await storage.saveRoles(userId, roles);
      res.json(updatedRoles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Individual Role CRUD routes (protected - scoped by userId)
  app.get("/api/roles-detailed", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const roles = await storage.getAllRolesDetailed(userId);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roles-detailed", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertRoleSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const role = await storage.createRole(userId, result.data);
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
      const userId = req.session.userId!;
      const { id } = req.params;
      const result = insertRoleSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const role = await storage.updateRole(userId, id, result.data);
      
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
      const userId = req.session.userId!;
      const { id } = req.params;
      const deleted = await storage.deleteRole(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // Daily Assignments Routes (protected - scoped by userId)
  // ============================================================================
  
  app.get("/api/daily-assignments", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const date = req.query.date as string | undefined;
      
      if (date) {
        const assignments = await storage.getDailyAssignmentsByDate(userId, date);
        res.json(assignments);
      } else {
        // Get all assignments (for history view)
        const assignments = await storage.getAllDailyAssignments(userId);
        res.json(assignments);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/daily-assignments", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertDailyAssignmentSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const assignment = await storage.createDailyAssignment(userId, result.data);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/daily-assignments/:id", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;
      const deleted = await storage.deleteDailyAssignment(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Daily assignment not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/daily-assignments/by-date/:date", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { date } = req.params;
      const count = await storage.deleteDailyAssignmentsByDate(userId, date);
      res.json({ message: `Deleted ${count} assignments` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // Employee Absences Routes (protected - scoped by userId)
  // ============================================================================
  
  app.get("/api/absences", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const absences = await storage.getAllAbsences(userId);
      res.json(absences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/absences/employee/:employeeId", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { employeeId } = req.params;
      const absences = await storage.getEmployeeAbsencesByEmployeeId(userId, employeeId);
      res.json(absences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/absences", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertEmployeeAbsenceSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const absence = await storage.createEmployeeAbsence(userId, result.data);
      res.status(201).json(absence);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/absences/:id", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;
      const deleted = await storage.deleteEmployeeAbsence(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Absence not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // Templates Routes (protected - scoped by userId)
  // ============================================================================
  
  app.get("/api/templates", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const templates = await storage.getAllTemplates(userId);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/templates", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertTemplateSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ message: errorMessage });
      }

      const template = await storage.createTemplate(userId, result.data);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/templates/:id", isApproved, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;
      const deleted = await storage.deleteTemplate(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return createServer(app);
}
