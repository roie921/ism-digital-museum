import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL || 'http://localhost', import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing')
export async function uploadImage(file, uid) {
  const path = `${uid}/${Date.now()}-${file.name.replace(/[^\w.]/g, '_')}`
  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) throw error
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
}
