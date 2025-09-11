import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  ClipboardCheck, 
  HeartPulse, 
  Shield,
  UserPlus,
  AlertTriangle,
  Network,
  AlertCircle,
  Calendar,
  Info,
  Download,
  Brain,
  TrendingUp,
  Zap
} from 'lucide-react';

// Components
import MetricCard from '@/components/MetricCard';
import ComplianceModuleCard from '@/components/ComplianceModuleCard';
import ActivityItem from '@/components/ActivityItem';
import AlertCard from '@/components/AlertCard';
import MentalHealthTrendsChart from '@/components/charts/MentalHealthTrendsChart';
import DISCDistributionChart from '@/components/charts/DISCDistributionChart';

import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/metrics', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/metrics/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          // Token expirado ou inválido - fazer logout e redirecionar
          logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados do dashboard. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  const metrics = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard Executivo</h2>
          <p className="text-muted-foreground">
            Visão geral da saúde mental corporativa - {user?.name || 'Empresa'}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Compliance Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong className="text-green-800">Compliance 360° Ativo:</strong> 
          {' '}Todos os módulos de conformidade estão funcionando corretamente.
        </AlertDescription>
      </Alert>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Funcionários Ativos"
          value={metrics.totalEmployees || 0}
          description="Total de funcionários"
          icon={Users}
          trend="+5.2%"
          trendType="positive"
          iconColor="text-primary"
          testId="card-total-employees"
        />
        
        <MetricCard
          title="Avaliações Concluídas"
          value={metrics.completedAssessments || 0}
          description="DISC e Saúde Mental"
          icon={ClipboardCheck}
          trend="+12.3%"
          trendType="positive"
          iconColor="text-accent"
          testId="card-completed-assessments"
        />
        
        <MetricCard
          title="Índice Saúde Mental"
          value={metrics.mentalHealthScore || "0.0"}
          description="Pontuação média geral"
          icon={HeartPulse}
          trend="-2.1%"
          trendType="negative"
          iconColor="text-secondary"
          testId="card-mental-health-score"
        />
        
        <MetricCard
          title="Compliance Score"
          value={`${metrics.complianceScore || 0}%`}
          description="Conformidade geral"
          icon={Shield}
          trend="100%"
          trendType="positive"
          iconColor="text-chart-4"
          testId="card-compliance-score"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MentalHealthTrendsChart testId="chart-mental-health-trends" />
        <DISCDistributionChart 
          data={metrics.discDistribution} 
          testId="chart-disc-distribution" 
        />
      </div>

      {/* Compliance Modules Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Status dos Módulos de Compliance
            </CardTitle>
            <Badge variant="outline" className="text-accent border-accent">
              Todos os módulos ativos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ComplianceModuleCard
              name="RAPS"
              description="Rede de Atenção Psicossocial"
              icon={Network}
              isActive={true}
              metric={{ label: "Encaminhamentos", value: 23 }}
              iconColor="text-accent"
              testId="module-raps"
            />
            
            <ComplianceModuleCard
              name="INSS"
              description="Gestão de Benefícios"
              icon={Users}
              isActive={true}
              metric={{ label: "Afastamentos", value: 8 }}
              iconColor="text-secondary"
              testId="module-inss"
            />
            
            <ComplianceModuleCard
              name="LGPD"
              description="Proteção de Dados de Saúde"
              icon={Shield}
              isActive={true}
              metric={{ label: "Consentimentos", value: metrics.totalEmployees || 0 }}
              iconColor="text-primary"
              testId="module-lgpd"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Predictions Section - NEW */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  🔮 Predições com IA
                  <Badge className="ml-3 bg-green-100 text-green-800 text-xs">ATIVO</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análise preditiva organizacional para os próximos 12 meses
                </p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              data-testid="button-generate-ai-predictions"
            >
              <Zap className="w-4 h-4 mr-2" />
              Gerar Predições
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-red-800">Riscos Críticos</h4>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">3</p>
              <p className="text-sm text-red-600">Funcionários em risco alto</p>
              <div className="mt-2 text-xs text-red-500">
                📊 Burnout: 85% • Ansiedade: 78%
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-yellow-800">Monitoramento</h4>
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-700">12</p>
              <p className="text-sm text-yellow-600">Requerem atenção</p>
              <div className="mt-2 text-xs text-yellow-500">
                📈 Tendência crescente detectada
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">Estáveis</h4>
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">42</p>
              <p className="text-sm text-green-600">Baixo risco projetado</p>
              <div className="mt-2 text-xs text-green-500">
                ✅ Perfis equilibrados
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Insights de IA Organizacional</span>
            </div>
            <p className="text-sm text-blue-700">
              🧠 <strong>Padrão Identificado:</strong> Departamentos com perfis DISC predominantemente "D" 
              mostram 40% mais risco de burnout nos próximos 6 meses. Recomenda-se rotação de tarefas e programas de relaxamento.
            </p>
            <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
              <span>📊 Precisão: 87%</span>
              <span>🎯 Horizonte: 12 meses</span>
              <span>🔄 Atualizado há 2min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Atividades Recentes
              </CardTitle>
              <Button variant="link" className="text-sm text-primary hover:underline p-0">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <ActivityItem
                icon={UserPlus}
                title="Nova avaliação DISC completada"
                description="João Silva - Departamento de TI"
                timestamp="há 2 minutos"
                iconColor="text-primary"
                testId="activity-disc-completed"
              />
              
              <ActivityItem
                icon={AlertTriangle}
                title="Risco psicossocial identificado"
                description="Departamento de Vendas - Nível Alto"
                timestamp="há 15 minutos"
                iconColor="text-secondary"
                testId="activity-risk-identified"
              />
              
              <ActivityItem
                icon={Network}
                title="Encaminhamento RAPS realizado"
                description="Maria Santos - CAPS Centro"
                timestamp="há 1 hora"
                iconColor="text-accent"
                testId="activity-raps-referral"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Alertas e Notificações
              </CardTitle>
              <Badge variant="destructive" className="text-xs">
                3
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AlertCard
                icon={AlertCircle}
                title="Intervenção Urgente Necessária"
                description="Funcionário com pontuação crítica em avaliação de depressão (PHQ-9: 20)"
                actionLabel="Ação Imediata"
                priority="high"
                testId="alert-urgent-intervention"
              />
              
              <AlertCard
                icon={Calendar}
                title="Vencimento de Avaliações"
                description="15 funcionários com avaliações vencendo em 7 dias"
                actionLabel="Agendar Renovação"
                priority="medium"
                testId="alert-assessment-expiry"
              />
              
              <AlertCard
                icon={Info}
                title="Nova Funcionalidade Disponível"
                description="Módulo de Sistema de Justiça foi ativado para sua organização"
                actionLabel="Saiba Mais"
                priority="info"
                testId="alert-new-feature"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
