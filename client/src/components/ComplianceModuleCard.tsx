import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ComplianceModuleCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  metric?: {
    label: string;
    value: string | number;
  };
  iconColor?: string;
  testId?: string;
}

export default function ComplianceModuleCard({
  name,
  description,
  icon: Icon,
  isActive,
  metric,
  iconColor = 'text-accent',
  testId
}: ComplianceModuleCardProps) {
  return (
    <Card 
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      data-testid={testId}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-${iconColor.split('-')[1]}/10 rounded-lg flex items-center justify-center`}>
              <Icon className={`${iconColor} w-4 h-4`} />
            </div>
            <span className="font-medium">{name}</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-accent' : 'bg-muted'}`} />
        </div>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        {metric && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{metric.label}:</span>
            <span className="font-medium" data-testid={`metric-${testId}`}>
              {metric.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
