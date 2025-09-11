import { 
  companies, 
  users, 
  discAssessments,
  mentalHealthAssessments,
  psychosocialRisks,
  rapsServices,
  rapsReferrals,
  inssBenefits,
  inssLeaveRecords,
  lgpdConsents,
  inclusionAdaptations,
  actionPlans,
  reports,
  notifications,
  type Company,
  type InsertCompany,
  type User, 
  type InsertUser,
  type DiscAssessment,
  type InsertDiscAssessment,
  type MentalHealthAssessment,
  type InsertMentalHealthAssessment,
  type PsychosocialRisk,
  type InsertPsychosocialRisk,
  type ActionPlan,
  type InsertActionPlan,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, avg } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getUsersByCompany(companyId: string): Promise<User[]>;

  // Company management
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;

  // DISC Assessments
  createDiscAssessment(assessment: InsertDiscAssessment): Promise<DiscAssessment>;
  getDiscAssessmentsByUser(userId: string): Promise<DiscAssessment[]>;
  getDiscAssessmentsByCompany(companyId: string): Promise<DiscAssessment[]>;
  getLatestDiscAssessment(userId: string): Promise<DiscAssessment | undefined>;

  // Mental Health Assessments
  createMentalHealthAssessment(assessment: InsertMentalHealthAssessment): Promise<MentalHealthAssessment>;
  getMentalHealthAssessmentsByUser(userId: string): Promise<MentalHealthAssessment[]>;
  getMentalHealthAssessmentsByCompany(companyId: string): Promise<MentalHealthAssessment[]>;

  // Psychosocial Risks
  createPsychosocialRisk(risk: InsertPsychosocialRisk): Promise<PsychosocialRisk>;
  getPsychosocialRisksByCompany(companyId: string): Promise<PsychosocialRisk[]>;
  updatePsychosocialRisk(id: string, risk: Partial<InsertPsychosocialRisk>): Promise<PsychosocialRisk>;

  // Action Plans
  createActionPlan(plan: InsertActionPlan): Promise<ActionPlan>;
  getActionPlansByCompany(companyId: string): Promise<ActionPlan[]>;
  updateActionPlan(id: string, plan: Partial<InsertActionPlan>): Promise<ActionPlan>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification>;

  // Dashboard metrics
  getDashboardMetrics(companyId: string): Promise<any>;
  getComplianceScore(companyId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        email: insertUser.email.toLowerCase()
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.companyId, companyId));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: string, updateCompany: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...updateCompany, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async createDiscAssessment(assessment: InsertDiscAssessment): Promise<DiscAssessment> {
    const [discAssessment] = await db
      .insert(discAssessments)
      .values(assessment)
      .returning();
    return discAssessment;
  }

  async getDiscAssessmentsByUser(userId: string): Promise<DiscAssessment[]> {
    return await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.userId, userId))
      .orderBy(desc(discAssessments.assessmentDate));
  }

  async getDiscAssessmentsByCompany(companyId: string): Promise<DiscAssessment[]> {
    return await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.companyId, companyId))
      .orderBy(desc(discAssessments.assessmentDate));
  }

  async getLatestDiscAssessment(userId: string): Promise<DiscAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.userId, userId))
      .orderBy(desc(discAssessments.assessmentDate))
      .limit(1);
    return assessment || undefined;
  }

  async createMentalHealthAssessment(assessment: InsertMentalHealthAssessment): Promise<MentalHealthAssessment> {
    const [mentalHealthAssessment] = await db
      .insert(mentalHealthAssessments)
      .values(assessment)
      .returning();
    return mentalHealthAssessment;
  }

  async getMentalHealthAssessmentsByUser(userId: string): Promise<MentalHealthAssessment[]> {
    return await db
      .select()
      .from(mentalHealthAssessments)
      .where(eq(mentalHealthAssessments.userId, userId))
      .orderBy(desc(mentalHealthAssessments.assessmentDate));
  }

  async getMentalHealthAssessmentsByCompany(companyId: string): Promise<MentalHealthAssessment[]> {
    return await db
      .select()
      .from(mentalHealthAssessments)
      .where(eq(mentalHealthAssessments.companyId, companyId))
      .orderBy(desc(mentalHealthAssessments.assessmentDate));
  }

  async createPsychosocialRisk(risk: InsertPsychosocialRisk): Promise<PsychosocialRisk> {
    const [psychosocialRisk] = await db
      .insert(psychosocialRisks)
      .values(risk)
      .returning();
    return psychosocialRisk;
  }

  async getPsychosocialRisksByCompany(companyId: string): Promise<PsychosocialRisk[]> {
    return await db
      .select()
      .from(psychosocialRisks)
      .where(eq(psychosocialRisks.companyId, companyId))
      .orderBy(desc(psychosocialRisks.identificationDate));
  }

  async updatePsychosocialRisk(id: string, risk: Partial<InsertPsychosocialRisk>): Promise<PsychosocialRisk> {
    const [psychosocialRisk] = await db
      .update(psychosocialRisks)
      .set(risk)
      .where(eq(psychosocialRisks.id, id))
      .returning();
    return psychosocialRisk;
  }

  async createActionPlan(plan: InsertActionPlan): Promise<ActionPlan> {
    const [actionPlan] = await db
      .insert(actionPlans)
      .values(plan)
      .returning();
    return actionPlan;
  }

  async getActionPlansByCompany(companyId: string): Promise<ActionPlan[]> {
    return await db
      .select()
      .from(actionPlans)
      .where(eq(actionPlans.companyId, companyId))
      .orderBy(desc(actionPlans.createdAt));
  }

  async updateActionPlan(id: string, plan: Partial<InsertActionPlan>): Promise<ActionPlan> {
    const [actionPlan] = await db
      .update(actionPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(actionPlans.id, id))
      .returning();
    return actionPlan;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [notif] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return notif;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.sentDate));
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true, readDate: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getDashboardMetrics(companyId: string): Promise<any> {
    // Get total employees
    const [totalEmployees] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.status, "active")));

    // Get completed assessments
    const [completedAssessments] = await db
      .select({ count: count() })
      .from(discAssessments)
      .where(eq(discAssessments.companyId, companyId));

    // Get mental health score average
    const [mentalHealthScore] = await db
      .select({ 
        avg: avg(mentalHealthAssessments.totalScore)
      })
      .from(mentalHealthAssessments)
      .where(eq(mentalHealthAssessments.companyId, companyId));

    // Get high priority risks
    const [highRisks] = await db
      .select({ count: count() })
      .from(psychosocialRisks)
      .where(and(
        eq(psychosocialRisks.companyId, companyId),
        eq(psychosocialRisks.riskLevel, 5)
      ));

    // Get medium priority risks
    const [mediumRisks] = await db
      .select({ count: count() })
      .from(psychosocialRisks)
      .where(and(
        eq(psychosocialRisks.companyId, companyId),
        eq(psychosocialRisks.riskLevel, 3)
      ));

    // Get low priority risks
    const [lowRisks] = await db
      .select({ count: count() })
      .from(psychosocialRisks)
      .where(and(
        eq(psychosocialRisks.companyId, companyId),
        eq(psychosocialRisks.riskLevel, 1)
      ));

    // Get DISC distribution
    const discDistribution = await db
      .select({
        primaryProfile: discAssessments.primaryProfile,
        count: count()
      })
      .from(discAssessments)
      .where(eq(discAssessments.companyId, companyId))
      .groupBy(discAssessments.primaryProfile);

    return {
      totalEmployees: totalEmployees.count,
      completedAssessments: completedAssessments.count,
      mentalHealthScore: mentalHealthScore.avg ? Number(mentalHealthScore.avg).toFixed(1) : "0.0",
      risks: {
        total: highRisks.count + mediumRisks.count + lowRisks.count,
        high: highRisks.count,
        medium: mediumRisks.count,
        low: lowRisks.count
      },
      discDistribution: discDistribution.reduce((acc, item) => {
        if (item.primaryProfile) {
          acc[item.primaryProfile] = item.count;
        }
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getComplianceScore(companyId: string): Promise<number> {
    // Simple compliance calculation based on completed assessments and risk management
    const [totalEmployees] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.status, "active")));

    const [completedAssessments] = await db
      .select({ count: count() })
      .from(discAssessments)
      .where(eq(discAssessments.companyId, companyId));

    const [managedRisks] = await db
      .select({ count: count() })
      .from(psychosocialRisks)
      .where(and(
        eq(psychosocialRisks.companyId, companyId),
        eq(psychosocialRisks.status, "resolved")
      ));

    const [totalRisks] = await db
      .select({ count: count() })
      .from(psychosocialRisks)
      .where(eq(psychosocialRisks.companyId, companyId));

    const assessmentScore = totalEmployees.count > 0 
      ? (completedAssessments.count / totalEmployees.count) * 50 
      : 0;

    const riskScore = totalRisks.count > 0 
      ? (managedRisks.count / totalRisks.count) * 50 
      : 50;

    return Math.min(100, Math.round(assessmentScore + riskScore));
  }
}

export const storage = new DatabaseStorage();
