import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export const listMatchesQuerySchema = z.object({
  limit: z
    .coerce.number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

export const MATCH_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: z
      .string()
      .refine((s) => isoDateRegex.test(s), {
        message: 'startTime must be a valid ISO 8601 string (e.g. 2023-01-01T12:00:00Z)',
      }),
    endTime: z
      .string()
      .refine((s) => isoDateRegex.test(s), {
        message: 'endTime must be a valid ISO 8601 string (e.g. 2023-01-01T13:00:00Z)',
      }),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data;
    const start = Date.parse(startTime);
    const end = Date.parse(endTime);

    if (isNaN(start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startTime is not a valid date',
        path: ['startTime'],
      });
      return;
    }

    if (isNaN(end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime is not a valid date',
        path: ['endTime'],
      });
      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be after startTime',
        path: ['endTime'],
      });
    }
  });

// export const updateMatchSchema = createMatchSchema.partial();