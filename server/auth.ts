// Traditional username/password authentication
import bcrypt from "bcrypt";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const SALT_ROUNDS = 10;

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare a password with its hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Configure express-session with PostgreSQL store
export function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable must be set");
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl,
    },
  });
}

// Setup authentication session
export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

// Extend Express session to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Middleware: verifica autenticación básica (usuario logueado)
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware: verifica que el usuario esté aprobado
export const isApproved: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = req.session.userId;
    const dbUser = await storage.getUser(userId);

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!dbUser.isApproved) {
      return res.status(403).json({ message: "Account pending approval" });
    }

    next();
  } catch (error) {
    console.error("Error checking user approval:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware: verifica que el usuario sea administrador
export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = req.session.userId;
    const dbUser = await storage.getUser(userId);

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!dbUser.isApproved) {
      return res.status(403).json({ message: "Account pending approval" });
    }

    if (dbUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
