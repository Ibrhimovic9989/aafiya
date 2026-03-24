'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ConditionId, ConditionProfile } from './conditions/types';
import { getConditionProfile } from './conditions/index';
import { crohnsProfile } from './conditions/crohns';
import { getProfileSafe, updateProfile } from '@/actions/profile';

interface ConditionContextValue {
  conditionId: ConditionId;
  profile: ConditionProfile;
  loading: boolean;
  setCondition: (id: ConditionId) => Promise<void>;
}

const defaultValue: ConditionContextValue = {
  conditionId: 'crohns',
  profile: crohnsProfile,
  loading: true,
  setCondition: async () => {},
};

export const ConditionContext = createContext<ConditionContextValue>(defaultValue);

export function useCondition() {
  return useContext(ConditionContext);
}

export function useConditionLoader(): ConditionContextValue {
  const [conditionId, setConditionId] = useState<ConditionId>('crohns');
  const [profile, setProfile] = useState<ConditionProfile>(crohnsProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserCondition() {
      try {
        const userProfile = await getProfileSafe();
        if (userProfile?.conditionId) {
          const loaded = await getConditionProfile(userProfile.conditionId as ConditionId);
          setConditionId(userProfile.conditionId as ConditionId);
          setProfile(loaded);
        }
      } catch (err) {
        console.error('Failed to load condition:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserCondition();
  }, []);

  const setCondition = async (id: ConditionId) => {
    setLoading(true);
    try {
      const loaded = await getConditionProfile(id);
      setConditionId(id);
      setProfile(loaded);
      await updateProfile({ conditionId: id });
    } catch (err) {
      console.error('Failed to set condition:', err);
    } finally {
      setLoading(false);
    }
  };

  return { conditionId, profile, loading, setCondition };
}
