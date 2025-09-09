import React from 'react';
import { Bell, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MindDisc Pro</h1>
                <p className="text-sm text-muted-foreground">Saúde Mental Corporativa</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Compliance Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-accent/10 px-3 py-2 rounded-md">
              <Shield className="text-accent w-4 h-4" />
              <span className="text-sm font-medium text-accent-foreground">Compliance 360°</span>
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="text-muted-foreground w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground" data-testid="text-username">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                  {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                onClick={logout}
                data-testid="button-user-menu"
              >
                <User className="text-primary-foreground w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
