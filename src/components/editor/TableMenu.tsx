import { useState, useEffect, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import {
  Plus,
  Minus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

interface TableMenuProps {
  editor: Editor
}

export function TableMenu({ editor }: TableMenuProps) {
  const [isVisible, setIsVisible] = useState(false)

  const checkTableActive = useCallback(() => {
    setIsVisible(editor.isActive('table'))
  }, [editor])

  useEffect(() => {
    editor.on('selectionUpdate', checkTableActive)
    editor.on('transaction', checkTableActive)
    return () => {
      editor.off('selectionUpdate', checkTableActive)
      editor.off('transaction', checkTableActive)
    }
  }, [editor, checkTableActive])

  if (!isVisible) return null

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-alt)]">
      <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mr-2">
        Tabela
      </span>

      <MenuButton
        onClick={() => editor.chain().focus().addRowBefore().run()}
        title="Adicionar linha acima"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().addRowAfter().run()}
        title="Adicionar linha abaixo"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteRow().run()}
        title="Remover linha"
      >
        <Minus className="w-3.5 h-3.5" />
      </MenuButton>

      <div className="w-px h-5 bg-[var(--color-outline-variant)] mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        title="Adicionar coluna à esquerda"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        title="Adicionar coluna à direita"
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteColumn().run()}
        title="Remover coluna"
      >
        <Minus className="w-3.5 h-3.5 rotate-90" />
      </MenuButton>

      <div className="w-px h-5 bg-[var(--color-outline-variant)] mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Remover tabela"
        danger
      >
        <Trash2 className="w-3.5 h-3.5" />
      </MenuButton>
    </div>
  )
}

function MenuButton({
  onClick,
  title,
  children,
  danger = false,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        danger
          ? 'text-[var(--color-crimson)] hover:bg-[var(--color-crimson)]/10'
          : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
      }`}
    >
      {children}
    </button>
  )
}
