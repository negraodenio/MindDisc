import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AlertCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  priority: 'high' | 'medium' | 'low' | 'info';
  onAction?: () => void;
  testId?: string;
}

export default function AlertCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  priority,
  onAction,
  testId
}: AlertCardProps) {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return {
          background: 'bg-destructive/10',
          border: 'border-destructive/20',
          iconColor: 'text-destructive',
          titleColor: 'text-destructive',
          buttonColor: 'text-destructive'
        };
      case 'medium':
        return {
          background: 'bg-chart-4/10',
          border: 'border-chart-4/20',
          iconColor: 'text-chart-4',
          titleColor: 'text-chart-4',
          buttonColor: 'text-chart-4'
        };
      case 'info':
        return {
          background: 'bg-primary/10',
          border: 'border-primary/20',
          iconColor: 'text-primary',
          titleColor: 'text-primary',
          buttonColor: 'text-primary'
        };
      default:
        return {
          background: 'bg-muted/10',
          border: 'border-muted/20',
          iconColor: 'text-muted-foreground',
          titleColor: 'text-foreground',
          buttonColor: 'text-muted-foreground'
        };
    }
  };

  const styles = getPriorityStyles();

  return (
    <Card className={`${styles.background} ${styles.border}`} data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Icon className={`${styles.iconColor} w-5 h-5 mt-1`} />
          <div className="flex-1">
            <h4 className={`font-medium ${styles.titleColor} mb-1`}>{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button 
              variant="link" 
              className={`mt-2 p-0 h-auto text-xs ${styles.buttonColor} hover:underline font-medium`}
              onClick={onAction}
              data-testid={`button-${testId}`}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
