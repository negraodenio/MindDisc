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
  UserCheck, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock,
  DollarSign,
  AlertTriangle,
  Accessibility,
  Heart,
  Building,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const adaptationSchema = z.object({
  userId: z.string().min(1, 'Selecione um funcionário'),
  disabilityType: z.string().min(1, 'Informe o tipo de deficiência'),
  disabilityDegree: z.enum(['leve', 'moderada', 'grave', 'severa']),
  requiredAdaptations: z.array(z.string()).min(1, 'Informe pelo menos uma adaptação'),
  adaptationCost: z.number().min(0, 'Custo deve ser positivo'),
  implementationDate: z.string().min(1, 'Informe a data de implementação'),
  responsibleId: z.string().min(1, 'Selecione um responsável'),
});

type AdaptationForm = z.infer<typeof adaptationSchema>;

export default function InclusionModule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewAdaptationOpen, setIsNewAdaptationOpen] = useState(false);
  const [selectedAdaptations, setSelectedAdaptations] = useState<string[]>([]);

  const form = useForm<AdaptationForm>({
    resolver: zodResolver(adaptationSchema),
    defaultValues: {
      requiredAdaptations: [],
      adaptationCost: 0,
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

  // Mock inclusion adaptations data
  const adaptations = [
    {
      id: '1',
      user: { name: 'Ana Clara Silva', email: 'ana@company.com', department: 'TI' },
      disabilityType: 'Deficiência Visual - Baixa Visão',
      disabilityDegree: 'moderada',
      requiredAdaptations: [
        'Software leitor de tela NVDA',
        'Monitor de 27 polegadas com alto contraste',
        'Iluminação adequada na estação de trabalho',
        'Teclado com teclas em braile'
      ],
      implementedAdaptations: [
        'Software leitor de tela NVDA',
        'Monitor de 27 polegadas com alto contraste'
      ],
      adaptationCost: 3500.00,
      implementationDate: new Date('2024-01-15'),
      responsible: { name: 'Carlos Mendes', role: 'Supervisor de TI' },
      status: 'in_progress'
    },
    {
      id: '2',
      user: { name: 'Pedro Santos', email: 'pedro@company.com', department: 'Administrativo' },
      disabilityType: 'Deficiência Física - Cadeirante',
      disabilityDegree: 'grave',
      requiredAdaptations: [
        'Mesa ajustável em altura',
        'Rampa de acesso ao prédio',
        'Banheiro adaptado',
        'Vaga de estacionamento próxima'
      ],
      implementedAdaptations: [
        'Mesa ajustável em altura',
        'Rampa de acesso ao prédio',
        'Banheiro adaptado',
        'Vaga de estacionamento próxima'
      ],
      adaptationCost: 12000.00,
      implementationDate: new Date('2023-12-01'),
      responsible: { name: 'Maria José', role: 'Gerente de Facilities' },
      status: 'completed'
    },
    {
      id: '3',
      user: { name: 'João Oliveira', email: 'joao@company.com', department: 'RH' },
      disabilityType: 'Deficiência Auditiva - Surdez Parcial',
      disabilityDegree: 'leve',
      requiredAdaptations: [
        'Aparelho auditivo modelo específico',
        'Sistema de sinalização visual',
        'Intérprete de LIBRAS para reuniões'
      ],
      implementedAdaptations: [],
      adaptationCost: 5500.00,
      implementationDate: new Date('2024-02-01'),
      responsible: { name: 'Ana Paula', role: 'Coordenadora de RH' },
      status: 'pending'
    }
  ];

  // Mock accessibility assessment data
  const accessibilityAssessments = [
    {
      id: '1',
      area: 'Entrada Principal',
      compliant: true,
      issues: [],
      improvements: ['Instalação de piso tátil'],
      lastAssessment: new Date('2024-01-10'),
      nextAssessment: new Date('2024-07-10')
    },
    {
      id: '2',
      area: 'Banheiros',
      compliant: false,
      issues: ['Altura inadequada dos lavatórios', 'Falta de barras de apoio'],
      improvements: ['Ajuste de altura', 'Instalação de barras'],
      lastAssessment: new Date('2024-01-10'),
      nextAssessment: new Date('2024-04-10')
    },
    {
      id: '3',
      area: 'Estações de Trabalho',
      compliant: true,
      issues: [],
      improvements: ['Mesas ajustáveis em altura para todos'],
      lastAssessment: new Date('2024-01-10'),
      nextAssessment: new Date('2024-07-10')
    }
  ];

  const onSubmit = (data: AdaptationForm) => {
    // In a real implementation, this would call the API
    toast({
      title: "Adaptação registrada!",
      description: "A adaptação de inclusão foi registrada com sucesso.",
    });
    setIsNewAdaptationOpen(false);
    form.reset();
    setSelectedAdaptations([]);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'pending': { label: 'Pendente', className: 'bg-orange-100 text-orange-800' },
      'in_progress': { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Concluído', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
    };
    const config = configs[status as keyof typeof configs] || configs['pending'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getDisabilityDegreeBadge = (degree: string) => {
    const configs = {
      'leve': { label: 'Leve', className: 'bg-green-100 text-green-800' },
      'moderada': { label: 'Moderada', className: 'bg-yellow-100 text-yellow-800' },
      'grave': { label: 'Grave', className: 'bg-orange-100 text-orange-800' },
      'severa': { label: 'Severa', className: 'bg-red-100 text-red-800' },
    };
    const config = configs[degree as keyof typeof configs] || configs['leve'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const availableAdaptations = [
    'Software leitor de tela',
    'Monitor de alto contraste',
    'Teclado em braile',
    'Mouse adaptado',
    'Mesa ajustável em altura',
    'Cadeira ergonômica especial',
    'Rampa de acesso',
    'Elevador adaptado',
    'Banheiro acessível',
    'Sinalização em braile',
    'Sistema de comunicação visual',
    'Intérprete de LIBRAS',
    'Aparelho auditivo',
    'Iluminação adequada',
    'Vaga de estacionamento próxima'
  ];

  const totalAdaptations = adaptations.length;
  const completedAdaptations = adaptations.filter(a => a.status === 'completed').length;
  const pendingAdaptations = adaptations.filter(a => a.status === 'pending').length;
  const totalInvestment = adaptations.reduce((sum, a) => sum + a.adaptationCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Módulo de Inclusão</h2>
          <p className="text-muted-foreground">
            Lei Brasileira de Inclusão (LBI) - Gestão de Adaptações e Acessibilidade
          </p>
        </div>
        <Dialog open={isNewAdaptationOpen} onOpenChange={setIsNewAdaptationOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-adaptation">
              <Plus className="w-4 h-4 mr-2" />
              Nova Adaptação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Registrar Nova Adaptação de Inclusão</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    name="disabilityDegree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grau da Deficiência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-disability-degree">
                              <SelectValue placeholder="Selecione o grau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="leve">Leve</SelectItem>
                            <SelectItem value="moderada">Moderada</SelectItem>
                            <SelectItem value="grave">Grave</SelectItem>
                            <SelectItem value="severa">Severa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="disabilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Deficiência</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Deficiência Visual - Baixa Visão" 
                          {...field} 
                          data-testid="input-disability-type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredAdaptations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adaptações Necessárias</FormLabel>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                        {availableAdaptations.map((adaptation) => (
                          <label key={adaptation} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedAdaptations.includes(adaptation)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newAdaptations = [...selectedAdaptations, adaptation];
                                  setSelectedAdaptations(newAdaptations);
                                  field.onChange(newAdaptations);
                                } else {
                                  const newAdaptations = selectedAdaptations.filter(a => a !== adaptation);
                                  setSelectedAdaptations(newAdaptations);
                                  field.onChange(newAdaptations);
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">{adaptation}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="adaptationCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo das Adaptações (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-cost"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="implementationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Implementação</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-implementation-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-responsible">
                              <SelectValue placeholder="Selecione responsável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.filter((e: any) => e.role === 'admin' || e.role === 'hr').map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewAdaptationOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" data-testid="button-save-adaptation">
                    Registrar Adaptação
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LBI Compliance Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <UserCheck className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-800">Conformidade LBI Ativa:</strong> Sistema em conformidade com a Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei 13.146/2015).
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Adaptações</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-total-adaptations">
                  {totalAdaptations}
                </h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Accessibility className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <h3 className="text-2xl font-bold text-accent" data-testid="metric-completed-adaptations">
                  {completedAdaptations}
                </h3>
                <p className="text-xs text-accent">{Math.round((completedAdaptations / totalAdaptations) * 100)}% do total</p>
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
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <h3 className="text-2xl font-bold text-orange-600" data-testid="metric-pending-adaptations">
                  {pendingAdaptations}
                </h3>
                <p className="text-xs text-muted-foreground">Requerem ação</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investimento Total</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-total-investment">
                  R$ {totalInvestment.toLocaleString('pt-BR')}
                </h3>
                <p className="text-xs text-secondary">Em adaptações</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-secondary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="adaptations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="adaptations" data-testid="tab-adaptations">Adaptações</TabsTrigger>
          <TabsTrigger value="accessibility" data-testid="tab-accessibility">Acessibilidade</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Conformidade LBI</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-inclusion-reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Adaptations Tab */}
        <TabsContent value="adaptations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adaptações de Inclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Tipo de Deficiência</TableHead>
                    <TableHead>Grau</TableHead>
                    <TableHead>Adaptações</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adaptations.map((adaptation) => (
                    <TableRow key={adaptation.id} data-testid={`row-adaptation-${adaptation.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{adaptation.user.name}</p>
                          <p className="text-sm text-muted-foreground">{adaptation.user.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{adaptation.disabilityType}</span>
                      </TableCell>
                      <TableCell>
                        {getDisabilityDegreeBadge(adaptation.disabilityDegree)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium">
                            {adaptation.implementedAdaptations.length}/{adaptation.requiredAdaptations.length} implementadas
                          </p>
                          <div className="mt-1">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-accent h-2 rounded-full" 
                                style={{ 
                                  width: `${(adaptation.implementedAdaptations.length / adaptation.requiredAdaptations.length) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">R$ {adaptation.adaptationCost.toLocaleString('pt-BR')}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(adaptation.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{adaptation.responsible.name}</p>
                          <p className="text-xs text-muted-foreground">{adaptation.responsible.role}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-view-adaptation-${adaptation.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-edit-adaptation-${adaptation.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliação de Acessibilidade do Ambiente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessibilityAssessments.map((assessment) => (
                  <div 
                    key={assessment.id} 
                    className="p-4 border rounded-lg"
                    data-testid={`assessment-card-${assessment.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <h4 className="font-medium">{assessment.area}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assessment.compliant ? (
                          <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Não Conforme</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Última avaliação: {assessment.lastAssessment.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {assessment.issues.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-destructive mb-1">Problemas Identificados:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {assessment.issues.map((issue, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {assessment.improvements.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-600 mb-1">Melhorias Sugeridas:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {assessment.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-blue-600" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Próxima avaliação: {assessment.nextAssessment.toLocaleDateString('pt-BR')}</span>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Reavaliação
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conformidade com a Lei Brasileira de Inclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Artigos Implementados</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Art. 34 - Acessibilidade no Trabalho</p>
                        <p className="text-sm text-muted-foreground">Adaptações de estações de trabalho implementadas</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Art. 35 - Processo Seletivo Inclusivo</p>
                        <p className="text-sm text-muted-foreground">Vagas reservadas e processo adaptado</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Art. 36 - Adaptações Razoáveis</p>
                        <p className="text-sm text-muted-foreground">Equipamentos e ferramentas adaptados</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Art. 37 - Programa de Habilitação</p>
                        <p className="text-sm text-muted-foreground">Treinamentos específicos disponíveis</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Indicadores de Conformidade</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800">Cota Legal (Art. 93 Lei 8.213/91)</span>
                        <Badge className="bg-green-100 text-green-800">100%</Badge>
                      </div>
                      <p className="text-sm text-green-600 mt-1">5% das vagas preenchidas por PCDs</p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-800">Acessibilidade Arquitetônica</span>
                        <Badge className="bg-blue-100 text-blue-800">95%</Badge>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">Conforme NBR 9050/2015</p>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-purple-800">Tecnologia Assistiva</span>
                        <Badge className="bg-purple-100 text-purple-800">90%</Badge>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">Software e hardware adaptados</p>
                    </div>

                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-orange-800">Treinamento de Equipes</span>
                        <Badge className="bg-orange-100 text-orange-800">85%</Badge>
                      </div>
                      <p className="text-sm text-orange-600 mt-1">Gestores capacitados em inclusão</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Inclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col space-y-2" data-testid="button-adaptation-report">
                  <FileText className="w-6 h-6" />
                  <span>Relatório de Adaptações</span>
                  <span className="text-xs text-muted-foreground">Histórico completo</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col space-y-2" data-testid="button-compliance-report">
                  <UserCheck className="w-6 h-6" />
                  <span>Conformidade LBI</span>
                  <span className="text-xs text-muted-foreground">Status legal atual</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col space-y-2" data-testid="button-investment-report">
                  <DollarSign className="w-6 h-6" />
                  <span>Investimentos</span>
                  <span className="text-xs text-muted-foreground">Custos por período</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col space-y-2" data-testid="button-accessibility-report">
                  <Building className="w-6 h-6" />
                  <span>Acessibilidade</span>
                  <span className="text-xs text-muted-foreground">Avaliação de ambientes</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col space-y-2" data-testid="button-pcd-profile-report">
                  <Heart className="w-6 h-6" />
                  <span>Perfil PCDs</span>
                  <span className="text-xs text-muted-foreground">Características da equipe</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col space-y-2" data-testid="button-legal-report">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Conformidade Legal</span>
                  <span className="text-xs text-muted-foreground">Auditoria completa</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
