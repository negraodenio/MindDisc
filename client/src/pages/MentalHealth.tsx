import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Eye, 
  Download, 
  AlertCircle, 
  HeartPulse, 
  Brain, 
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

const mentalHealthSchema = z.object({
  userId: z.string().min(1, 'Selecione um funcionário'),
  protocolType: z.enum(['PHQ-9', 'GAD-7', 'MBI', 'PSS-10', 'DASS-21']),
  responses: z.record(z.number()),
  totalScore: z.number(),
  riskLevel: z.enum(['baixo', 'moderado', 'alto', 'severo']),
  suggestedDiagnosis: z.string().optional(),
  recommendations: z.array(z.string()),
  requiresIntervention: z.boolean(),
});

type MentalHealthForm = z.infer<typeof mentalHealthSchema>;

export default function MentalHealth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');

  const form = useForm<MentalHealthForm>({
    resolver: zodResolver(mentalHealthSchema),
    defaultValues: {
      responses: {},
      recommendations: [],
      requiresIntervention: false,
    },
  });

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['/api/assessments/mental-health/company', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/assessments/mental-health/company/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch mental health assessments');
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

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: MentalHealthForm) => {
      return apiRequest('POST', '/api/assessments/mental-health', {
        ...data,
        companyId: user?.companyId,
        evaluatorId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments/mental-health/company'] });
      setIsNewAssessmentOpen(false);
      form.reset();
      toast({
        title: "Avaliação criada com sucesso!",
        description: "A avaliação de saúde mental foi registrada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar avaliação",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MentalHealthForm) => {
    createAssessmentMutation.mutate(data);
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const colors = {
      'baixo': 'bg-green-100 text-green-800',
      'moderado': 'bg-yellow-100 text-yellow-800',
      'alto': 'bg-orange-100 text-orange-800',
      'severo': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {riskLevel}
      </Badge>
    );
  };

  const getProtocolInfo = (protocol: string) => {
    const protocols = {
      'PHQ-9': { name: 'Questionário de Saúde do Paciente (Depressão)', maxScore: 27 },
      'GAD-7': { name: 'Transtorno de Ansiedade Generalizada', maxScore: 21 },
      'MBI': { name: 'Inventário de Burnout de Maslach', maxScore: 132 },
      'PSS-10': { name: 'Escala de Estresse Percebido', maxScore: 40 },
      'DASS-21': { name: 'Depressão, Ansiedade e Estresse', maxScore: 63 }
    };
    return protocols[protocol as keyof typeof protocols] || { name: protocol, maxScore: 0 };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const highRiskAssessments = assessments?.filter((a: any) => a.riskLevel === 'alto' || a.riskLevel === 'severo') || [];
  const totalAssessments = assessments?.length || 0;
  const avgScore = assessments?.reduce((acc: number, curr: any) => acc + (curr.totalScore || 0), 0) / totalAssessments || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Saúde Mental</h2>
          <p className="text-muted-foreground">
            Protocolos validados para avaliação e monitoramento da saúde mental
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" data-testid="button-export-mental-health">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-mental-health-assessment">
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Avaliação de Saúde Mental</DialogTitle>
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
                    name="protocolType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protocolo de Avaliação</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedProtocol(value);
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-protocol">
                              <SelectValue placeholder="Selecione um protocolo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PHQ-9">PHQ-9 - Depressão</SelectItem>
                            <SelectItem value="GAD-7">GAD-7 - Ansiedade</SelectItem>
                            <SelectItem value="MBI">MBI - Burnout</SelectItem>
                            <SelectItem value="PSS-10">PSS-10 - Estresse</SelectItem>
                            <SelectItem value="DASS-21">DASS-21 - Depressão/Ansiedade/Estresse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedProtocol && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">{getProtocolInfo(selectedProtocol).name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Pontuação máxima: {getProtocolInfo(selectedProtocol).maxScore}
                      </p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="totalScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pontuação Total</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-total-score"
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
                        <FormLabel>Nível de Risco</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-risk-level">
                              <SelectValue placeholder="Selecione o nível de risco" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="baixo">Baixo</SelectItem>
                            <SelectItem value="moderado">Moderado</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                            <SelectItem value="severo">Severo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="suggestedDiagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico Sugerido (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Diagnóstico clínico sugerido..."
                            {...field}
                            data-testid="textarea-diagnosis"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsNewAssessmentOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAssessmentMutation.isPending}
                      data-testid="button-save-assessment"
                    >
                      {createAssessmentMutation.isPending ? 'Salvando...' : 'Salvar Avaliação'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* High Risk Alert */}
      {highRiskAssessments.length > 0 && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <strong className="text-destructive">Atenção:</strong> {highRiskAssessments.length} funcionário(s) com alto risco identificado. Intervenção imediata necessária.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-total-assessments">
                  {totalAssessments}
                </h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <HeartPulse className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <h3 className="text-2xl font-bold text-destructive" data-testid="metric-high-risk">
                  {highRiskAssessments.length}
                </h3>
                <p className="text-xs text-muted-foreground">Requer intervenção</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-destructive w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pontuação Média</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-average-score">
                  {avgScore.toFixed(1)}
                </h3>
                <p className="text-xs text-accent">Índice geral</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-secondary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Protocolos Ativos</p>
                <h3 className="text-2xl font-bold text-foreground">5</h3>
                <p className="text-xs text-muted-foreground">PHQ-9, GAD-7, MBI, PSS-10, DASS-21</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Brain className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Avaliações de Saúde Mental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Data da Avaliação</TableHead>
                <TableHead>Pontuação</TableHead>
                <TableHead>Nível de Risco</TableHead>
                <TableHead>Intervenção</TableHead>
                <TableHead>Avaliador</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments?.map((assessment: any) => (
                <TableRow key={assessment.id} data-testid={`row-mental-health-${assessment.id}`}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {assessment.user?.name || 'Usuário não encontrado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assessment.user?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {assessment.protocolType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(assessment.assessmentDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {assessment.totalScore || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {assessment.riskLevel && getRiskLevelBadge(assessment.riskLevel)}
                  </TableCell>
                  <TableCell>
                    {assessment.requiresIntervention ? (
                      <Badge className="bg-orange-100 text-orange-800">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {assessment.evaluator?.name || 'Sistema'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-view-mental-health-${assessment.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!assessments || assessments.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma avaliação de saúde mental encontrada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
