import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Building, 
  Shield, 
  Bell, 
  Database, 
  Key, 
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Users,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

const userSettingsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Senhas não coincidem ou senha atual não fornecida",
    path: ["confirmPassword"],
  }
);

const companySettingsSchema = z.object({
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  companySize: z.enum(['micro', 'pequena', 'media', 'grande']),
  activitySector: z.string().min(1, 'Setor de atividade é obrigatório'),
  employeeCount: z.number().min(1, 'Número de funcionários deve ser maior que 0'),
});

type UserSettingsForm = z.infer<typeof userSettingsSchema>;
type CompanySettingsForm = z.infer<typeof companySettingsSchema>;

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [activeBackup, setActiveBackup] = useState(false);

  const userForm = useForm<UserSettingsForm>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const companyForm = useForm<CompanySettingsForm>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      companySize: 'media',
      activitySector: '',
      employeeCount: 1,
    },
  });

  const { data: company } = useQuery({
    queryKey: ['/api/companies', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/companies/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }
      return response.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserSettingsForm) => {
      return apiRequest('PUT', `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanySettingsForm) => {
      return apiRequest('PUT', `/api/companies/${user?.companyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Empresa atualizada!",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar empresa",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (company) {
      companyForm.reset({
        name: company.name || '',
        cnpj: company.cnpj || '',
        email: company.email || '',
        phone: company.phone || '',
        companySize: company.companySize || 'media',
        activitySector: company.activitySector || '',
        employeeCount: company.employeeCount || 1,
      });
    }
  }, [company, companyForm]);

  const onUserSubmit = (data: UserSettingsForm) => {
    updateUserMutation.mutate(data);
  };

  const onCompanySubmit = (data: CompanySettingsForm) => {
    updateCompanyMutation.mutate(data);
  };

  const systemModules = [
    { id: 'disc_assessments', name: 'Avaliações DISC', enabled: true, description: 'Análise de perfis comportamentais' },
    { id: 'mental_health', name: 'Protocolos de Saúde Mental', enabled: true, description: 'PHQ-9, GAD-7, MBI, PSS-10, DASS-21' },
    { id: 'psychosocial_risks', name: 'Riscos Psicossociais (NR-1)', enabled: true, description: 'Gestão conforme Norma Regulamentadora 1' },
    { id: 'raps_integration', name: 'Integração RAPS', enabled: true, description: 'Rede de Atenção Psicossocial' },
    { id: 'inss_management', name: 'Gestão INSS', enabled: true, description: 'Benefícios e afastamentos' },
    { id: 'lgpd_compliance', name: 'Conformidade LGPD', enabled: true, description: 'Proteção de dados sensíveis' },
    { id: 'inclusion_module', name: 'Módulo de Inclusão', enabled: true, description: 'Lei Brasileira de Inclusão' },
    { id: 'ai_predictions', name: 'Predições com IA', enabled: false, description: 'Análise preditiva avançada' },
  ];

  const notificationSettings = [
    { id: 'high_risk_alerts', name: 'Alertas de Alto Risco', enabled: true, description: 'Notificações para riscos críticos' },
    { id: 'assessment_reminders', name: 'Lembretes de Avaliação', enabled: true, description: 'Vencimento de avaliações' },
    { id: 'compliance_updates', name: 'Atualizações de Compliance', enabled: true, description: 'Mudanças na legislação' },
    { id: 'weekly_reports', name: 'Relatórios Semanais', enabled: false, description: 'Resumo semanal por email' },
    { id: 'system_maintenance', name: 'Manutenções do Sistema', enabled: true, description: 'Notificações de manutenção' },
  ];

  const securitySettings = [
    { id: 'two_factor_auth', name: 'Autenticação de Dois Fatores', enabled: false, description: 'Segurança adicional para login' },
    { id: 'session_timeout', name: 'Timeout de Sessão', enabled: true, description: 'Logout automático após inatividade' },
    { id: 'audit_logs', name: 'Logs de Auditoria', enabled: true, description: 'Registro de todas as ações' },
    { id: 'data_encryption', name: 'Criptografia de Dados', enabled: true, description: 'Proteção avançada de dados sensíveis' },
    { id: 'backup_automatic', name: 'Backup Automático', enabled: true, description: 'Backup diário dos dados' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema, empresa e preferências pessoais
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" data-testid="button-export-settings">
            <Download className="w-4 h-4 mr-2" />
            Exportar Configurações
          </Button>
          <Button variant="outline" data-testid="button-backup-data">
            <Database className="w-4 h-4 mr-2" />
            Backup de Dados
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong className="text-green-800">Sistema Operacional:</strong> Todos os módulos estão funcionando corretamente. Último backup: hoje às 03:00.
        </AlertDescription>
      </Alert>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="company" data-testid="tab-company">
            <Building className="w-4 h-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="modules" data-testid="tab-modules">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-system">
            <Database className="w-4 h-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-user-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-user-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Alterar Senha</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={userForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha Atual</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  {...field} 
                                  data-testid="input-current-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                {...field} 
                                data-testid="input-new-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Senha</FormLabel>
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                {...field} 
                                data-testid="input-confirm-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={logout}
                      data-testid="button-logout"
                    >
                      Sair do Sistema
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateUserMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-company-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-company-cnpj" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Corporativo</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-company-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-company-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="companySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porte da Empresa</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-company-size">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="micro">Microempresa</SelectItem>
                              <SelectItem value="pequena">Pequena</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="grande">Grande</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="employeeCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Funcionários</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-employee-count"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={companyForm.control}
                    name="activitySector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor de Atividade</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-activity-sector" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateCompanyMutation.isPending}
                      data-testid="button-save-company"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateCompanyMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Módulos do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemModules.map((module) => (
                  <div 
                    key={module.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`module-${module.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{module.name}</h4>
                        {module.enabled ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Switch
                      checked={module.enabled}
                      onCheckedChange={(checked) => {
                        // In a real implementation, this would update the module status
                        console.log(`Module ${module.id} ${checked ? 'enabled' : 'disabled'}`);
                      }}
                      data-testid={`switch-${module.id}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div 
                    key={setting.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`notification-${setting.id}`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{setting.name}</h4>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(checked) => {
                        // In a real implementation, this would update the notification setting
                        console.log(`Notification ${setting.id} ${checked ? 'enabled' : 'disabled'}`);
                      }}
                      data-testid={`switch-notification-${setting.id}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securitySettings.map((setting) => (
                  <div 
                    key={setting.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`security-${setting.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{setting.name}</h4>
                        {setting.id === 'data_encryption' && (
                          <Badge className="bg-green-100 text-green-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      disabled={setting.id === 'data_encryption' || setting.id === 'audit_logs'}
                      onCheckedChange={(checked) => {
                        // In a real implementation, this would update the security setting
                        console.log(`Security ${setting.id} ${checked ? 'enabled' : 'disabled'}`);
                      }}
                      data-testid={`switch-security-${setting.id}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" data-testid="button-generate-backup">
                  <Database className="w-4 h-4 mr-2" />
                  Gerar Backup Manual
                </Button>
                <Button variant="outline" data-testid="button-audit-log">
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar Logs de Auditoria
                </Button>
                <Button variant="outline" data-testid="button-export-data">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados (LGPD)
                </Button>
                <Button variant="outline" data-testid="button-security-report">
                  <Shield className="w-4 h-4 mr-2" />
                  Relatório de Segurança
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Versão:</span>
                    <Badge variant="outline">MindDisc Pro 2.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Banco de Dados:</span>
                    <Badge className="bg-green-100 text-green-800">Neon PostgreSQL</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Última Atualização:</span>
                    <span className="text-sm text-muted-foreground">15/01/2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Uptime:</span>
                    <span className="text-sm text-muted-foreground">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Compliance:</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Armazenamento</span>
                      <span className="text-sm text-muted-foreground">2.3 GB / 10 GB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Usuários Ativos</span>
                      <span className="text-sm text-muted-foreground">127 / 500</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">API Calls (Mês)</span>
                      <span className="text-sm text-muted-foreground">8.5k / 50k</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manutenção do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" data-testid="button-system-backup">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar Dados
                </Button>
                <Button variant="outline" data-testid="button-clear-cache">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Cache
                </Button>
                <Button variant="outline" data-testid="button-system-health">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar Sistema
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suporte e Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Suporte Técnico</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Email: suporte@minddisc.com.br
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Telefone: (11) 3333-4444
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Consultoria Especializada</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Para implementação de novos módulos ou consultoria em compliance
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-contact-support">
                    Entrar em Contato
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
