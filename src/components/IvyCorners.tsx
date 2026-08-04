import React from 'react';

export function IvyCorners() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top-left */}
      <img
        src="/svg/ivy-corner.svg"
        alt=""
        className="absolute top-0 left-0 w-24 h-24 opacity-15 dark:opacity-8"
        style={{ filter: 'hue-rotate(0deg)' }}
      />
      {/* Top-right */}
      <img
        src="/svg/ivy-corner.svg"
        alt=""
        className="absolute top-0 right-0 w-24 h-24 opacity-15 dark:opacity-8"
        style={{ transform: 'scaleX(-1)', filter: 'hue-rotate(10deg)' }}
      />
      {/* Bottom-left */}
      <img
        src="/svg/ivy-corner.svg"
        alt=""
        className="absolute bottom-0 left-0 w-24 h-24 opacity-15 dark:opacity-8"
        style={{ transform: 'scaleY(-1)', filter: 'hue-rotate(-5deg)' }}
      />
      {/* Bottom-right */}
      <img
        src="/svg/ivy-corner.svg"
        alt=""
        className="absolute bottom-0 right-0 w-24 h-24 opacity-15 dark:opacity-8"
        style={{ transform: 'scale(-1, -1)', filter: 'hue-rotate(5deg)' }}
      />
    </div>
  );
}