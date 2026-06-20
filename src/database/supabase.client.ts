import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// For local auth mock before real supabase backend is ready
const MOCK_SUPABASE = !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY;

export const supabase = MOCK_SUPABASE 
  ? ({} as any) 
  : createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);

export const supabaseAdmin = MOCK_SUPABASE 
  ? ({} as any)
  : createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY!);
