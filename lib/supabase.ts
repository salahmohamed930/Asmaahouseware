
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ilyxhubihdqjbvkkpalx.supabase.co';
const supabaseAnonKey = 'sb_publishable_I8SaqNGWtFy-wDD2XAkOAA_X7f42g_w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
