import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fogvfrnhgyncrpkkxrdi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZ3Zmcm5oZ3luY3Jwa2t4cmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzI1MDgsImV4cCI6MjA3ODA0ODUwOH0.mEkzR2VErVaZHNBg0w9r-T1-MKAGVpQA8braGaLgr6A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
