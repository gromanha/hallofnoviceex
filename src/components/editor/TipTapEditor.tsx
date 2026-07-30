import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useState, useCallback } from 'react'
import { defaultExtensions } from './extensions'
import { EditorToolbar } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'
import { ImagePickerDialog } from './ImagePickerDialog'
import { apiPost } from '../../lib/api'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  editable?: boolean
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Comece a escrever seu artigo...',
  editable = true,
}: TipTapEditorProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const uploadImageFile = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const result = await apiPost<{ url: string }>('/api/upload', {
        file: base64,
        filename: file.name,
        contentType: file.type,
      })
      return result.url
    } catch {
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const editor = useEditor({
    extensions: defaultExtensions,
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue

            uploadImageFile(file).then(url => {
              if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run()
              }
            })
            return true
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files) return false

        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImageFile(file).then(url => {
              if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run()
              }
            })
            return true
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  const handleImageInsert = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="tiptap-editor rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] overflow-hidden relative">
      {editable && (
        <EditorToolbar
          editor={editor}
          onImageClick={() => setImagePickerOpen(true)}
        />
      )}
      <EditorContent editor={editor} />
      {editable && <FloatingToolbar editor={editor} />}
      {uploading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] animate-pulse" />
      )}
      <ImagePickerDialog
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  )
}
