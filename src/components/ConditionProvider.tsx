'use client';

import { ReactNode } from 'react';
import { ConditionContext, useConditionLoader } from '@/lib/useCondition';

export function ConditionProvider({ children }: { children: ReactNode }) {
  const value = useConditionLoader();
  return (
    <ConditionContext.Provider value={value}>
      {children}
    </ConditionContext.Provider>
  );
}
