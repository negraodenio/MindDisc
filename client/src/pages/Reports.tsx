import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Shield, 
  HeartPulse,
  TrendingUp,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Share,
  Mail,
  Printer,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedReportType, setSelectedReportType] = useState('all');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/metrics/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
  });

  const availableReports = [
    {
      id: 'disc_analysis',
      title: 'Análise DISC Corporativa',
      description: 'Distribuição de perfis comportamentais e análises preditivas',
      icon: Users,
      category: 'behavioral',
      frequency: 'Mensal',
      lastGenerated: new Date('2024-01-15'),
      status: 'available'
    },
    {
      id: 'mental_health',
      title: 'Relatório de Saúde Mental',
      description: 'Protocolos aplicados, riscos identificados e intervenções',
      icon: HeartPulse,
      category: 'health',
      frequency: 'Quinzenal',
      lastGenerated: new Date('2024-01-20'),
      status: 'available'
    },
    {
      id: 'psychosocial_risks',
      title: 'Riscos Psicossociais (NR-1)',
      description: 'Identificação, avaliação e controle de riscos conforme NR-1',
      icon: Shield,
      category: 'compliance',
      frequency: 'Trimestral',
      lastGenerated: new Date('2024-01-10'),
      status: 'available'
    },
    {
      id: 'compliance_360',
      title: 'Compliance 360° - Legislação',
      description: 'Conformidade com LGPD, Lei 14.831, Lei 10.216 e LBI',
      icon: Shield,
      category: 'compliance',
      frequency: 'Mensal',
      lastGenerated: new Date('2024-01-18'),
      status: 'available'
    },
    {
      id: 'raps_integration',
      title: 'Integração RAPS',
      description: 'Encaminhamentos realizados e efetividade da rede',
      icon: TrendingUp,
      category: 'integration',
      frequency: 'Mensal',
      lastGenerated: new Date('2024-01-12'),
      status: 'available'
    },
    {
      id: 'inss_benefits',
      title: 'Gestão INSS e Benefícios',
      description: 'Afastamentos, benefícios e predições de retorno',
      icon: FileText,
      category: 'benefits',
      frequency: 'Mensal',
      lastGenerated: new Date('2024-01-16'),
      status: 'available'
    },
    {
      id: 'lgpd_compliance',
      title: 'Conformidade LGPD',
      description: 'Consentimentos, acessos e proteção de dados sensíveis',
      icon: Shield,
      category: 'compliance',
      frequency: 'Trimestral',
      lastGenerated: new Date('2024-01-01'),
      status: 'pending'
    },
    {
      id: 'inclusion_report',
      title: 'Relatório de Inclusão (LBI)',
      description: 'Adaptações implementadas e conformidade com a LBI',
      icon: Users,
      category: 'inclusion',
      frequency: 'Semestral',
      lastGenerated: new Date('2023-12-15'),
      status: 'available'
    },
    {
      id: 'executive_summary',
      title: 'Sumário Executivo',
      description: 'Visão consolidada para alta direção',
      icon: BarChart3,
      category: 'executive',
      frequency: 'Mensal',
      lastGenerated: new Date('2024-01-19'),
      status: 'available'
    }
  ];

  const reportCategories = [
    { value: 'all', label: 'Todos os Relatórios' },
    { value: 'behavioral', label: 'Comportamental' },
    { value: 'health', label: 'Saúde Mental' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'integration', label: 'Integrações' },
    { value: 'benefits', label: 'Benefícios' },
    { value: 'inclusion', label: 'Inclusão' },
    { value: 'executive', label: 'Executivo' }
  ];

  const recentReports = [
    {
      id: '1',
      title: 'Análise DISC - Janeiro 2024',
      type: 'disc_analysis',
      generatedDate: new Date('2024-01-15T14:30:00'),
      generatedBy: 'Sistema Automático',
      size: '2.3 MB',
      format: 'PDF',
      downloads: 12
    },
    {
      id: '2',
      title: 'Compliance 360° - Q4 2023',
      type: 'compliance_360',
      generatedDate: new Date('2024-01-02T09:15:00'),
      generatedBy: 'Ana Paula Silva',
      size: '4.7 MB',
      format: 'PDF + Excel',
      downloads: 8
    },
    {
      id: '3',
      title: 'Saúde Mental - Quinzena 02/2024',
      type: 'mental_health',
      generatedDate: new Date('2024-01-20T16:45:00'),
      generatedBy: 'Dr. Carlos Mendes',
      size: '1.8 MB',
      format: 'PDF',
      downloads: 15
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pendente</Badge>;
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Gerando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const configs = {
      'behavioral': { label: 'Comportamental', className: 'bg-blue-100 text-blue-800' },
      'health': { label: 'Saúde Mental', className: 'bg-purple-100 text-purple-800' },
      'compliance': { label: 'Compliance', className: 'bg-green-100 text-green-800' },
      'integration': { label: 'Integração', className: 'bg-orange-100 text-orange-800' },
      'benefits': { label: 'Benefícios', className: 'bg-yellow-100 text-yellow-800' },
      'inclusion': { label: 'Inclusão', className: 'bg-pink-100 text-pink-800' },
      'executive': { label: 'Executivo', className: 'bg-gray-100 text-gray-800' }
    };
    const config = configs[category as keyof typeof configs] || configs['behavioral'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredReports = availableReports.filter(report => 
    selectedReportType === 'all' || report.category === selectedReportType
  );

  const generateReport = (reportId: string) => {
    // In a real implementation, this would trigger report generation
    console.log('Generating report:', reportId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Relatórios e Analytics</h2>
          <p className="text-muted-foreground">
            Central de relatórios para compliance, saúde mental e análises comportamentais
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" data-testid="button-schedule-reports">
            <Settings className="w-4 h-4 mr-2" />
            Agendar Relatórios
          </Button>
          <Button data-testid="button-custom-report">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatório Personalizado
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros e Período</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger data-testid="select-report-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last_90_days">Últimos 90 dias</SelectItem>
                  <SelectItem value="last_year">Último ano</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Início</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data Fim</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available" data-testid="tab-available-reports">Relatórios Disponíveis</TabsTrigger>
          <TabsTrigger value="recent" data-testid="tab-recent-reports">Gerados Recentemente</TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled-reports">Agendados</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics em Tempo Real</TabsTrigger>
        </TabsList>

        {/* Available Reports Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow" data-testid={`report-card-${report.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <report.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">{report.frequency}</p>
                      </div>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    {getCategoryBadge(report.category)}
                    <span className="text-xs text-muted-foreground">
                      Último: {report.lastGenerated.toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => generateReport(report.id)}
                      disabled={report.status === 'generating'}
                      data-testid={`button-generate-${report.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {report.status === 'generating' ? 'Gerando...' : 'Gerar'}
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-preview-${report.id}`}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Reports Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Gerados Recentemente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`recent-report-${report.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Por: {report.generatedBy}</span>
                          <span>•</span>
                          <span>{report.generatedDate.toLocaleDateString('pt-BR')} às {report.generatedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span>{report.downloads} downloads</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{report.format}</Badge>
                      <Button variant="outline" size="sm" data-testid={`button-download-${report.id}`}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-share-${report.id}`}>
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Configure relatórios automáticos para serem gerados periodicamente
                </p>
                <Button data-testid="button-setup-scheduling">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Agendamentos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Funcionários Ativos</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {reportData?.totalEmployees || 0}
                    </h3>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avaliações Concluídas</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {reportData?.completedAssessments || 0}
                    </h3>
                  </div>
                  <BarChart3 className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {reportData?.complianceScore || 0}%
                    </h3>
                  </div>
                  <Shield className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Riscos Ativos</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {reportData?.risks?.total || 0}
                    </h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2" data-testid="button-quick-disc">
                  <Users className="w-6 h-6" />
                  <span>Relatório DISC Instantâneo</span>
                </Button>

                <Button variant="outline" className="h-20 flex flex-col space-y-2" data-testid="button-quick-compliance">
                  <Shield className="w-6 h-6" />
                  <span>Status Compliance Atual</span>
                </Button>

                <Button variant="outline" className="h-20 flex flex-col space-y-2" data-testid="button-quick-health">
                  <HeartPulse className="w-6 h-6" />
                  <span>Panorama Saúde Mental</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
