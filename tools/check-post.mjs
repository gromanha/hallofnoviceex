import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://apaodyqexsmgdojnktnb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwYW9keXFleHNtZ2Rvam5rdG5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxNDcwNywiZXhwIjoyMDkzNzkwNzA3fQ.pEpSkMY7y-Iv52itdyQDE1SReOkKptgcpvWqI13tK-k'
)

const { data, error } = await supabase
  .from('posts')
  .select('title, slug, content')
  .eq('slug', 'phantom-weapons')
  .single()

if (error) {
  console.log('Error:', error.message)
} else {
  console.log('Title:', data.title)
  console.log('Slug:', data.slug)
  console.log('Content length:', data.content.length)
  
  // Count images
  const imgTags = data.content.match(/<img /g) || []
  console.log('Total <img> tags:', imgTags.length)
  
  // Extract src values
  const srcRegex = /<img[^>]+src="([^"]+)"/g
  let match
  const srcs = []
  while ((match = srcRegex.exec(data.content)) !== null) {
    srcs.push(match[1])
  }
  
  console.log('\nFirst 10 image srcs:')
  srcs.slice(0, 10).forEach((src, i) => {
    console.log(`${i+1}: ${src}`)
  })
  
  // Check for crossorigin
  const crossoriginCount = (data.content.match(/crossorigin/g) || []).length
  console.log('\nImages with crossorigin:', crossoriginCount)
  
  // Check first 2000 chars
  console.log('\nFirst 2000 chars of content:')
  console.log(data.content.substring(0, 2000))
}
