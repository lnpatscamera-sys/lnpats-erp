import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const summarizeDailyReports = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ sourceIds: z.array(z.string().uuid()).min(1).max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { error: 'Lovable AI is not configured.', text: '', reportCount: 0 };
    const { runCompilationSummary } = await import('./compilation.server');
    return runCompilationSummary(context.supabase, context.userId, data.sourceIds, key, getRequest());
  });
