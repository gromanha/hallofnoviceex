import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Typography from '@tiptap/extension-typography'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export const defaultExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: { class: 'wiki-image', loading: 'lazy' },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { class: 'text-[var(--color-primary)] underline' },
  }),
  Placeholder.configure({
    placeholder: 'Comece a escrever seu artigo...',
  }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  CodeBlockLowlight.configure({ lowlight }),
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Underline,
  Strike,
  Typography,
  Dropcursor.configure({ color: 'var(--color-primary)', width: 2 }),
  Gapcursor,
]
