import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, date, jsonb, uuid, inet } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }).unique().notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: jsonb("address"),
  companySize: varchar("company_size", { length: 20 }),
  activitySector: varchar("activity_sector", { length: 100 }),
  employeeCount: integer("employee_count"),
  activePlan: varchar("active_plan", { length: 50 }).default("starter"),
  activeModules: jsonb("active_modules").default(sql`'[]'`),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table (employees)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  admissionDate: date("admission_date"),
  status: varchar("status", { length: 20 }).default("active"),
  role: varchar("role", { length: 20 }).default("employee"),
  discProfile: jsonb("disc_profile"),
  personalData: jsonb("personal_data"),
  lgpdConsent: boolean("lgpd_consent").default(false),
  consentDate: timestamp("consent_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DISC Assessments
export const discAssessments = pgTable("disc_assessments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  assessmentType: varchar("assessment_type", { length: 50 }).default("complete"),
  responses: jsonb("responses").notNull(),
  discResult: jsonb("disc_result").notNull(),
  scoreD: integer("score_d"),
  scoreI: integer("score_i"),
  scoreS: integer("score_s"),
  scoreC: integer("score_c"),
  primaryProfile: varchar("primary_profile", { length: 10 }),
  secondaryProfile: varchar("secondary_profile", { length: 10 }),
  aiInterpretation: text("ai_interpretation"),
  recommendations: jsonb("recommendations"),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  validUntil: date("valid_until"),
});

// Mental Health Assessments
export const mentalHealthAssessments = pgTable("mental_health_assessments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  protocolType: varchar("protocol_type", { length: 20 }),
  responses: jsonb("responses").notNull(),
  totalScore: integer("total_score"),
  riskLevel: varchar("risk_level", { length: 20 }),
  suggestedDiagnosis: text("suggested_diagnosis"),
  recommendations: jsonb("recommendations"),
  requiresIntervention: boolean("requires_intervention").default(false),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  evaluatorId: uuid("evaluator_id").references(() => users.id),
});

// Psychosocial Risks (NR-1 compliance)
export const psychosocialRisks = pgTable("psychosocial_risks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  sector: varchar("sector", { length: 100 }),
  riskType: varchar("risk_type", { length: 100 }).notNull(),
  description: text("description"),
  riskLevel: integer("risk_level"),
  controlMeasures: jsonb("control_measures"),
  responsibleId: uuid("responsible_id").references(() => users.id),
  implementationDeadline: date("implementation_deadline"),
  status: varchar("status", { length: 20 }).default("identified"),
  identificationDate: timestamp("identification_date").defaultNow(),
  resolutionDate: timestamp("resolution_date"),
});

// RAPS Services
export const rapsServices = pgTable("raps_services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: varchar("service_type", { length: 50 }),
  address: jsonb("address"),
  phone: varchar("phone", { length: 20 }),
  specialties: jsonb("specialties"),
  operatingHours: jsonb("operating_hours"),
  capacity: integer("capacity"),
  status: varchar("status", { length: 20 }).default("active"),
});

// RAPS Referrals
export const rapsReferrals = pgTable("raps_referrals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => rapsServices.id),
  referralReason: text("referral_reason"),
  urgency: varchar("urgency", { length: 20 }),
  status: varchar("status", { length: 20 }).default("pending"),
  referralDate: timestamp("referral_date").defaultNow(),
  appointmentDate: timestamp("appointment_date"),
  feedback: text("feedback"),
});

// INSS Benefits
export const inssBenefits = pgTable("inss_benefits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  benefitType: varchar("benefit_type", { length: 50 }),
  benefitNumber: varchar("benefit_number", { length: 20 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  benefitValue: decimal("benefit_value", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("active"),
  documents: jsonb("documents"),
  observations: text("observations"),
});

// INSS Leave Records
export const inssLeaveRecords = pgTable("inss_leave_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  cid: varchar("cid", { length: 10 }).notNull(),
  startDate: date("start_date").notNull(),
  expectedEndDate: date("expected_end_date"),
  actualEndDate: date("actual_end_date"),
  reason: text("reason"),
  responsibleDoctor: varchar("responsible_doctor", { length: 255 }),
  status: varchar("status", { length: 20 }).default("active"),
  stability12Months: boolean("stability_12_months").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// LGPD Consents
export const lgpdConsents = pgTable("lgpd_consents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  dataType: varchar("data_type", { length: 50 }),
  purpose: text("purpose").notNull(),
  consentGiven: boolean("consent_given").default(false),
  consentDate: timestamp("consent_date"),
  revocationDate: timestamp("revocation_date"),
  originIp: inet("origin_ip"),
  userAgent: text("user_agent"),
  termVersion: integer("term_version").default(1),
});

// LGPD Data Access Logs
export const lgpdDataAccessLogs = pgTable("lgpd_data_access_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  accessorUserId: uuid("accessor_user_id").references(() => users.id),
  dataType: varchar("data_type", { length: 50 }),
  purpose: varchar("purpose", { length: 100 }),
  accessDate: timestamp("access_date").defaultNow(),
  originIp: inet("origin_ip"),
  accessedData: jsonb("accessed_data"),
});

// Inclusion Adaptations
export const inclusionAdaptations = pgTable("inclusion_adaptations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  disabilityType: varchar("disability_type", { length: 50 }),
  disabilityDegree: varchar("disability_degree", { length: 20 }),
  requiredAdaptations: jsonb("required_adaptations"),
  implementedAdaptations: jsonb("implemented_adaptations"),
  adaptationCost: decimal("adaptation_cost", { precision: 10, scale: 2 }),
  implementationDate: date("implementation_date"),
  responsibleId: uuid("responsible_id").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending"),
});

// Action Plans
export const actionPlans = pgTable("action_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }),
  priority: varchar("priority", { length: 20 }),
  actions: jsonb("actions").notNull(),
  responsibleId: uuid("responsible_id").references(() => users.id),
  deadline: date("deadline"),
  status: varchar("status", { length: 20 }).default("pending"),
  progress: integer("progress").default(0),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  reportType: varchar("report_type", { length: 50 }).notNull(),
  startPeriod: date("start_period"),
  endPeriod: date("end_period"),
  data: jsonb("data").notNull(),
  metrics: jsonb("metrics"),
  generatedBy: uuid("generated_by").references(() => users.id),
  generationDate: timestamp("generation_date").defaultNow(),
  format: varchar("format", { length: 10 }).default("json"),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  isRead: boolean("is_read").default(false),
  sentDate: timestamp("sent_date").defaultNow(),
  readDate: timestamp("read_date"),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  discAssessments: many(discAssessments),
  mentalHealthAssessments: many(mentalHealthAssessments),
  psychosocialRisks: many(psychosocialRisks),
  rapsReferrals: many(rapsReferrals),
  inssBenefits: many(inssBenefits),
  inssLeaveRecords: many(inssLeaveRecords),
  lgpdConsents: many(lgpdConsents),
  inclusionAdaptations: many(inclusionAdaptations),
  actionPlans: many(actionPlans),
  reports: many(reports),
  notifications: many(notifications),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  discAssessments: many(discAssessments),
  mentalHealthAssessments: many(mentalHealthAssessments),
  psychosocialRisks: many(psychosocialRisks),
  rapsReferrals: many(rapsReferrals),
  inssBenefits: many(inssBenefits),
  inssLeaveRecords: many(inssLeaveRecords),
  lgpdConsents: many(lgpdConsents),
  inclusionAdaptations: many(inclusionAdaptations),
  actionPlans: many(actionPlans),
  reports: many(reports),
  notifications: many(notifications),
}));

export const discAssessmentsRelations = relations(discAssessments, ({ one }) => ({
  user: one(users, {
    fields: [discAssessments.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [discAssessments.companyId],
    references: [companies.id],
  }),
}));

export const mentalHealthAssessmentsRelations = relations(mentalHealthAssessments, ({ one }) => ({
  user: one(users, {
    fields: [mentalHealthAssessments.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [mentalHealthAssessments.companyId],
    references: [companies.id],
  }),
  evaluator: one(users, {
    fields: [mentalHealthAssessments.evaluatorId],
    references: [users.id],
  }),
}));

export const rapsReferralsRelations = relations(rapsReferrals, ({ one }) => ({
  user: one(users, {
    fields: [rapsReferrals.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [rapsReferrals.companyId],
    references: [companies.id],
  }),
  service: one(rapsServices, {
    fields: [rapsReferrals.serviceId],
    references: [rapsServices.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscAssessmentSchema = createInsertSchema(discAssessments).omit({
  id: true,
  assessmentDate: true,
});

export const insertMentalHealthAssessmentSchema = createInsertSchema(mentalHealthAssessments).omit({
  id: true,
  assessmentDate: true,
});

export const insertPsychosocialRiskSchema = createInsertSchema(psychosocialRisks).omit({
  id: true,
  identificationDate: true,
});

export const insertActionPlanSchema = createInsertSchema(actionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentDate: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Government API Schemas
export const susEstablishmentSearchSchema = z.object({
  cep: z.string().min(8, "CEP deve ter pelo menos 8 caracteres"),
  tipo: z.string().optional().default("CAPS"),
  raio_km: z.number().optional().default(20)
});

export const susServiceSearchSchema = z.object({
  municipio: z.string().optional().default("São Paulo"),
  tipo: z.string().optional()
});

export const susAvailabilityCheckSchema = z.object({
  cnes: z.string().min(1, "CNES é obrigatório"),
  tipo_atendimento: z.string().min(1, "Tipo de atendimento é obrigatório")
});

export const inssConsultationSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos")
});

export const inssEligibilitySchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  tempo_contribuicao_meses: z.number().optional().default(0),
  salario_atual: z.number().optional().default(0),
  cid: z.string().optional()
});

export const siafiExpenseSearchSchema = z.object({
  ente_federativo: z.string().min(2, "Ente federativo deve ter pelo menos 2 caracteres"),
  ano: z.number().optional().default(new Date().getFullYear())
});

export const rapsServiceSearchSchema = z.object({
  municipio: z.string().min(1, "Município é obrigatório"),
  tipo_servico: z.string().optional(),
  urgencia: z.boolean().optional().default(false)
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DiscAssessment = typeof discAssessments.$inferSelect;
export type InsertDiscAssessment = z.infer<typeof insertDiscAssessmentSchema>;
export type MentalHealthAssessment = typeof mentalHealthAssessments.$inferSelect;
export type InsertMentalHealthAssessment = z.infer<typeof insertMentalHealthAssessmentSchema>;
export type PsychosocialRisk = typeof psychosocialRisks.$inferSelect;
export type InsertPsychosocialRisk = z.infer<typeof insertPsychosocialRiskSchema>;
export type ActionPlan = typeof actionPlans.$inferSelect;
export type InsertActionPlan = z.infer<typeof insertActionPlanSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Government API Types
export type SUSEstablishmentSearch = z.infer<typeof susEstablishmentSearchSchema>;
export type SUSServiceSearch = z.infer<typeof susServiceSearchSchema>;
export type SUSAvailabilityCheck = z.infer<typeof susAvailabilityCheckSchema>;
export type INSSConsultation = z.infer<typeof inssConsultationSchema>;
export type INSSEligibility = z.infer<typeof inssEligibilitySchema>;
export type SIAFIExpenseSearch = z.infer<typeof siafiExpenseSearchSchema>;
export type RAPSServiceSearch = z.infer<typeof rapsServiceSearchSchema>;
