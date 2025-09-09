import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leaveRecordSchema = z.object({
  userId: z.string().min(1, 'Selecione um funcionário'),
  cid: z.string().min(1, 'Informe o CID'),
  startDate: z.string().min(1, 'Informe a data de início'),
  expectedEndDate: z.string().optional(),
  reason: z.string().min(1, 'Informe o motivo'),
  responsibleDoctor: z.string().min(1, 'Informe o médico responsável'),
  stability12Months: z.boolean().default(true),
});

type LeaveRecordForm = z.infer<typeof leaveRecordSchema>;

export default function INSSModule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNewLeaveOpen, setIsNewLeaveOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('leaves');

  const form = useForm<LeaveRecordForm>({
    resolver: zodResolver(leaveRecordSchema),
    defaultValues: {
      stability12Months: true,
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

  // Mock leave records data
  const leaveRecords = [
    {
      id: '1',
      user: { name: 'João Silva', email: 'joao@company.com', department: 'TI' },
      cid: 'F32.1',
      startDate: new Date('2024-01-15'),
      expectedEndDate: new Date('2024-02-15'),
      actualEndDate: null,
      reason: 'Transtorno depressivo maior, episódio moderado',
      responsibleDoctor: 'Dr. Carlos Mendes',
      status: 'active',
      stability12Months: true,
      predictedReturn: new Date('2024-02-10')
    },
    {
      id: '2',
      user: { name: 'Maria Santos', email: 'maria@company.com', department: 'RH' },
      cid: 'F41.1',
      startDate: new Date('2023-12-01'),
      expectedEndDate: new Date('2024-01-01'),
      actualEndDate: new Date('2023-12-28'),
      reason: 'Transtorno de ansiedade generalizada',
      responsibleDoctor: 'Dra. Ana Paula',
      status: 'resolved',
      stability12Months: true,
      predictedReturn: null
    }
  ];

  // Mock benefits data
  const benefits = [
    {
      id: '1',
      user: { name: 'João Silva', email: 'joao@company.com' },
      benefitType: 'auxilio_doenca',
      benefitNumber: 'B123456789',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      benefitValue: 2500.00,
      status: 'active'
    },
    {
      id: '2',
      user: { name: 'Pedro Costa', email: 'pedro@company.com' },
      benefitType: 'aposentadoria_invalidez',
      benefitNumber: 'B987654321',
      startDate: new Date('2023-10-01'),
      endDate: null,
      benefitValue: 3200.00,
      status: 'active'
    }
  ];

  const onSubmit = (data: LeaveRecordForm) => {
    // In a real implementation, this would call the API
    toast({
      title: "Afastamento registrado!",
      description: "O registro de afastamento foi criado com sucesso.",
    });
    setIsNewLeaveOpen(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'active': { label: 'Ativo', className: 'bg-orange-100 text-orange-800' },
      'resolved': { label: 'Resolvido', className: 'bg-green-100 text-green-800' },
      'suspended': { label: 'Suspenso', className: 'bg-gray-100 text-gray-800' },
    };
    const config = configs[status as keyof typeof configs] || configs['active'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getBenefitTypeBadge = (type: string) => {
    const configs = {
      'auxilio_doenca': { label: 'Auxílio Doença', className: 'bg-blue-100 text-blue-800' },
      'aposentadoria_invalidez': { label: 'Aposentadoria por Invalidez', className: 'bg-purple-100 text-purple-800' },
      'bpc_loas': { label: 'BPC/LOAS', className: 'bg-green-100 text-green-800' },
    };
    const config = configs[type as keyof typeof configs] || configs['auxilio_doenca'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const predictLeaveRisk = (employeeId: string) => {
    // Mock AI prediction
    const riskScores = {
      'high': { probability: 85, factors: ['Histórico de depressão', 'Alto estresse', 'Sobrecarga de trabalho'] },
      'medium': { probability: 45, factors: ['Avaliação DISC indica vulnerabilidade', 'Mudanças recentes'] },
      'low': { probability: 15, factors: ['Perfil estável', 'Bom suporte social'] }
    };
    
    // Random assignment for demo
    const risks = Object.keys(riskScores);
    const randomRisk = risks[Math.floor(Math.random() * risks.length)];
    return { level: randomRisk, ...riskScores[randomRisk as keyof typeof riskScores] };
  };

  const activeLeaves = leaveRecords.filter(l => l.status === 'active').length;
  const totalBenefits = benefits.length;
  const activeBenefits = benefits.filter(b => b.status === 'active').length;
  const totalBenefitValue = benefits.reduce((sum, b) => sum + b.benefitValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Módulo INSS</h2>
          <p className="text-muted-foreground">
            Gestão de benefícios previdenciários e predição de afastamentos
          </p>
        </div>
        <Dialog open={isNewLeaveOpen} onOpenChange={setIsNewLeaveOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-leave">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Afastamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Afastamento</DialogTitle>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: F32.1" 
                            {...field} 
                            data-testid="input-cid"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsibleDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médico Responsável</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Dr(a). Nome Completo" 
                            {...field} 
                            data-testid="input-doctor"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Prevista de Retorno</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo do Afastamento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o motivo e diagnóstico..."
                          {...field}
                          data-testid="textarea-reason"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stability12Months"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Garantia de Estabilidade (12 meses)
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Funcionário terá direito à estabilidade por 12 meses após retorno
                        </p>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                          data-testid="checkbox-stability"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewLeaveOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" data-testid="button-save-leave">
                    Registrar Afastamento
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Afastamentos Ativos</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-active-leaves">
                  {activeLeaves}
                </h3>
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
                <p className="text-sm text-muted-foreground">Benefícios Ativos</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-active-benefits">
                  {activeBenefits}
                </h3>
                <p className="text-xs text-muted-foreground">De {totalBenefits} total</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total Benefícios</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-benefit-value">
                  R$ {totalBenefitValue.toLocaleString('pt-BR')}
                </h3>
                <p className="text-xs text-accent">Mensal</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Retorno</p>
                <h3 className="text-2xl font-bold text-foreground">87%</h3>
                <p className="text-xs text-accent">Últimos 6 meses</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'leaves' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('leaves')}
          className="px-4 py-2"
          data-testid="tab-leaves"
        >
          Afastamentos
        </Button>
        <Button
          variant={selectedTab === 'benefits' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('benefits')}
          className="px-4 py-2"
          data-testid="tab-benefits"
        >
          Benefícios
        </Button>
        <Button
          variant={selectedTab === 'prediction' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('prediction')}
          className="px-4 py-2"
          data-testid="tab-prediction"
        >
          Predição IA
        </Button>
      </div>

      {/* Leave Records Tab */}
      {selectedTab === 'leaves' && (
        <Card>
          <CardHeader>
            <CardTitle>Registros de Afastamento</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>CID</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Previsão Retorno</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estabilidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRecords.map((record) => (
                  <TableRow key={record.id} data-testid={`row-leave-${record.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.user.name}</p>
                          <p className="text-sm text-muted-foreground">{record.user.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.cid}</Badge>
                    </TableCell>
                    <TableCell>
                      {record.startDate.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {record.expectedEndDate ? 
                        record.expectedEndDate.toLocaleDateString('pt-BR') : 
                        'Indefinido'
                      }
                    </TableCell>
                    <TableCell>{record.responsibleDoctor}</TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {record.stability12Months ? (
                        <Badge className="bg-green-100 text-green-800">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-leave-${record.id}`}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Benefits Tab */}
      {selectedTab === 'benefits' && (
        <Card>
          <CardHeader>
            <CardTitle>Benefícios INSS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Tipo de Benefício</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map((benefit) => (
                  <TableRow key={benefit.id} data-testid={`row-benefit-${benefit.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{benefit.user.name}</p>
                        <p className="text-sm text-muted-foreground">{benefit.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getBenefitTypeBadge(benefit.benefitType)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{benefit.benefitNumber}</span>
                    </TableCell>
                    <TableCell>
                      {benefit.startDate.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {benefit.endDate ? benefit.endDate.toLocaleDateString('pt-BR') : 'Indefinido'}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">R$ {benefit.benefitValue.toLocaleString('pt-BR')}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(benefit.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-benefit-${benefit.id}`}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* AI Prediction Tab */}
      {selectedTab === 'prediction' && (
        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong className="text-blue-800">IA Preditiva Ativa:</strong> Sistema analisa dados DISC, saúde mental e histórico para predizer riscos de afastamento.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Predição de Riscos de Afastamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees?.slice(0, 5).map((employee: any) => {
                  const prediction = predictLeaveRisk(employee.id);
                  return (
                    <div 
                      key={employee.id} 
                      className="p-4 border border-border rounded-lg"
                      data-testid={`prediction-card-${employee.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.department || 'Departamento não informado'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              prediction.level === 'high' ? 'bg-red-100 text-red-800' :
                              prediction.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {prediction.level === 'high' ? 'Alto Risco' :
                             prediction.level === 'medium' ? 'Médio Risco' :
                             'Baixo Risco'}
                          </Badge>
                          <span className="text-sm font-medium">{prediction.probability}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Fatores de Risco:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {prediction.factors.map((factor, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
