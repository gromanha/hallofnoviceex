import translate from '@vitalets/google-translate-api';

// Split markdown into translatable segments while preserving special blocks
function extractBlocks(text) {
  const blocks = [];
  let idx = 0;
  let result = text;

  // Preserve images: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'image' });
    return key;
  });

  // Preserve fenced code blocks
  result = result.replace(/(```[\s\S]*?```)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'code' });
    return key;
  });

  // Preserve inline code
  result = result.replace(/(`[^`]+`)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'inline_code' });
    return key;
  });

  // Preserve tables (lines starting with |)
  result = result.replace(/^(\|.+\|[ ]*\n)+/gm, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'table' });
    return key;
  });

  return { text: result, blocks };
}

function restoreBlocks(text, blocks) {
  let result = text;
  for (const block of blocks) {
    result = result.replace(block.key, block.value);
  }
  return result;
}

// Split text into chunks under the API limit (4500 chars)
function splitIntoChunks(text, maxLen = 4500) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Translate markdown text from one language to another,
 * preserving markdown structure (images, code, tables, links).
 */
export async function translateMarkdown(text, from = 'en', to = 'pt') {
  if (!text || typeof text !== 'string') return '';

  // Step 1: Extract special blocks
  const { text: sanitized, blocks } = extractBlocks(text);

  // Step 2: Split into chunks
  const chunks = splitIntoChunks(sanitized);

  // Step 3: Translate each chunk
  const translatedChunks = [];
  for (const chunk of chunks) {
    try {
      const res = await translate(chunk, { from, to });
      translatedChunks.push(res.text);
    } catch (err) {
      // If translation fails, keep original text
      console.error('[translate] Chunk translation failed:', err.message);
      translatedChunks.push(chunk);
    }
  }

  // Step 4: Rejoin and restore blocks
  const translated = translatedChunks.join(' ');
  return restoreBlocks(translated, blocks);
}
