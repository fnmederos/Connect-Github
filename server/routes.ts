import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeAbsenceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
