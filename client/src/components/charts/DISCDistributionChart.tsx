import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DISCDistributionChartProps {
  data?: {
    D?: number;
    I?: number;
    S?: number;
    C?: number;
  };
  testId?: string;
}

export default function DISCDistributionChart({ data, testId }: DISCDistributionChartProps) {
  const discData = data || { D: 28, I: 35, S: 25, C: 12 };

  const discProfiles = [
    { 
      key: 'D', 
      label: 'Dominância (D)', 
      percentage: discData.D || 0, 
      color: 'bg-red-500' 
    },
    { 
      key: 'I', 
      label: 'Influência (I)', 
      percentage: discData.I || 0, 
      color: 'bg-yellow-500' 
    },
    { 
      key: 'S', 
      label: 'Estabilidade (S)', 
      percentage: discData.S || 0, 
      color: 'bg-green-500' 
    },
    { 
      key: 'C', 
      label: 'Conformidade (C)', 
      percentage: discData.C || 0, 
      color: 'bg-blue-500' 
    },
  ];

  return (
    <Card data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Distribuição DISC
          </CardTitle>
          <Button variant="link" className="text-sm text-primary hover:underline p-0">
            Ver detalhes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {discProfiles.map((profile) => (
            <div key={profile.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${profile.color} rounded-full`}></div>
                  <span className="font-medium">{profile.label}</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid={`disc-percentage-${profile.key}`}>
                  {profile.percentage}%
                </span>
              </div>
              <Progress value={profile.percentage} className="w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
