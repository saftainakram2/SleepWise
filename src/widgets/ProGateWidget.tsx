import React from 'react';

interface ProGateWidgetProps {
  children: React.ReactNode;
  title: string;
}

export function ProGateWidget({ children, title }: ProGateWidgetProps) {
  // Pro check bypassed for now as per request
  return <>{children}</>;
}
