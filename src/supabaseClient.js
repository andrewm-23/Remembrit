import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otxjswizqegstruhthbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eGpzd2l6cWVnc3RydWh0aGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODAwMzIsImV4cCI6MjA5NDM1NjAzMn0.a7MNAR-C8bY2mcG1PFbvCaEDzuG_ZnUjrIzLxDwQLkE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('supabase client:', supabase);