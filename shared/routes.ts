import { z } from 'zod';
import { insertCheckinSchema, updateCheckinSchema, checkins } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  checkins: {
    create: {
      method: 'POST' as const,
      path: '/api/checkins' as const,
      input: insertCheckinSchema,
      responses: {
        201: z.custom<typeof checkins.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    complete: {
      method: 'PATCH' as const,
      path: '/api/checkins/:id/complete' as const,
      input: updateCheckinSchema,
      responses: {
        200: z.custom<typeof checkins.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/checkins' as const,
      responses: {
        200: z.array(z.custom<typeof checkins.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    getLast: {
      method: 'GET' as const,
      path: '/api/checkins/last' as const,
      responses: {
        200: z.custom<typeof checkins.$inferSelect>().optional(),
        401: errorSchemas.unauthorized,
      }
    }
  },
};

// ============================================
// HELPERS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
