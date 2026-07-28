import React, { memo } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = memo(({ children, theme, onToggleTheme }) => {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar theme={theme} onToggleTheme={onToggleTheme} />
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
