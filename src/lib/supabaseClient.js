import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvylxcedgjylpbxkrhna.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eWx4Y2VkZ2p5bHBieGtyaG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzE1NTUsImV4cCI6MjA3NTYwNzU1NX0.3ODMkO_VAf_G47lT6UAhlMkZOmDYFFAjzLeDx4tvQD0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

