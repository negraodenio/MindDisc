import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Users, 
  ClipboardCheck, 
  HeartPulse, 
  AlertTriangle, 
  Network, 
  Landmark, 
  Shield, 
  UserCheck, 
  FileText, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const mainMenuItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Gestão de Funcionários', href: '/employees' },
  { icon: ClipboardCheck, label: 'Avaliações DISC', href: '/disc-assessments' },
  { icon: HeartPulse, label: 'Saúde Mental', href: '/mental-health' },
  { icon: AlertTriangle, label: 'Riscos Psicossociais', href: '/psychosocial-risks' },
];

const complianceMenuItems = [
  { icon: Network, label: 'RAPS', href: '/raps', isNew: true },
  { icon: Landmark, label: 'INSS', href: '/inss', isNew: true },
  { icon: Shield, label: 'LGPD Saúde', href: '/lgpd' },
  { icon: UserCheck, label: 'Inclusão', href: '/inclusion' },
];

const systemMenuItems = [
  { icon: FileText, label: 'Relatórios', href: '/reports' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const renderMenuItem = (item: any) => (
    <Link key={item.href} href={item.href}>
      <a 
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg transition-colors",
          isActive(item.href) 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}
        data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
        {item.isNew && (
          <Badge className="ml-auto bg-accent text-accent-foreground text-xs">
            Novo
          </Badge>
        )}
      </a>
    </Link>
  );

  return (
    <aside className="w-64 bg-card border-r border-border sidebar-transition" data-testid="sidebar">
      <nav className="p-6 space-y-2">
        {/* Main Modules */}
        <div className="space-y-2">
          {mainMenuItems.map(renderMenuItem)}
        </div>
        
        {/* Compliance Modules */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Compliance
          </p>
          <div className="space-y-2">
            {complianceMenuItems.map(renderMenuItem)}
          </div>
        </div>
        
        {/* System */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Sistema
          </p>
          <div className="space-y-2">
            {systemMenuItems.map(renderMenuItem)}
          </div>
        </div>
      </nav>
    </aside>
  );
}
