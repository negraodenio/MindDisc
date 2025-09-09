import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  iconColor?: string;
  testId?: string;
}

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendType = 'neutral',
  iconColor = 'text-primary',
  testId
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-accent';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="metric-card" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className={`w-12 h-12 bg-${iconColor.split('-')[1]}/10 rounded-lg flex items-center justify-center`}>
          <Icon className={`${iconColor} w-6 h-6`} />
        </div>
        {trend && (
          <Badge variant="outline" className={getTrendColor()}>
            {trend}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground" data-testid={`metric-value-${testId}`}>
            {value}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
