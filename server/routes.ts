import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCompanySchema, 
  loginSchema, 
  insertDiscAssessmentSchema, 
  insertMentalHealthAssessmentSchema, 
  insertPsychosocialRiskSchema, 
  insertActionPlanSchema, 
  susEstablishmentSearchSchema,
  susServiceSearchSchema,
  susAvailabilityCheckSchema,
  inssConsultationSchema,
  inssEligibilitySchema,
  siafiExpenseSearchSchema,
  rapsServiceSearchSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

// Define PublicUser type for secure API responses (never expose password hash or sensitive data)
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
};

// Helper function to sanitize user data for API responses
const sanitizeUser = (user: User): PublicUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "employee", // Handle nullable role field with default
    companyId: user.companyId
  };
};

const JWT_SECRET = process.env.JWT_SECRET || "minddisc-dev-secret";
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET environment variable is required for security");
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
  console.warn("Using development JWT secret - NOT SECURE FOR PRODUCTION");
}

// Extend Request interface to include sanitized user data
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware to verify JWT token
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export async function registerRoutes(app: Express): Promise<Express> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

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
  app.get("/api/users/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    res.json(sanitizeUser(req.user));
  });

  app.get("/api/users/company/:companyId", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsersByCompany(req.params.companyId);
      // Sanitize all user data to remove password hashes and sensitive data
      const sanitizedUsers = users.map(user => sanitizeUser(user));
      res.json(sanitizedUsers);
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

  // =============================================================================
  // GOVERNMENT API INTEGRATIONS - SUS/INSS/SIAFI/RAPS
  // =============================================================================

  // SUS (Sistema Único de Saúde) Integration Routes
  app.post("/api/government/sus/estabelecimentos", authenticateToken, async (req, res) => {
    try {
      const { cep, tipo, raio_km } = susEstablishmentSearchSchema.parse(req.body);
      
      // Mock data simulating SUS/CNES API response
      const estabelecimentos_mock = [
        {
          cnes: "2269311",
          nome: "CAPS AD Central",
          tipo: "CAPS",
          subtipo: "CAPS AD",
          endereco: {
            logradouro: "Rua das Flores, 123",
            bairro: "Centro",
            municipio: "São Paulo",
            uf: "SP",
            cep: "01234-567"
          },
          telefone: "(11) 3333-4444",
          email: "caps.central@sus.sp.gov.br",
          horario_funcionamento: {
            segunda_sexta: "08:00-18:00",
            sabado: "08:00-12:00",
            domingo: "Fechado"
          },
          servicos_disponiveis: [
            "Atendimento psicológico",
            "Atendimento psiquiátrico",
            "Terapia ocupacional",
            "Grupos terapêuticos",
            "Atendimento para dependência química"
          ],
          capacidade_atendimento: 50,
          distancia_km: 2.3,
          status: "ativo",
          ultima_atualizacao: "2024-01-15"
        },
        {
          cnes: "2269312",
          nome: "UBS Vila Madalena",
          tipo: "UBS",
          subtipo: "Unidade Básica de Saúde",
          endereco: {
            logradouro: "Av. Paulista, 456",
            bairro: "Vila Madalena",
            municipio: "São Paulo",
            uf: "SP",
            cep: "01234-568"
          },
          telefone: "(11) 3333-5555",
          email: "ubs.madalena@sus.sp.gov.br",
          horario_funcionamento: {
            segunda_sexta: "07:00-17:00",
            sabado: "07:00-12:00",
            domingo: "Fechado"
          },
          servicos_disponiveis: [
            "Clínica médica",
            "Psicologia básica",
            "Enfermagem",
            "Vacinação",
            "Encaminhamentos especializados"
          ],
          capacidade_atendimento: 100,
          distancia_km: 5.1,
          status: "ativo",
          ultima_atualizacao: "2024-01-15"
        }
      ];

      res.json({
        success: true,
        query: { cep, tipo, raio_km },
        estabelecimentos: estabelecimentos_mock.filter(est => 
          tipo === "todos" || est.tipo === tipo
        ),
        total_encontrados: estabelecimentos_mock.length,
        consultado_em: new Date().toISOString(),
        fonte: "SUS/CNES"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro na busca de estabelecimentos SUS",
        error: error instanceof z.ZodError ? error.errors : "Erro interno"
      });
    }
  });

  app.get("/api/government/sus/raps-servicos", authenticateToken, async (req, res) => {
    try {
      const municipio = req.query.municipio as string || "São Paulo";
      const tipo_servico = req.query.tipo as string || "";
      
      const servicos_mock = [
        {
          id: "raps-001",
          nome: "CAPS III Norte",
          tipo: "CAPS III",
          endereco: "Rua da Saúde Mental, 100 - Santana, São Paulo",
          telefone: "(11) 3333-7777",
          capacidade_diaria: 60,
          funciona_24h: true,
          especialidades: ["Psiquiatria", "Psicologia", "Terapia Ocupacional", "Assistência Social"],
          distancia_km: 3.2,
          disponibilidade_leitos: 8
        },
        {
          id: "raps-002", 
          nome: "Residência Terapêutica Casa Esperança",
          tipo: "SRT",
          endereco: "Av. da Inclusão, 250 - Vila Mariana, São Paulo", 
          telefone: "(11) 3333-8888",
          capacidade_diaria: 12,
          funciona_24h: true,
          especialidades: ["Reabilitação Psicossocial", "Acompanhamento Terapêutico"],
          distancia_km: 7.5,
          vagas_disponiveis: 2
        }
      ];

      res.json({
        success: true,
        municipio,
        tipo_servico,
        servicos: tipo_servico ? servicos_mock.filter(s => s.tipo === tipo_servico) : servicos_mock,
        total_servicos: servicos_mock.length,
        consultado_em: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro na consulta de serviços RAPS",
        error: "Erro interno"
      });
    }
  });

  app.post("/api/government/sus/disponibilidade-atendimento", authenticateToken, async (req, res) => {
    try {
      const { cnes, tipo_atendimento } = susAvailabilityCheckSchema.parse(req.body);
      
      const disponibilidade_mock = {
        cnes,
        estabelecimento: "CAPS AD Central",
        tipo_atendimento,
        disponibilidade: {
          proximos_dias: [
            { data: "2024-09-11", horarios_disponiveis: ["09:00", "14:00", "16:30"] },
            { data: "2024-09-12", horarios_disponiveis: ["08:30", "10:00", "15:00"] },
            { data: "2024-09-13", horarios_disponiveis: ["09:30", "11:00"] }
          ],
          tempo_espera_estimado: "5-7 dias",
          preferencia_agendamento: "Ligar para (11) 3333-4444"
        }
      };

      res.json({
        success: true,
        ...disponibilidade_mock,
        consultado_em: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro na verificação de disponibilidade",
        error: error instanceof z.ZodError ? error.errors : "Erro interno"
      });
    }
  });

  // INSS (Instituto Nacional do Seguro Social) Integration Routes
  app.post("/api/government/inss/consultar-beneficios", authenticateToken, async (req, res) => {
    try {
      const { cpf } = inssConsultationSchema.parse(req.body);
      
      // Mock INSS data (sensitive data masked)
      const beneficios_mock = {
        cpf: cpf.substring(0, 3) + ".***.***-**",
        nome_segurado: "SEGURADO EXEMPLO",
        situacao_cadastral: "ativo",
        beneficios_ativos: [
          {
            numero_beneficio: "123456789",
            tipo: "auxilio_doenca",
            codigo_especie: "B31",
            descricao: "Auxílio-Doença Previdenciário",
            data_inicio: "2024-01-15",
            data_cessacao: null,
            valor_mensal: 2500.00,
            status: "ativo",
            cid: "F32.9",
            medico_perito: "Dr. José Silva - CRM 123456",
            proxima_pericia: "2024-07-15",
            banco_pagamento: "Banco do Brasil",
            agencia: "1234-5",
            conta: "12345-6"
          }
        ],
        contribuicoes: {
          tempo_contribuicao_anos: 15,
          tempo_contribuicao_meses: 180,
          ultima_contribuicao: "2024-01-01",
          salario_contribuicao_atual: 4500.00,
          media_salarios_contribuicao: 3800.00
        }
      };

      res.json({
        success: true,
        dados_beneficiario: beneficios_mock,
        consultado_em: new Date().toISOString(),
        fonte: "INSS/DATAPREV"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro na consulta de benefícios INSS",
        error: error instanceof z.ZodError ? error.errors : "Erro interno"
      });
    }
  });

  app.post("/api/government/inss/verificar-elegibilidade", authenticateToken, async (req, res) => {
    try {
      const { cpf, tempo_contribuicao_meses, salario_atual, cid } = inssEligibilitySchema.parse(req.body);
      
      const analise_elegibilidade = {
        cpf: cpf.substring(0, 3) + ".***.***-**",
        criterios_avaliados: {
          carencia_minima: {
            necessario: 12,
            atual: tempo_contribuicao_meses,
            atende: tempo_contribuicao_meses >= 12
          },
          incapacidade_temporaria: {
            cid_informado: cid || "Não informado",
            elegivel_auxilio_doenca: cid ? true : false
          },
          salario_beneficio: {
            salario_atual,
            valor_estimado_auxilio: Math.min(salario_atual * 0.91, 7507.49)
          }
        },
        recomendacao: tempo_contribuicao_meses >= 12 
          ? "Elegível para auxílio-doença. Procure perícia médica."
          : "Necessário completar carência mínima de 12 contribuições."
      };

      res.json({
        success: true,
        analise_elegibilidade,
        consultado_em: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro na verificação de elegibilidade",
        error: error instanceof z.ZodError ? error.errors : "Erro interno"
      });
    }
  });

  // SIAFI (Sistema Integrado de Administração Financeira) Integration Routes
  app.post("/api/government/siafi/consultar-gastos-saude-mental", authenticateToken, async (req, res) => {
    try {
      const { ente_federativo, ano } = siafiExpenseSearchSchema.parse(req.body);
      
      const gastos_mock = {
        ente_federativo,
        ano_referencia: ano,
        resumo_execucao: {
          dotacao_inicial: 150000000.00,
          dotacao_atualizada: 165000000.00,
          valor_empenhado: 142000000.00,
          valor_liquidado: 138000000.00,
          valor_pago: 135000000.00,
          percentual_execucao: 86.1
        },
        programas_saude_mental: [
          {
            codigo_programa: "2015",
            nome_programa: "Fortalecimento do Sistema Único de Saúde",
            acao: "Atenção à Saúde da População para Procedimentos de Média e Alta Complexidade",
            valor_empenhado: 85000000.00,
            valor_pago: 80000000.00
          },
          {
            codigo_programa: "2015",
            nome_programa: "Fortalecimento do Sistema Único de Saúde",
            acao: "Atenção Básica em Saúde", 
            valor_empenhado: 35000000.00,
            valor_pago: 33500000.00
          }
        ],
        investimentos_caps: {
          construcao_novos_caps: {
            valor_empenhado: 12000000.00,
            unidades_previstas: 8,
            unidades_entregues: 5
          },
          reforma_caps_existentes: {
            valor_empenhado: 5000000.00,
            unidades_reformadas: 15
          }
        }
      };

      res.json({
        success: true,
        dados_transparencia: gastos_mock,
        consultado_em: new Date().toISOString(),
        fonte: "SIAFI/Portal da Transparência"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro na consulta de gastos públicos",
        error: error instanceof z.ZodError ? error.errors : "Erro interno"
      });
    }
  });

  // RAPS (Rede de Atenção Psicossocial) Integration Routes
  app.post("/api/government/raps/buscar-servicos", authenticateToken, async (req, res) => {
    try {
      const { municipio, tipo_servico, urgencia } = rapsServiceSearchSchema.parse(req.body);
      
      const servicos_raps = [
        {
          id: "raps-caps-01",
          nome: "CAPS II Centro",
          tipo: "CAPS II",
          endereco: {
            logradouro: "Rua da Mente Sã, 456",
            bairro: "Centro",
            municipio,
            cep: "01000-000"
          },
          telefone: "(11) 1111-2222",
          especialidades: ["Psiquiatria", "Psicologia", "Terapia Ocupacional"],
          horario_funcionamento: "Segunda a Sexta: 8h-18h",
          aceita_urgencia: urgencia,
          tempo_espera_dias: urgencia ? 0 : 15,
          disponibilidade_imediata: urgencia
        },
        {
          id: "raps-upa-01", 
          nome: "UPA 24h São João",
          tipo: "UPA",
          endereco: {
            logradouro: "Av. Emergência, 789",
            bairro: "São João",
            municipio,
            cep: "01000-001"
          },
          telefone: "(11) 2222-3333",
          especialidades: ["Psiquiatria de Emergência", "Clínica Médica"],
          horario_funcionamento: "24 horas",
          aceita_urgencia: true,
          tempo_espera_dias: 0,
          disponibilidade_imediata: true
        }
      ];

      const servicos_filtrados = servicos_raps.filter(servico => {
        if (tipo_servico && servico.tipo !== tipo_servico) return false;
        if (urgencia && !servico.aceita_urgencia) return false;
        return true;
      });

      res.json({
        success: true,
        criterios_busca: { municipio, tipo_servico, urgencia },
        servicos_encontrados: servicos_filtrados,
        total_servicos: servicos_filtrados.length,
        consultado_em: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro na busca de serviços RAPS",
        error: error instanceof z.ZodError ? error.errors : "Erro interno"
      });
    }
  });

  // Don't create HTTP server here - let index.ts handle it after all middleware
  return app;
}
