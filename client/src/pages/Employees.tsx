import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Filter, MoreHorizontal, Brain, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';

export default function Employees() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: employees, isLoading } = useQuery({
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

  const filteredEmployees = employees?.filter((employee: any) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800">Administrador</Badge>;
      case 'hr':
        return <Badge className="bg-purple-100 text-purple-800">RH</Badge>;
      default:
        return <Badge variant="outline">Funcionário</Badge>;
    }
  };

  const getAIRiskBadge = (employeeId: number) => {
    // Simulação de risco baseado no ID para demonstração
    const riskLevel = (employeeId % 3) + 1;
    
    switch (riskLevel) {
      case 1:
        return (
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <Badge className="bg-green-100 text-green-800">Baixo</Badge>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            <Badge className="bg-yellow-100 text-yellow-800">Moderado</Badge>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <Badge className="bg-red-100 text-red-800">Alto</Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-gray-400" />
            <Badge variant="outline">Pendente</Badge>
          </div>
        );
    }
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestão de Funcionários</h2>
          <p className="text-muted-foreground">
            Gerenciamento completo dos funcionários e suas avaliações
          </p>
        </div>
        <Button data-testid="button-add-employee">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* AI Dashboard for Managers */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  🧠 Análises de IA - Equipe
                  <Badge className="ml-3 bg-green-100 text-green-800 text-xs">ATIVO</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Predições individuais e análises comportamentais da equipe
                </p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              data-testid="button-generate-team-predictions"
            >
              <Brain className="w-4 h-4 mr-2" />
              Analisar Equipe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">3</p>
              <p className="text-sm text-red-600">Alto Risco</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-700">8</p>
              <p className="text-sm text-yellow-600">Moderado</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">15</p>
              <p className="text-sm text-green-600">Baixo Risco</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Brain className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">5</p>
              <p className="text-sm text-gray-600">Pendente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-employees"
              />
            </div>
            <Button variant="outline" data-testid="button-filter">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Funcionários ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Última Avaliação</TableHead>
                <TableHead>Predição IA</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee: any) => (
                <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium" data-testid={`text-employee-name-${employee.id}`}>
                          {employee.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span data-testid={`text-department-${employee.id}`}>
                      {employee.department || 'Não informado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span data-testid={`text-position-${employee.id}`}>
                      {employee.position || 'Não informado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(employee.status)}
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(employee.role)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {employee.lastAssessment ? 
                        new Date(employee.lastAssessment).toLocaleDateString('pt-BR') : 
                        'Nunca'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    {getAIRiskBadge(employee.id)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`button-actions-${employee.id}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
