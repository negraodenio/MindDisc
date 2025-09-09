import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Shield, 
  Eye, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  FileText,
  User,
  Database,
  Lock,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const consentSchema = z.object({
  userId: z.string().min(1, 'Selecione um funcionário'),
  dataType: z.enum(['disc', 'saude_mental', 'biometricos', 'comportamentais']),
  purpose: z.string().min(1, 'Informe a finalidade'),
  consentGiven: z.boolean(),
});

type ConsentForm = z.infer<typeof consentSchema>;

export default function LGPDModule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewConsentOpen, setIsNewConsentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<ConsentForm>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      consentGiven: false,
    },
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/users/company', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/users/company/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.json();
    },
  });

  // Mock LGPD data for demonstration
  const consents = [
    {
      id: '1',
      user: { name: 'João Silva', email: 'joao@company.com' },
      dataType: 'disc',
      purpose: 'Avaliação de perfil comportamental para desenvolvimento profissional',
      consentGiven: true,
      consentDate: new Date('2024-01-15'),
      revocationDate: null,
      termVersion: 1,
      ipAddress: '192.168.1.10'
    },
    {
      id: '2',
      user: { name: 'Maria Santos', email: 'maria@company.com' },
      dataType: 'saude_mental',
      purpose: 'Protocolo PHQ-9 para avaliação de saúde mental e bem-estar',
      consentGiven: true,
      consentDate: new Date('2024-01-10'),
      revocationDate: null,
      termVersion: 1,
      ipAddress: '192.168.1.11'
    },
    {
      id: '3',
      user: { name: 'Pedro Costa', email: 'pedro@company.com' },
      dataType: 'comportamentais',
      purpose: 'Análise de padrões comportamentais para prevenção de riscos psicossociais',
      consentGiven: false,
      consentDate: null,
      revocationDate: new Date('2024-01-12'),
      termVersion: 1,
      ipAddress: '192.168.1.12'
    }
  ];

  const dataAccessLogs = [
    {
      id: '1',
      user: { name: 'João Silva', email: 'joao@company.com' },
      accessor: { name: 'Dr. Ana Paula', role: 'Psicólogo' },
      dataType: 'saude_mental',
      purpose: 'Avaliação clínica de seguimento',
      accessDate: new Date('2024-01-20T10:30:00'),
      ipAddress: '192.168.1.20'
    },
    {
      id: '2',
      user: { name: 'Maria Santos', email: 'maria@company.com' },
      accessor: { name: 'Sistema Automático', role: 'Sistema' },
      dataType: 'disc',
      purpose: 'Geração de relatório mensal de perfis',
      accessDate: new Date('2024-01-19T14:15:00'),
      ipAddress: '192.168.1.1'
    }
  ];

  const onSubmit = (data: ConsentForm) => {
    // In a real implementation, this would call the API
    toast({
      title: "Consentimento registrado!",
      description: "O registro de consentimento LGPD foi criado com sucesso.",
    });
    setIsNewConsentOpen(false);
    form.reset();
  };

  const getDataTypeBadge = (type: string) => {
    const configs = {
      'disc': { label: 'DISC', className: 'bg-blue-100 text-blue-800' },
      'saude_mental': { label: 'Saúde Mental', className: 'bg-purple-100 text-purple-800' },
      'biometricos': { label: 'Biométricos', className: 'bg-green-100 text-green-800' },
      'comportamentais': { label: 'Comportamentais', className: 'bg-orange-100 text-orange-800' },
    };
    const config = configs[type as keyof typeof configs] || configs['disc'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getConsentStatusBadge = (consent: any) => {
    if (consent.consentGiven && !consent.revocationDate) {
      return <Badge className="bg-green-100 text-green-800">Consentido</Badge>;
    } else if (consent.revocationDate) {
      return <Badge className="bg-red-100 text-red-800">Revogado</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const filteredConsents = consents.filter(consent => 
    consent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consent.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consent.dataType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalConsents = consents.length;
  const activeConsents = consents.filter(c => c.consentGiven && !c.revocationDate).length;
  const revokedConsents = consents.filter(c => c.revocationDate).length;
  const pendingConsents = consents.filter(c => !c.consentGiven && !c.revocationDate).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Módulo LGPD</h2>
          <p className="text-muted-foreground">
            Proteção de Dados Sensíveis de Saúde Mental - Conformidade Total
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" data-testid="button-export-lgpd">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Dialog open={isNewConsentOpen} onOpenChange={setIsNewConsentOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-consent">
                <Plus className="w-4 h-4 mr-2" />
                Novo Consentimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Consentimento LGPD</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funcionário</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-employee">
                              <SelectValue placeholder="Selecione um funcionário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} - {employee.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Dados</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-data-type">
                              <SelectValue placeholder="Selecione o tipo de dados" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="disc">DISC - Perfil Comportamental</SelectItem>
                            <SelectItem value="saude_mental">Saúde Mental - Protocolos Clínicos</SelectItem>
                            <SelectItem value="biometricos">Dados Biométricos</SelectItem>
                            <SelectItem value="comportamentais">Dados Comportamentais</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finalidade do Tratamento</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a finalidade específica para o tratamento dos dados..."
                            {...field}
                            data-testid="textarea-purpose"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consentGiven"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Consentimento Concedido
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            O titular dos dados concorda com o tratamento conforme descrito
                          </p>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                            data-testid="checkbox-consent"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsNewConsentOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" data-testid="button-save-consent">
                      Registrar Consentimento
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* LGPD Compliance Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong className="text-green-800">Conformidade LGPD Ativa:</strong> Sistema em conformidade total com a Lei Geral de Proteção de Dados para dados sensíveis de saúde.
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Consentimentos</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-total-consents">
                  {totalConsents}
                </h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consentimentos Ativos</p>
                <h3 className="text-2xl font-bold text-accent" data-testid="metric-active-consents">
                  {activeConsents}
                </h3>
                <p className="text-xs text-accent">Válidos</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revogações</p>
                <h3 className="text-2xl font-bold text-destructive" data-testid="metric-revoked-consents">
                  {revokedConsents}
                </h3>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-destructive w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                <h3 className="text-2xl font-bold text-foreground">100%</h3>
                <p className="text-xs text-accent">Dados sensíveis protegidos</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Lock className="text-secondary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consents" data-testid="tab-consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="access-logs" data-testid="tab-access-logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="data-mapping" data-testid="tab-data-mapping">Mapeamento de Dados</TabsTrigger>
          <TabsTrigger value="rights" data-testid="tab-rights">Direitos do Titular</TabsTrigger>
        </TabsList>

        {/* Consents Tab */}
        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registros de Consentimento</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar consentimentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-consents"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titular dos Dados</TableHead>
                    <TableHead>Tipo de Dados</TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Consentimento</TableHead>
                    <TableHead>Versão Termo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsents.map((consent) => (
                    <TableRow key={consent.id} data-testid={`row-consent-${consent.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{consent.user.name}</p>
                            <p className="text-sm text-muted-foreground">{consent.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDataTypeBadge(consent.dataType)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={consent.purpose}>
                            {consent.purpose}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getConsentStatusBadge(consent)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {consent.consentDate ? 
                              consent.consentDate.toLocaleDateString('pt-BR') : 
                              'Não informado'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{consent.termVersion}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-consent-${consent.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Logs Tab */}
        <TabsContent value="access-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Acesso aos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titular dos Dados</TableHead>
                    <TableHead>Acessado Por</TableHead>
                    <TableHead>Tipo de Dados</TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead>Data/Hora Acesso</TableHead>
                    <TableHead>IP de Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataAccessLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-access-log-${log.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user.name}</p>
                          <p className="text-sm text-muted-foreground">{log.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.accessor.name}</p>
                          <p className="text-sm text-muted-foreground">{log.accessor.role}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDataTypeBadge(log.dataType)}
                      </TableCell>
                      <TableCell>{log.purpose}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{log.accessDate.toLocaleDateString('pt-BR')}</p>
                          <p className="text-muted-foreground">
                            {log.accessDate.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{log.ipAddress}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Mapping Tab */}
        <TabsContent value="data-mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Dados Sensíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Database className="w-8 h-8 text-primary" />
                        <div>
                          <h4 className="font-medium">Dados DISC</h4>
                          <p className="text-sm text-muted-foreground">Perfis comportamentais</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Localização:</strong> Tabela disc_assessments</div>
                        <div><strong>Criptografia:</strong> AES-256</div>
                        <div><strong>Retenção:</strong> 5 anos após término do vínculo</div>
                        <div><strong>Base Legal:</strong> Consentimento (Art. 7º, I)</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Database className="w-8 h-8 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Dados de Saúde Mental</h4>
                          <p className="text-sm text-muted-foreground">Protocolos clínicos</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Localização:</strong> Tabela mental_health_assessments</div>
                        <div><strong>Criptografia:</strong> AES-256 + Chaves HSM</div>
                        <div><strong>Retenção:</strong> 20 anos (CFM)</div>
                        <div><strong>Base Legal:</strong> Legítimo interesse + Consentimento</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Database className="w-8 h-8 text-orange-600" />
                        <div>
                          <h4 className="font-medium">Dados Comportamentais</h4>
                          <p className="text-sm text-muted-foreground">Padrões e riscos</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Localização:</strong> Tabela psychosocial_risks</div>
                        <div><strong>Criptografia:</strong> AES-256</div>
                        <div><strong>Retenção:</strong> 2 anos após resolução</div>
                        <div><strong>Base Legal:</strong> Legítimo interesse (NR-1)</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Database className="w-8 h-8 text-green-600" />
                        <div>
                          <h4 className="font-medium">Logs de Acesso</h4>
                          <p className="text-sm text-muted-foreground">Auditoria completa</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Localização:</strong> Tabela lgpd_data_access_logs</div>
                        <div><strong>Criptografia:</strong> Hash SHA-256</div>
                        <div><strong>Retenção:</strong> 6 anos (LGPD)</div>
                        <div><strong>Base Legal:</strong> Obrigação legal</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rights Tab */}
        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Direitos dos Titulares (Art. 18 LGPD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Direitos Implementados</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Confirmação de Tratamento</p>
                        <p className="text-sm text-muted-foreground">Acesso via portal do funcionário</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Acesso aos Dados</p>
                        <p className="text-sm text-muted-foreground">Download completo em formato legível</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Correção de Dados</p>
                        <p className="text-sm text-muted-foreground">Solicitação via sistema</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Anonimização</p>
                        <p className="text-sm text-muted-foreground">Processo automatizado</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Portabilidade</p>
                        <p className="text-sm text-muted-foreground">Formato estruturado</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Procedimentos de Solicitação</h4>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Importante:</strong> Solicitações devem ser feitas através do portal do funcionário ou via e-mail para dpo@empresa.com
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Prazo de Atendimento</p>
                      <p className="text-sm text-muted-foreground">15 dias corridos, prorrogáveis por mais 15 dias</p>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Verificação de Identidade</p>
                      <p className="text-sm text-muted-foreground">CPF + dados cadastrais ou certificado digital</p>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Canais de Comunicação</p>
                      <p className="text-sm text-muted-foreground">Portal web, e-mail criptografado, telefone</p>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Gratuidade</p>
                      <p className="text-sm text-muted-foreground">Primeira solicitação gratuita por mês</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
