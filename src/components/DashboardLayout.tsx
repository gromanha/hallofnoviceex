import React, { memo } from 'react';
import { TopNavbar } from './TopNavbar';
import { Footer } from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLogin?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = memo(({ children, theme, onToggleTheme, onOpenLogin }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <TopNavbar theme={theme} onToggleTheme={onToggleTheme} onOpenLogin={onOpenLogin} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
