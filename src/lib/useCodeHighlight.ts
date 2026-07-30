import { useEffect } from 'react';
import { common, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';

const lowlight = createLowlight(common);

export function useCodeHighlight() {
  useEffect(() => {
    const prose = document.querySelector('.prose');
    if (!prose) return;

    const codeBlocks = prose.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre || pre.getAttribute('data-highlighted') === 'true') return;

      const text = block.textContent || '';
      const langMatch = block.className.match(/language-(\w+)/);
      const lang = langMatch?.[1] || 'plaintext';

      try {
        const result = lowlight.highlight(lang, text);
        block.innerHTML = toHtml(result);
        block.className = `hljs language-${lang}`;
        pre.setAttribute('data-highlighted', 'true');
        pre.className = 'hljs rounded-xl overflow-x-auto p-4 bg-[var(--color-surface-alt)]';
      } catch {
        // language not supported, keep as-is
      }
    });
  }, []);
}
