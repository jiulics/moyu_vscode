import { z } from 'zod';

const readerSettingsSchema = z.object({
  fontSize: z.number().min(12).max(32),
  lineHeight: z.number().min(1.2).max(2.4),
  theme: z.enum(['dark', 'light', 'green'])
});

const chapterSchema = z.object({
  id: z.string(),
  index: z.number().int().nonnegative(),
  title: z.string(),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().nonnegative(),
  content: z.string()
});

const bookmarkSchema = z.object({
  id: z.string(),
  chapterIndex: z.number().int().nonnegative(),
  label: z.string(),
  createdAt: z.string()
});

const progressSchema = z.object({
  novelUri: z.string(),
  chapterIndex: z.number().int().nonnegative(),
  scrollPercent: z.number().min(0).max(100),
  updatedAt: z.string(),
  bookmarks: z.array(bookmarkSchema)
});

const trackSchema = z.object({
  uri: z.string(),
  title: z.string(),
  fileName: z.string(),
  addedAt: z.string(),
  durationSeconds: z.number().optional(),
  order: z.number().int().nonnegative()
});

export const incomingMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reader.saveProgress'),
    novelUri: z.string(),
    chapterIndex: z.number().int().nonnegative(),
    scrollPercent: z.number().min(0).max(100)
  }),
  z.object({
    type: z.literal('reader.addBookmark'),
    novelUri: z.string(),
    chapterIndex: z.number().int().nonnegative(),
    label: z.string().min(1)
  }),
  z.object({
    type: z.literal('music.status'),
    status: z.enum(['playing', 'paused']),
    title: z.string().optional()
  })
]);

export const outgoingMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reader.load'),
    novelUri: z.string(),
    title: z.string(),
    chapters: z.array(chapterSchema),
    progress: progressSchema.optional(),
    settings: readerSettingsSchema
  }),
  z.object({
    type: z.literal('music.load'),
    tracks: z.array(trackSchema),
    settings: z.object({
      volume: z.number().min(0).max(1)
    })
  })
]);

export type IncomingMessage = z.infer<typeof incomingMessageSchema>;
export type OutgoingMessage = z.infer<typeof outgoingMessageSchema>;

export function parseIncomingMessage(message: unknown): IncomingMessage {
  return incomingMessageSchema.parse(message);
}

export function parseOutgoingMessage(message: unknown): OutgoingMessage {
  return outgoingMessageSchema.parse(message);
}
