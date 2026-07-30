import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

export function getSupabaseAdmin() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env')
  }

  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseInstance
}

export async function checkSlugExists(slug) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao verificar slug: ${error.message}`)
  }

  return !!data
}

export async function createPost(postData) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: postData.title,
      subtitle: postData.subtitle,
      content: postData.content,
      category: postData.category || 'guias',
      author_name: postData.author_name || 'Corpo Docente',
      cover_image: postData.cover_image || '',
      tags: postData.tags || [],
      is_pinned: postData.is_pinned || false,
      status: postData.status || 'published',
      slug: postData.slug,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar post: ${error.message}`)
  }

  return data
}

export async function uploadImage(buffer, fileName, contentType) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(`wiki/${fileName}`, buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
