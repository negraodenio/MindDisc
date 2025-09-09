import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface MentalHealthTrendsChartProps {
  data?: any[];
  testId?: string;
}

export default function MentalHealthTrendsChart({ data, testId }: MentalHealthTrendsChartProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Tendências de Saúde Mental
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Bem-estar</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Estresse</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 chart-container rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <BarChart3 className="w-16 h-16 mb-4 mx-auto" />
            <p className="text-sm opacity-90">Gráfico de Tendências de Saúde Mental</p>
            <p className="text-xs opacity-70 mt-2">Dados dos últimos 6 meses</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
