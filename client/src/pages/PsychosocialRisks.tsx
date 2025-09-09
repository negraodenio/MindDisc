import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Edit,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

const psychosocialRiskSchema = z.object({
  userId: z.string().optional(),
  sector: z.string().min(1, 'Informe o setor'),
  riskType: z.string().min(1, 'Informe o tipo de risco'),
  description: z.string().min(1, 'Informe a descrição'),
  riskLevel: z.number().min(1).max(5),
  controlMeasures: z.array(z.string()),
  responsibleId: z.string().optional(),
  implementationDeadline: z.string().min(1, 'Informe o prazo'),
  status: z.enum(['identified', 'in_progress', 'resolved']).default('identified'),
});

type PsychosocialRiskForm = z.infer<typeof psychosocialRiskSchema>;

export default function PsychosocialRisks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewRiskOpen, setIsNewRiskOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  const form = useForm<PsychosocialRiskForm>({
    resolver: zodResolver(psychosocialRiskSchema),
    defaultValues: {
      controlMeasures: [],
      status: 'identified',
    },
  });

  const { data: risks, isLoading } = useQuery({
    queryKey: ['/api/risks/psychosocial/company', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/risks/psychosocial/company/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch psychosocial risks');
      }
      return response.json();
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

  const createRiskMutation = useMutation({
    mutationFn: async (data: PsychosocialRiskForm) => {
      return apiRequest('POST', '/api/risks/psychosocial', {
        ...data,
        companyId: user?.companyId,
        implementationDeadline: new Date(data.implementationDeadline).toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/risks/psychosocial/company'] });
      setIsNewRiskOpen(false);
      form.reset();
      toast({
        title: "Risco criado com sucesso!",
        description: "O risco psicossocial foi registrado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar risco",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateRiskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<PsychosocialRiskForm> }) => {
      return apiRequest('PUT', `/api/risks/psychosocial/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/risks/psychosocial/company'] });
      toast({
        title: "Risco atualizado!",
        description: "As informações foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar risco",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PsychosocialRiskForm) => {
    createRiskMutation.mutate(data);
  };

  const getRiskLevelBadge = (level: number) => {
    const configs = {
      1: { label: 'Muito Baixo', className: 'bg-green-100 text-green-800' },
      2: { label: 'Baixo', className: 'bg-green-100 text-green-800' },
      3: { label: 'Médio', className: 'bg-yellow-100 text-yellow-800' },
      4: { label: 'Alto', className: 'bg-orange-100 text-orange-800' },
      5: { label: 'Muito Alto', className: 'bg-red-100 text-red-800' },
    };
    const config = configs[level as keyof typeof configs] || configs[1];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'identified': { label: 'Identificado', className: 'bg-orange-100 text-orange-800' },
      'in_progress': { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      'resolved': { label: 'Resolvido', className: 'bg-green-100 text-green-800' },
    };
    const config = configs[status as keyof typeof configs] || configs['identified'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const updateRiskStatus = (riskId: string, newStatus: string) => {
    updateRiskMutation.mutate({
      id: riskId,
      data: { status: newStatus as any }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const highRisks = risks?.filter((r: any) => r.riskLevel >= 4) || [];
  const activeRisks = risks?.filter((r: any) => r.status !== 'resolved') || [];
  const resolvedRisks = risks?.filter((r: any) => r.status === 'resolved') || [];
  const overdueRisks = risks?.filter((r: any) => 
    r.implementationDeadline && 
    new Date(r.implementationDeadline) < new Date() && 
    r.status !== 'resolved'
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Riscos Psicossociais</h2>
          <p className="text-muted-foreground">
            Gestão de riscos conforme NR-1 - Programa de Gerenciamento de Riscos
          </p>
        </div>
        <Dialog open={isNewRiskOpen} onOpenChange={setIsNewRiskOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-risk">
              <Plus className="w-4 h-4 mr-2" />
              Identificar Risco
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Identificar Novo Risco Psicossocial</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Vendas, TI, RH" 
                            {...field} 
                            data-testid="input-sector"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Risco (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="5" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-risk-level"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="riskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Risco</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Sobrecarga de trabalho, Assédio moral, Ambiente tóxico" 
                          {...field} 
                          data-testid="input-risk-type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o risco identificado..."
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-responsible">
                              <SelectValue placeholder="Selecione um responsável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.map((employee: any) => (
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

                  <FormField
                    control={form.control}
                    name="implementationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo para Implementação</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-deadline"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewRiskOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRiskMutation.isPending}
                    data-testid="button-save-risk"
                  >
                    {createRiskMutation.isPending ? 'Salvando...' : 'Identificar Risco'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {highRisks.length > 0 && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <strong className="text-destructive">Alerta:</strong> {highRisks.length} risco(s) de alto nível identificado(s). Ação imediata necessária.
          </AlertDescription>
        </Alert>
      )}

      {overdueRisks.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong className="text-orange-800">Atenção:</strong> {overdueRisks.length} risco(s) com prazo vencido para implementação de medidas.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Riscos Ativos</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-active-risks">
                  {activeRisks.length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-orange-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <h3 className="text-2xl font-bold text-destructive" data-testid="metric-high-risks">
                  {highRisks.length}
                </h3>
                <p className="text-xs text-muted-foreground">Nível 4-5</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Shield className="text-destructive w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <h3 className="text-2xl font-bold text-accent" data-testid="metric-resolved-risks">
                  {resolvedRisks.length}
                </h3>
                <p className="text-xs text-accent">Este mês</p>
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
                <p className="text-sm text-muted-foreground">Prazos Vencidos</p>
                <h3 className="text-2xl font-bold text-orange-600" data-testid="metric-overdue-risks">
                  {overdueRisks.length}
                </h3>
                <p className="text-xs text-muted-foreground">Necessita ação</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risks Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Riscos Psicossociais Identificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setor</TableHead>
                <TableHead>Tipo de Risco</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Data Identificação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks?.map((risk: any) => (
                <TableRow key={risk.id} data-testid={`row-risk-${risk.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{risk.sector}</p>
                      <p className="text-sm text-muted-foreground">
                        {risk.user?.name || 'Geral'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{risk.riskType}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {risk.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRiskLevelBadge(risk.riskLevel)}
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={risk.status} 
                      onValueChange={(value) => updateRiskStatus(risk.id, value)}
                      disabled={updateRiskMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="identified">Identificado</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {risk.responsible?.name || 'Não atribuído'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {risk.implementationDeadline && (
                        <>
                          <span className="text-sm">
                            {new Date(risk.implementationDeadline).toLocaleDateString('pt-BR')}
                          </span>
                          {new Date(risk.implementationDeadline) < new Date() && risk.status !== 'resolved' && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Vencido</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(risk.identificationDate).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-view-risk-${risk.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-edit-risk-${risk.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!risks || risks.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum risco psicossocial identificado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
