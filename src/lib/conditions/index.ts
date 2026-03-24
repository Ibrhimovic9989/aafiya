/**
 * Condition Registry
 *
 * Central index of all supported autoimmune conditions.
 * Import individual profiles lazily to keep bundle size manageable.
 */

import type { ConditionId, ConditionProfile, ConditionCategory } from './types';
import { crohnsProfile } from './crohns';

// Lazy-loaded condition map
const profileCache = new Map<ConditionId, ConditionProfile>();
profileCache.set('crohns', crohnsProfile);

// All condition metadata for selection UI (lightweight, no full profiles loaded)
export interface ConditionOption {
  id: ConditionId;
  name: string;
  shortName: string;
  category: ConditionCategory;
  icon: string;
  description: string;
}

export const CONDITION_OPTIONS: ConditionOption[] = [
  { id: 'crohns', name: "Crohn's Disease", shortName: "Crohn's", category: 'gastrointestinal', icon: '🫄', description: 'Inflammatory bowel disease affecting the digestive tract' },
  { id: 'ulcerative_colitis', name: 'Ulcerative Colitis', shortName: 'UC', category: 'gastrointestinal', icon: '🫄', description: 'Inflammatory bowel disease affecting the colon and rectum' },
  { id: 'rheumatoid_arthritis', name: 'Rheumatoid Arthritis', shortName: 'RA', category: 'rheumatic', icon: '🦴', description: 'Autoimmune condition causing joint inflammation and pain' },
  { id: 'lupus', name: 'Lupus (SLE)', shortName: 'Lupus', category: 'rheumatic', icon: '🦋', description: 'Systemic autoimmune condition affecting multiple organs' },
  { id: 'psoriasis', name: 'Psoriasis / Psoriatic Arthritis', shortName: 'Psoriasis', category: 'dermatological', icon: '🧴', description: 'Autoimmune skin condition with possible joint involvement' },
  { id: 'ankylosing_spondylitis', name: 'Ankylosing Spondylitis', shortName: 'AS', category: 'rheumatic', icon: '🦴', description: 'Inflammatory condition primarily affecting the spine' },
  { id: 'multiple_sclerosis', name: 'Multiple Sclerosis', shortName: 'MS', category: 'neurological', icon: '🧠', description: 'Autoimmune condition affecting the brain and spinal cord' },
  { id: 'hashimotos', name: "Hashimoto's Thyroiditis", shortName: "Hashimoto's", category: 'endocrine', icon: '🦋', description: 'Autoimmune thyroid condition causing underactive thyroid' },
  { id: 'celiac', name: 'Celiac Disease', shortName: 'Celiac', category: 'gastrointestinal', icon: '🌾', description: 'Autoimmune reaction to gluten damaging the small intestine' },
  { id: 'type1_diabetes', name: 'Type 1 Diabetes', shortName: 'T1D', category: 'endocrine', icon: '💉', description: 'Autoimmune condition where the body attacks insulin-producing cells' },
];

export const CATEGORY_LABELS: Record<ConditionCategory, string> = {
  gastrointestinal: 'Digestive',
  rheumatic: 'Joints & Connective Tissue',
  neurological: 'Neurological',
  endocrine: 'Hormonal',
  dermatological: 'Skin',
};

/**
 * Get the full condition profile for a given condition ID.
 * Dynamically imports profiles to avoid loading all conditions upfront.
 */
export async function getConditionProfile(id: ConditionId): Promise<ConditionProfile> {
  if (profileCache.has(id)) {
    return profileCache.get(id)!;
  }

  let profile: ConditionProfile;

  switch (id) {
    case 'crohns':
      profile = crohnsProfile;
      break;
    case 'ulcerative_colitis': {
      const mod = await import('./ulcerative-colitis');
      profile = mod.ulcerativeColitisProfile;
      break;
    }
    case 'rheumatoid_arthritis': {
      const mod = await import('./rheumatoid-arthritis');
      profile = mod.rheumatoidArthritisProfile;
      break;
    }
    case 'lupus': {
      const mod = await import('./lupus');
      profile = mod.lupusProfile;
      break;
    }
    case 'psoriasis': {
      const mod = await import('./psoriasis');
      profile = mod.psoriasisProfile;
      break;
    }
    case 'ankylosing_spondylitis': {
      const mod = await import('./ankylosing-spondylitis');
      profile = mod.ankylosingSpondylitisProfile;
      break;
    }
    case 'multiple_sclerosis': {
      const mod = await import('./multiple-sclerosis');
      profile = mod.multipleSclerosisProfile;
      break;
    }
    case 'hashimotos': {
      const mod = await import('./hashimotos');
      profile = mod.hashimotosProfile;
      break;
    }
    case 'celiac': {
      const mod = await import('./celiac');
      profile = mod.celiacProfile;
      break;
    }
    case 'type1_diabetes': {
      const mod = await import('./type1-diabetes');
      profile = mod.type1DiabetesProfile;
      break;
    }
    default:
      throw new Error(`Unknown condition: ${id}`);
  }

  profileCache.set(id, profile);
  return profile;
}

/**
 * Synchronous getter — returns cached profile or Crohn's as fallback.
 * Use getConditionProfile() for guaranteed correct result.
 */
export function getConditionProfileSync(id: ConditionId): ConditionProfile {
  return profileCache.get(id) ?? crohnsProfile;
}

/**
 * Preload a condition profile into the cache.
 */
export async function preloadConditionProfile(id: ConditionId): Promise<void> {
  await getConditionProfile(id);
}

/**
 * Get condition options grouped by category.
 */
export function getConditionsByCategory(): Record<ConditionCategory, ConditionOption[]> {
  const grouped: Record<ConditionCategory, ConditionOption[]> = {
    gastrointestinal: [],
    rheumatic: [],
    neurological: [],
    endocrine: [],
    dermatological: [],
  };

  for (const option of CONDITION_OPTIONS) {
    grouped[option.category].push(option);
  }

  return grouped;
}

export type { ConditionId, ConditionProfile, ConditionCategory } from './types';
