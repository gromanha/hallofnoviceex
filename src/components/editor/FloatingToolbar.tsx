import { useState, useEffect, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  Link as LinkIcon,
} from 'lucide-react'

interface FloatingToolbarProps {
  editor: Editor
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const updatePosition = useCallback(() => {
    const { from, to } = editor.state.selection
    if (from === to) {
      setIsVisible(false)
      return
    }

    const { view } = editor
    const start = view.coordsAtPos(from)
    const end = view.coordsAtPos(to)

    const editorEl = view.dom.closest('.tiptap-editor')
    if (!editorEl) return

    const editorRect = editorEl.getBoundingClientRect()

    setPosition({
      top: start.top - editorRect.top - 44,
      left: (start.left + end.left) / 2 - editorRect.left,
    })
    setIsVisible(true)
  }, [editor])

  useEffect(() => {
    const handleSelectionUpdate = () => {
      updatePosition()
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, updatePosition])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.floating-toolbar')) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isVisible || !position) return null

  const buttons = [
    {
      icon: Bold,
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
      title: 'Negrito',
    },
    {
      icon: Italic,
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
      title: 'Itálico',
    },
    {
      icon: UnderlineIcon,
      active: editor.isActive('underline'),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      title: 'Sublinhado',
    },
    {
      icon: Strikethrough,
      active: editor.isActive('strike'),
      onClick: () => editor.chain().focus().toggleStrike().run(),
      title: 'Tachado',
    },
    {
      icon: Code,
      active: editor.isActive('code'),
      onClick: () => editor.chain().focus().toggleCode().run(),
      title: 'Código',
    },
    {
      icon: Highlighter,
      active: editor.isActive('highlight'),
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      title: 'Destaque',
    },
    {
      icon: LinkIcon,
      active: editor.isActive('link'),
      onClick: () => {
        const url = window.prompt('URL do link:')
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      },
      title: 'Link',
    },
  ]

  return (
    <div
      className="floating-toolbar absolute z-50 flex items-center gap-0.5 px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {buttons.map(({ icon: Icon, active, onClick, title }) => (
        <button
          key={title}
          type="button"
          onClick={onClick}
          title={title}
          className={`p-1.5 rounded-lg transition-all ${
            active
              ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
