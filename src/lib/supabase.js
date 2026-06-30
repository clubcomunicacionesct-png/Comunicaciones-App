import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pdgbpjdhxfbpyxisbdmx.supabase.co'
const SUPABASE_KEY = 'sb_publishable_5xL_AGGbjQEcZ36fK_fGQQ_TKrOo8ur'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
