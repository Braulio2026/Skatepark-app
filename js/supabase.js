import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://qmjcpbwjoodlqdbnweia.supabase.co'
const supabaseKey = 'sb_publishable_bQ5DJCS2ECCRYpvsFw2j_w_n_zV_ISp'

export const supabase = createClient(supabaseUrl, supabaseKey)