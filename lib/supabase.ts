
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gadqcwitxsriofmnsozq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZHFjd2l0eHNyaW9mbW5zb3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTA2MzYsImV4cCI6MjA4Mjg2NjYzNn0.J48N-SywvmKNNyBTWz0RpABb8ROve9sIXAYfwzZJtDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
