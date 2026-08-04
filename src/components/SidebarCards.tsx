import React from 'react';
import { WeekCalendarPreview } from './WeekCalendarPreview';
import { MembersCard } from './MembersCard';
import { FCCard } from './FCCard';
import { useLodestoneFC } from '../lib/useLodestoneFC';

export const SidebarCards: React.FC = () => {
  const lodestone = useLodestoneFC();

  return (
    <div className="hidden xl:flex flex-col w-80 shrink-0 space-y-5">
      {/* FC Card */}
      {lodestone && <FCCard lodestone={lodestone} />}
      
      {/* Week Calendar Preview */}
      <WeekCalendarPreview />
      
      {/* Members Card */}
      <MembersCard lodestone={lodestone} />
    </div>
  );
};
