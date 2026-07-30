import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  CodeSquare,
  Minus,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Table as TableIcon,
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor
  onImageClick?: () => void
  onLinkClick?: () => void
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        active
          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
          : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-[var(--color-outline-variant)] mx-1" />
}

export function EditorToolbar({ editor, onImageClick, onLinkClick }: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-alt)]">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Sublinhado (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Tachado (Ctrl+Shift+S)"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Código inline (Ctrl+E)"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Título H1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Título H2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Título H3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive('heading', { level: 4 })}
        title="Título H4"
      >
        <Heading4 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Lista com marcadores (Ctrl+Shift+8)"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Lista numerada (Ctrl+Shift+7)"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="Lista de tarefas"
      >
        <ListChecks className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Citação (Ctrl+Shift+B)"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Bloco de código"
      >
        <CodeSquare className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Linha horizontal"
      >
        <Minus className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Table */}
      <ToolbarButton
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        title="Inserir tabela"
      >
        <TableIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Media */}
      <ToolbarButton onClick={() => onImageClick?.()} title="Inserir imagem">
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onLinkClick?.()}
        active={editor.isActive('link')}
        title="Inserir link (Ctrl+K)"
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Alinhar à esquerda"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Centralizar"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Alinhar à direita"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justificar"
      >
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}
