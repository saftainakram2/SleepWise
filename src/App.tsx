import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getSettings, initializeSettings } from './lib/db';

import { Layout } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { SleepLoggerScreen } from './screens/SleepLoggerScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { LifestyleLoggerScreen } from './screens/LifestyleLoggerScreen';
import { SleepDebtScreen } from './screens/SleepDebtScreen';
import { BedtimeReminderScreen } from './screens/BedtimeReminderScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ScoreCardScreen } from './screens/ScoreCardScreen';
import { TipsLibraryScreen } from './screens/TipsLibraryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CaffeineTrackerScreen } from './screens/CaffeineTrackerScreen';
import { SleepCalculatorScreen } from './screens/SleepCalculatorScreen';
import { LabsScreen } from './screens/LabsScreen';
import { NightStandScreen } from './screens/NightStandScreen';
import { OnboardingFlow } from './onboarding/OnboardingFlow';

export function AppContent() {
  const settings = useLiveQuery(getSettings);

  React.useEffect(() => {
    initializeSettings();
  }, []);

  if (settings === undefined) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center text-text-primary">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold tracking-widest text-[10px] uppercase opacity-50">Waking Up</p>
          </div>
      </div>
    );
  }

  if (!settings.onboarded) {
    return (
      <div className="bg-bg-dark text-text-primary min-h-screen font-sans antialiased">
        <OnboardingFlow />
      </div>
    );
  }

  return <Layout />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppContent />,
    children: [
      { path: '/', element: <HomeScreen /> },
      { path: '/analytics', element: <AnalyticsScreen /> },
      { path: '/insights', element: <InsightsScreen /> },
      { path: '/calendar', element: <CalendarScreen /> },
      { path: '/settings', element: <SettingsScreen /> },
      { path: '/debt', element: <SleepDebtScreen /> },
      { path: '/reminders', element: <BedtimeReminderScreen /> },
      { path: '/scorecard', element: <ScoreCardScreen /> },
      { path: '/tips', element: <TipsLibraryScreen /> },
      { path: '/caffeine', element: <CaffeineTrackerScreen /> },
      { path: '/calculator', element: <SleepCalculatorScreen /> },
      { path: '/labs', element: <LabsScreen /> },
    ],
  },
  { path: '/log', element: <SleepLoggerScreen /> },
  { path: '/lifestyle', element: <LifestyleLoggerScreen /> },
  { path: '/night-stand', element: <NightStandScreen /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
