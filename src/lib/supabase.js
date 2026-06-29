import { createClient } from '@supabase/supabase-js'

// Publishable (client-side) credentials. These are designed to be public: the
// database enforces read-only access through row-level security, so shipping
// them in the bundle is safe. Override locally via a `.env` file if needed.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mniktvbvgnjedidfjrfj.supabase.co'
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_neMFaXR5OcARTPTfr5e4KA_sRqAz6NK'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

// Loads everything the dashboard needs in parallel: the core 14 listed peers,
// the core 6 precedent transactions, and the single assumptions row.
export async function loadValuationData() {
  const [companies, transactions, assumptions] = await Promise.all([
    supabase
      .from('comparable_companies')
      .select('*')
      .eq('is_main', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('precedent_transactions')
      .select('*')
      .eq('is_main', true)
      .order('sort_order', { ascending: true }),
    supabase.from('valuation_assumptions').select('*').eq('id', 1).single(),
  ])

  const firstError =
    companies.error || transactions.error || assumptions.error
  if (firstError) throw firstError

  return {
    companies: companies.data,
    transactions: transactions.data,
    assumptions: assumptions.data,
  }
}
