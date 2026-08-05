import { z } from 'zod';

export const ANALYTICS_EVENT_TYPES = ['page_view', 'section_view', 'link_click'] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const trackEventSchema = z.object({
  eventType: z.enum(ANALYTICS_EVENT_TYPES),
  path: z.string().trim().min(1).max(300),
  targetId: z.string().trim().max(200).optional().or(z.literal('')),
  targetLabel: z.string().trim().max(200).optional().or(z.literal('')),
  targetHref: z.string().trim().max(500).optional().or(z.literal('')),
  visitorId: z.string().uuid(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
