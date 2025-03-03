
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quvehhofhznnexgzqugv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dmVoaG9maHpubmV4Z3pxdWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3Mjk0ODUsImV4cCI6MjA1NjMwNTQ4NX0.Fx3Xf6iK9JgPrxsxSSAwNYOW_pbjdw64fs7uRxQnyp4';

// Create client without any additional auth providers
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
