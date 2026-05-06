import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
