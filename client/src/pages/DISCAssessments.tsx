import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';

export default function DISCAssessments() {
  const { user } = useAuth();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['/api/assessments/disc/company', user?.companyId],
    enabled: !!user?.companyId,
    queryFn: async () => {
      const response = await fetch(`/api/assessments/disc/company/${user?.companyId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch DISC assessments');
      }
      return response.json();
    },
  });

  const getProfileBadge = (profile: string) => {
    const colors = {
      'D': 'bg-red-100 text-red-800',
      'I': 'bg-yellow-100 text-yellow-800',
      'S': 'bg-green-100 text-green-800',
      'C': 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={colors[profile as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {profile}
      </Badge>
    );
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Avaliações DISC</h2>
          <p className="text-muted-foreground">
            Perfis comportamentais e análises preditivas dos funcionários
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" data-testid="button-export-assessments">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button data-testid="button-new-assessment">
            <Plus className="w-4 h-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <h3 className="text-2xl font-bold text-foreground">
                  {assessments?.length || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-clipboard-check text-primary"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Perfil Dominante</p>
                <h3 className="text-2xl font-bold text-foreground">I</h3>
                <p className="text-xs text-muted-foreground">Influência (35%)</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-yellow-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliações Este Mês</p>
                <h3 className="text-2xl font-bold text-foreground">24</h3>
                <p className="text-xs text-accent">+18% vs mês anterior</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-accent"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <h3 className="text-2xl font-bold text-foreground">87%</h3>
                <p className="text-xs text-accent">Meta: 85%</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-target text-secondary"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Avaliações Realizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Data da Avaliação</TableHead>
                <TableHead>Perfil Primário</TableHead>
                <TableHead>Perfil Secundário</TableHead>
                <TableHead>Pontuação D</TableHead>
                <TableHead>Pontuação I</TableHead>
                <TableHead>Pontuação S</TableHead>
                <TableHead>Pontuação C</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments?.map((assessment: any) => (
                <TableRow key={assessment.id} data-testid={`row-assessment-${assessment.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {assessment.user?.name || 'Usuário não encontrado'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.user?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assessment.assessmentDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {assessment.primaryProfile && getProfileBadge(assessment.primaryProfile)}
                  </TableCell>
                  <TableCell>
                    {assessment.secondaryProfile && getProfileBadge(assessment.secondaryProfile)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {assessment.scoreD || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {assessment.scoreI || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {assessment.scoreS || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {assessment.scoreC || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-view-assessment-${assessment.id}`}
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
                Nenhuma avaliação DISC encontrada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
