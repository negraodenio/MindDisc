import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  timestamp: string;
  iconColor?: string;
  testId?: string;
}

export default function ActivityItem({
  icon: Icon,
  title,
  description,
  timestamp,
  iconColor = 'text-primary',
  testId
}: ActivityItemProps) {
  return (
    <div 
      className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
      data-testid={testId}
    >
      <div className={`w-8 h-8 bg-${iconColor.split('-')[1]}/10 rounded-full flex items-center justify-center flex-shrink-0`}>
        <Icon className={`${iconColor} w-4 h-4`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
      </div>
    </div>
  );
}
