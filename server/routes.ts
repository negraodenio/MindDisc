import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, insertCompanySchema, loginSchema, insertDiscAssessmentSchema, insertMentalHealthAssessmentSchema, insertPsychosocialRiskSchema, insertActionPlanSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "minddisc-pro-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const token = jwt.sign(
        { userId: user.id, companyId: user.companyId },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = jwt.sign(
        { userId: user.id, companyId: user.companyId },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar usuário" });
    }
  });

  // Company routes
  app.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar empresa" });
    }
  });

  app.get("/api/companies/:id", authenticateToken, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User routes
  app.get("/api/users/me", authenticateToken, async (req, res) => {
    res.json(req.user);
  });

  app.get("/api/users/company/:companyId", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsersByCompany(req.params.companyId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics/:companyId", authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.params.companyId);
      const complianceScore = await storage.getComplianceScore(req.params.companyId);
      
      res.json({
        ...metrics,
        complianceScore
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar métricas" });
    }
  });

  // DISC Assessment routes
  app.post("/api/assessments/disc", authenticateToken, async (req, res) => {
    try {
      const assessmentData = insertDiscAssessmentSchema.parse(req.body);
      const assessment = await storage.createDiscAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar avaliação DISC" });
    }
  });

  app.get("/api/assessments/disc/user/:userId", authenticateToken, async (req, res) => {
    try {
      const assessments = await storage.getDiscAssessmentsByUser(req.params.userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar avaliações DISC" });
    }
  });

  app.get("/api/assessments/disc/company/:companyId", authenticateToken, async (req, res) => {
    try {
      const assessments = await storage.getDiscAssessmentsByCompany(req.params.companyId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar avaliações DISC" });
    }
  });

  app.get("/api/assessments/disc/latest/:userId", authenticateToken, async (req, res) => {
    try {
      const assessment = await storage.getLatestDiscAssessment(req.params.userId);
      if (!assessment) {
        return res.status(404).json({ message: "Nenhuma avaliação DISC encontrada" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar avaliação DISC" });
    }
  });

  // Mental Health Assessment routes
  app.post("/api/assessments/mental-health", authenticateToken, async (req, res) => {
    try {
      const assessmentData = insertMentalHealthAssessmentSchema.parse(req.body);
      const assessment = await storage.createMentalHealthAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar avaliação de saúde mental" });
    }
  });

  app.get("/api/assessments/mental-health/user/:userId", authenticateToken, async (req, res) => {
    try {
      const assessments = await storage.getMentalHealthAssessmentsByUser(req.params.userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar avaliações de saúde mental" });
    }
  });

  app.get("/api/assessments/mental-health/company/:companyId", authenticateToken, async (req, res) => {
    try {
      const assessments = await storage.getMentalHealthAssessmentsByCompany(req.params.companyId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar avaliações de saúde mental" });
    }
  });

  // Psychosocial Risks routes
  app.post("/api/risks/psychosocial", authenticateToken, async (req, res) => {
    try {
      const riskData = insertPsychosocialRiskSchema.parse(req.body);
      const risk = await storage.createPsychosocialRisk(riskData);
      res.status(201).json(risk);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar risco psicossocial" });
    }
  });

  app.get("/api/risks/psychosocial/company/:companyId", authenticateToken, async (req, res) => {
    try {
      const risks = await storage.getPsychosocialRisksByCompany(req.params.companyId);
      res.json(risks);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar riscos psicossociais" });
    }
  });

  app.put("/api/risks/psychosocial/:id", authenticateToken, async (req, res) => {
    try {
      const risk = await storage.updatePsychosocialRisk(req.params.id, req.body);
      res.json(risk);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar risco psicossocial" });
    }
  });

  // Action Plans routes
  app.post("/api/action-plans", authenticateToken, async (req, res) => {
    try {
      const planData = insertActionPlanSchema.parse(req.body);
      const plan = await storage.createActionPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar plano de ação" });
    }
  });

  app.get("/api/action-plans/company/:companyId", authenticateToken, async (req, res) => {
    try {
      const plans = await storage.getActionPlansByCompany(req.params.companyId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar planos de ação" });
    }
  });

  app.put("/api/action-plans/:id", authenticateToken, async (req, res) => {
    try {
      const plan = await storage.updateActionPlan(req.params.id, req.body);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar plano de ação" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/user/:userId", authenticateToken, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar notificações" });
    }
  });

  app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Erro ao marcar notificação como lida" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
