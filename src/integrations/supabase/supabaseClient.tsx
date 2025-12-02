import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Use "import.meta.env" for Vite or "process.env" for Create React App
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)