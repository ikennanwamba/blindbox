import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getTotalRecommendations = async () => {
  console.log('Fetching total recommendations...');
  const { count, error } = await supabase
    .from('recommendations')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error getting count:', error)
    return 0
  }

  console.log('Total recommendations found:', count);
  return count || 0
}

export const incrementRecommendationCount = async (title) => {
  const { data, error } = await supabase
    .from('recommendations')
    .select('times_recommended')
    .eq('title', title)
    .single()

  if (error) {
    console.error('Error getting recommendation:', error)
    return
  }

  const { error: updateError } = await supabase
    .from('recommendations')
    .update({ times_recommended: (data.times_recommended || 0) + 1 })
    .eq('title', title)

  if (updateError) {
    console.error('Error updating count:', updateError)
  }
} 