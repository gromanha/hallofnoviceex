import React from 'react';
import { WeekCalendarPreview } from './WeekCalendarPreview';
import { MembersCard } from './MembersCard';
import { FCCard } from './FCCard';
import { useLodestoneFC } from '../lib/useLodestoneFC';

export const SidebarCards: React.FC = () => {
  const lodestone = useLodestoneFC();

  return (
    <>
      {/* Desktop: Vertical sidebar on xl+ */}
      <div className="hidden xl:flex flex-col w-80 shrink-0 space-y-5">
        {lodestone && <FCCard lodestone={lodestone} />}
        <WeekCalendarPreview />
        <MembersCard lodestone={lodestone} />
      </div>

      {/* Tablet/Mobile: Horizontal scrollable strip below posts */}
      <div className="xl:hidden w-full mt-8">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
          {lodestone && (
            <div className="snap-start shrink-0 w-[280px]">
              <FCCard lodestone={lodestone} />
            </div>
          )}
          <div className="snap-start shrink-0 w-[280px]">
            <WeekCalendarPreview />
          </div>
          <div className="snap-start shrink-0 w-[280px]">
            <MembersCard lodestone={lodestone} />
          </div>
        </div>
      </div>
    </>
  );
};
