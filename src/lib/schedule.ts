/**
 * Aafiya's check-in schedule
 *
 * Defines WHAT to collect and WHEN, checks against the database
 * for what's already been logged today, and generates context
 * for Aafiya so she knows what to gently prompt for.
 *
 * Future: This drives push notifications + email reminders via cron jobs.
 * For now: Aafiya uses this when the user opens the app.
 */

import { getSymptomsByDateRange } from '@/actions/symptoms';
import { getFoodByDateRange } from '@/actions/food';
import { getSleepByDateRange } from '@/actions/sleep';
import { getMoodByDateRange } from '@/actions/mood';
import { getMedicationsByDateRange } from '@/actions/medications';

export interface CheckinItem {
  id: string;
  label: string;               // Human-friendly name
  windowStart: number;          // Hour (0-23) when this check-in opens
  windowEnd: number;            // Hour (0-23) when it closes (soft — can still log after)
  priority: 'high' | 'medium' | 'low';
  aafiyaPrompt: string;        // What Aafiya says to gently prompt
  aafiyaReminder: string;      // Shorter reminder if user said "later"
  category: 'symptom' | 'food' | 'sleep' | 'mood' | 'meds' | 'cycle';
}

/**
 * The daily schedule — ordered by time of day.
 *
 * Designed for her life: she sleeps late (target 10pm-7am),
 * so morning starts around 7-8am for the target, but we're flexible.
 */
export const DAILY_SCHEDULE: CheckinItem[] = [
  // ─── Morning (wake up) ───
  {
    id: 'morning_sleep',
    label: 'Sleep log',
    windowStart: 6,
    windowEnd: 12,
    priority: 'high',
    category: 'sleep',
    aafiyaPrompt: "Good morning! How did you sleep? When did you fall asleep and wake up?",
    aafiyaReminder: "Hey, you haven't logged your sleep yet — just tell me when you slept and woke up!",
  },
  {
    id: 'morning_meds',
    label: 'Morning meds',
    windowStart: 6,
    windowEnd: 11,
    priority: 'high',
    category: 'meds',
    aafiyaPrompt: "Have you taken your morning meds?",
    aafiyaReminder: "Quick reminder — did you take your meds today?",
  },
  {
    id: 'morning_mood',
    label: 'Morning mood',
    windowStart: 6,
    windowEnd: 12,
    priority: 'medium',
    category: 'mood',
    aafiyaPrompt: "How are you feeling this morning?",
    aafiyaReminder: "Just checking in — how's your mood today?",
  },

  // ─── Breakfast ───
  {
    id: 'breakfast',
    label: 'Breakfast',
    windowStart: 7,
    windowEnd: 11,
    priority: 'high',
    category: 'food',
    aafiyaPrompt: "What did you have for breakfast?",
    aafiyaReminder: "Don't forget to log your breakfast — even if it was just chai!",
  },

  // ─── Lunch ───
  {
    id: 'lunch',
    label: 'Lunch',
    windowStart: 12,
    windowEnd: 15,
    priority: 'high',
    category: 'food',
    aafiyaPrompt: "What did you have for lunch?",
    aafiyaReminder: "Hey, have you had lunch? Let me know what you ate!",
  },

  // ─── Afternoon check-in ───
  {
    id: 'afternoon_checkin',
    label: 'Afternoon check-in',
    windowStart: 14,
    windowEnd: 18,
    priority: 'medium',
    category: 'symptom',
    aafiyaPrompt: "How's your day going? How's your tummy feeling?",
    aafiyaReminder: "Just a gentle check — how are you feeling this afternoon?",
  },

  // ─── Snack ───
  {
    id: 'snack',
    label: 'Snack',
    windowStart: 15,
    windowEnd: 19,
    priority: 'low',
    category: 'food',
    aafiyaPrompt: "Had any snacks today?",
    aafiyaReminder: "Any snacks to log?",
  },

  // ─── Dinner ───
  {
    id: 'dinner',
    label: 'Dinner',
    windowStart: 19,
    windowEnd: 23,
    priority: 'high',
    category: 'food',
    aafiyaPrompt: "What did you have for dinner?",
    aafiyaReminder: "Don't forget to log dinner!",
  },

  // ─── Evening ───
  {
    id: 'evening_meds',
    label: 'Evening meds',
    windowStart: 19,
    windowEnd: 23,
    priority: 'high',
    category: 'meds',
    aafiyaPrompt: "Have you taken your evening meds?",
    aafiyaReminder: "Reminder — evening meds?",
  },
  {
    id: 'daily_checkin',
    label: 'Daily check-in',
    windowStart: 19,
    windowEnd: 23,
    priority: 'high',
    category: 'symptom',
    aafiyaPrompt: "Time for your daily check-in! How are you feeling overall today?",
    aafiyaReminder: "You haven't done your daily check-in yet — just tell me how your day was.",
  },
];

export interface PendingCheckin {
  item: CheckinItem;
  status: 'due' | 'overdue' | 'upcoming';
  isInWindow: boolean;
}

/**
 * Check what's been logged today and return what's still pending.
 */
export async function getPendingCheckins(): Promise<PendingCheckin[]> {
  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toISOString().split('T')[0];

  // Fetch today's logs in parallel
  const [symptoms, food, sleep, mood, meds] = await Promise.all([
    getSymptomsByDateRange(today, today),
    getFoodByDateRange(today, today),
    getSleepByDateRange(today, today),
    getMoodByDateRange(today, today),
    getMedicationsByDateRange(today, today),
  ]);

  // Track what's already logged
  const logged = {
    sleep: sleep.length > 0,
    morning_meds: meds.some(m => {
      const hour = parseInt(m.time?.split(':')[0] || '0');
      return hour < 14 && m.taken;
    }),
    evening_meds: meds.some(m => {
      const hour = parseInt(m.time?.split(':')[0] || '0');
      return hour >= 14 && m.taken;
    }),
    mood: mood.length > 0,
    breakfast: food.some(f => f.mealType === 'breakfast'),
    lunch: food.some(f => f.mealType === 'lunch'),
    dinner: food.some(f => f.mealType === 'dinner'),
    snack: food.some(f => f.mealType === 'snack'),
    daily_checkin: symptoms.length > 0,
    afternoon_checkin: symptoms.length > 0, // same as daily for now
  };

  const pending: PendingCheckin[] = [];

  for (const item of DAILY_SCHEDULE) {
    // Check if already logged
    const itemKey = item.id as keyof typeof logged;
    if (logged[itemKey]) continue;

    const isInWindow = currentHour >= item.windowStart && currentHour <= item.windowEnd;
    const isOverdue = currentHour > item.windowEnd;
    const isUpcoming = currentHour < item.windowStart;

    // Skip items that are way past their window (more than 3 hours overdue)
    if (isOverdue && (currentHour - item.windowEnd) > 3) continue;

    // Skip upcoming items that are more than 2 hours away
    if (isUpcoming && (item.windowStart - currentHour) > 2) continue;

    let status: 'due' | 'overdue' | 'upcoming';
    if (isInWindow) status = 'due';
    else if (isOverdue) status = 'overdue';
    else status = 'upcoming';

    pending.push({ item, status, isInWindow });
  }

  // Sort: overdue first, then due (by priority), then upcoming
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const statusOrder = { overdue: 0, due: 1, upcoming: 2 };

  pending.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
  });

  return pending;
}

/**
 * Generate context string for Aafiya about what's pending.
 * This gets injected into the agent's context so she knows what to ask.
 */
export function generateScheduleContext(pending: PendingCheckin[]): string {
  if (pending.length === 0) {
    return 'All check-ins are done for now! The user has been great about logging today.';
  }

  const now = new Date();
  const currentHour = now.getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  let ctx = `It's ${timeOfDay} (${currentHour}:${String(now.getMinutes()).padStart(2, '0')}). `;
  ctx += `The following check-ins are pending today:\n`;

  for (const p of pending) {
    const statusLabel = p.status === 'overdue' ? ' (OVERDUE)' : p.status === 'upcoming' ? ' (upcoming)' : '';
    ctx += `- ${p.item.label}${statusLabel} [${p.item.priority} priority]\n`;
  }

  ctx += `\nIMPORTANT RULES for prompting:
- Do NOT dump all pending items at once. Pick the MOST important/overdue one and gently ask about it.
- If the user just opened the app and said hello, weave the most urgent pending item into your greeting naturally.
- If the user is talking about something else, DO NOT interrupt with a check-in. Wait for a natural pause.
- If the user says "remind me later" or "I'm busy", acknowledge warmly and don't push.
- Meals are the most time-sensitive — breakfast before lunch window, lunch before dinner, etc.
- The daily check-in (symptoms) is best done in the evening but can be done anytime.
- NEVER say "according to your schedule" or make it feel robotic. Be natural and caring.`;

  return ctx;
}

/**
 * Get the single most important pending item to prompt about.
 * Used for the welcome message when user opens the app.
 */
export function getMostUrgentCheckin(pending: PendingCheckin[]): PendingCheckin | null {
  if (pending.length === 0) return null;

  // Overdue high-priority items first
  const overdueHigh = pending.find(p => p.status === 'overdue' && p.item.priority === 'high');
  if (overdueHigh) return overdueHigh;

  // Due high-priority items
  const dueHigh = pending.find(p => p.status === 'due' && p.item.priority === 'high');
  if (dueHigh) return dueHigh;

  // Any due item
  const due = pending.find(p => p.status === 'due');
  if (due) return due;

  // First pending item
  return pending[0];
}
