import React, { memo } from 'react';
import { Sidebar } from './Sidebar';
import { useLodestoneFC } from '../lib/useLodestoneFC';

interface DashboardLayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLogin?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = memo(({ children, theme, onToggleTheme, onOpenLogin }) => {
  const lodestone = useLodestoneFC();

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar theme={theme} onToggleTheme={onToggleTheme} onOpenLogin={onOpenLogin} lodestone={lodestone} />
      <div className="flex-1 min-w-0 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
