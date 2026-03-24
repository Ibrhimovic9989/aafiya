export const CONSENT_PURPOSES = [
  'health_data_processing',
  'ai_analysis',
  'data_storage',
  'analytics',
] as const;

export type ConsentPurpose = typeof CONSENT_PURPOSES[number];

export const CONSENT_DESCRIPTIONS: Record<ConsentPurpose, { title: string; description: string; required: boolean }> = {
  health_data_processing: {
    title: 'Health Data Processing',
    description: 'Allow Aafiya to process your health data (symptoms, medications, sleep, mood) to track your condition and generate insights. This is required for the app to function.',
    required: true,
  },
  data_storage: {
    title: 'Secure Data Storage',
    description: 'Allow Aafiya to securely store your health data in our encrypted database. Your data is encrypted at rest and in transit.',
    required: true,
  },
  ai_analysis: {
    title: 'AI-Powered Analysis',
    description: 'Allow Aafiya to use AI (Azure OpenAI) to analyze your data, predict flare risks, and provide personalized health insights. Your data is sent to AI services for processing.',
    required: false,
  },
  analytics: {
    title: 'Anonymous Analytics',
    description: 'Allow anonymous usage analytics to help improve Aafiya. No personal health data is included — only app usage patterns.',
    required: false,
  },
};
