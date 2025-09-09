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
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  Send, 
  Search, 
  Filter,
  Building,
  Stethoscope,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const referralSchema = z.object({
  userId: z.string().min(1, 'Selecione um funcionário'),
  serviceId: z.string().min(1, 'Selecione um serviço RAPS'),
  referralReason: z.string().min(1, 'Informe o motivo do encaminhamento'),
  urgency: z.enum(['baixa', 'media', 'alta', 'emergencia']),
});

type ReferralForm = z.infer<typeof referralSchema>;

export default function RAPSModule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const form = useForm<ReferralForm>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      urgency: 'media',
    },
  });

  // Mock RAPS services data
  const rapsServices = [
    {
      id: '1',
      name: 'CAPS AD Central',
      serviceType: 'CAPS',
      address: { rua: 'Rua das Flores, 123', cidade: 'São Paulo', cep: '01234-567' },
      phone: '(11) 3333-4444',
      specialties: ['dependencia_quimica', 'alcoolismo'],
      operatingHours: { inicio: '08:00', fim: '18:00' },
      capacity: 50,
      status: 'active'
    },
    {
      id: '2',
      name: 'UBS Vila Madalena',
      serviceType: 'UBS',
      address: { rua: 'Av. Principal, 456', cidade: 'São Paulo', cep: '05678-901' },
      phone: '(11) 5555-6666',
      specialties: ['atencao_basica', 'saude_mental'],
      operatingHours: { inicio: '07:00', fim: '17:00' },
      capacity: 100,
      status: 'active'
    },
    {
      id: '3',
      name: 'CAPS III Norte',
      serviceType: 'CAPS',
      address: { rua: 'Rua Central, 789', cidade: 'São Paulo', cep: '02345-678' },
      phone: '(11) 7777-8888',
      specialties: ['transtornos_mentais', 'crise_psiquiatrica'],
      operatingHours: { inicio: '24h', fim: '24h' },
      capacity: 75,
      status: 'active'
    }
  ];

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

  // Mock referrals data
  const referrals = [
    {
      id: '1',
      user: { name: 'João Silva', email: 'joao@company.com' },
      service: rapsServices[0],
      referralReason: 'Dependência química identificada através de avaliação DISC',
      urgency: 'alta',
      status: 'pending',
      referralDate: new Date('2024-01-15'),
      appointmentDate: new Date('2024-01-20'),
    },
    {
      id: '2',
      user: { name: 'Maria Santos', email: 'maria@company.com' },
      service: rapsServices[1],
      referralReason: 'Acompanhamento para transtorno de ansiedade',
      urgency: 'media',
      status: 'scheduled',
      referralDate: new Date('2024-01-10'),
      appointmentDate: new Date('2024-01-18'),
    }
  ];

  const onSubmit = (data: ReferralForm) => {
    // In a real implementation, this would call the API
    toast({
      title: "Encaminhamento criado!",
      description: "O encaminhamento RAPS foi registrado com sucesso.",
    });
    setIsNewReferralOpen(false);
    form.reset();
  };

  const getUrgencyBadge = (urgency: string) => {
    const configs = {
      'baixa': { label: 'Baixa', className: 'bg-green-100 text-green-800' },
      'media': { label: 'Média', className: 'bg-yellow-100 text-yellow-800' },
      'alta': { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      'emergencia': { label: 'Emergência', className: 'bg-red-100 text-red-800' },
    };
    const config = configs[urgency as keyof typeof configs] || configs['media'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'pending': { label: 'Pendente', className: 'bg-orange-100 text-orange-800' },
      'scheduled': { label: 'Agendado', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Concluído', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
    };
    const config = configs[status as keyof typeof configs] || configs['pending'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'CAPS':
        return <Stethoscope className="w-4 h-4" />;
      case 'UBS':
        return <Building className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const filteredServices = rapsServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || service.serviceType === filterType;
    return matchesSearch && matchesType;
  });

  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const scheduledReferrals = referrals.filter(r => r.status === 'scheduled').length;
  const emergencyReferrals = referrals.filter(r => r.urgency === 'emergencia').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Módulo RAPS</h2>
          <p className="text-muted-foreground">
            Rede de Atenção Psicossocial - Encaminhamentos inteligentes para o SUS
          </p>
        </div>
        <Dialog open={isNewReferralOpen} onOpenChange={setIsNewReferralOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-referral">
              <Plus className="w-4 h-4 mr-2" />
              Novo Encaminhamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Encaminhamento RAPS</DialogTitle>
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
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço RAPS</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service">
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rapsServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {service.serviceType}
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
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-urgency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="emergencia">Emergência</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo do Encaminhamento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o motivo e justificativa para o encaminhamento..."
                          {...field}
                          data-testid="textarea-reason"
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
                    onClick={() => setIsNewReferralOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" data-testid="button-save-referral">
                    Criar Encaminhamento
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Emergency Alert */}
      {emergencyReferrals > 0 && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <strong className="text-destructive">Atenção:</strong> {emergencyReferrals} encaminhamento(s) de emergência aguardando atendimento.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Encaminhamentos</p>
                <h3 className="text-2xl font-bold text-foreground" data-testid="metric-total-referrals">
                  {referrals.length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Send className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <h3 className="text-2xl font-bold text-orange-600" data-testid="metric-pending-referrals">
                  {pendingReferrals}
                </h3>
                <p className="text-xs text-muted-foreground">Aguardando resposta</p>
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
                <p className="text-sm text-muted-foreground">Agendados</p>
                <h3 className="text-2xl font-bold text-blue-600" data-testid="metric-scheduled-referrals">
                  {scheduledReferrals}
                </h3>
                <p className="text-xs text-muted-foreground">Com data marcada</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Serviços Disponíveis</p>
                <h3 className="text-2xl font-bold text-accent" data-testid="metric-available-services">
                  {rapsServices.length}
                </h3>
                <p className="text-xs text-accent">Na rede RAPS</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Building className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services and Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAPS Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Serviços RAPS Disponíveis</CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-40"
                    data-testid="input-search-services"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="CAPS">CAPS</SelectItem>
                    <SelectItem value="UBS">UBS</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`service-card-${service.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getServiceTypeIcon(service.serviceType)}
                      <h4 className="font-medium">{service.name}</h4>
                    </div>
                    <Badge variant="outline">{service.serviceType}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{service.address.rua}, {service.address.cidade}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{service.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {service.operatingHours.inicio} - {service.operatingHours.fim}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Capacidade: {service.capacity} pacientes</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {service.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Encaminhamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div 
                  key={referral.id} 
                  className="p-4 border border-border rounded-lg"
                  data-testid={`referral-card-${referral.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{referral.user.name}</h4>
                      <p className="text-sm text-muted-foreground">{referral.user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      {getUrgencyBadge(referral.urgency)}
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Serviço:</span> {referral.service.name}
                    </div>
                    <div>
                      <span className="font-medium">Motivo:</span> {referral.referralReason}
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Encaminhado: {referral.referralDate.toLocaleDateString('pt-BR')}</span>
                      {referral.appointmentDate && (
                        <span>Agendado: {referral.appointmentDate.toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
