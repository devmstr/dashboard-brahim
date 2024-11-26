import * as React from 'react'
import './styles/index.css'

import { EditorContent } from '@tiptap/react'
import type { Content, Editor } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SectionOne } from './components/section/one'
import { SectionTwo } from './components/section/two'
import { SectionThree } from './components/section/three'
import { SectionFour } from './components/section/four'
import { SectionFive } from './components/section/five'
import { LinkBubbleMenu } from './components/bubble-menu/link-bubble-menu'
import { ImageBubbleMenu } from './components/bubble-menu/image-bubble-menu'
import type { UseMinimalTiptapEditorProps } from './hooks/use-minimal-tiptap'
import { useMinimalTiptapEditor } from './hooks/use-minimal-tiptap'
import { ScrollArea } from '@radix-ui/react-scroll-area'

export interface MinimalTiptapProps
  extends Omit<UseMinimalTiptapEditorProps, 'onUpdate'> {
  value?: Content
  onChange?: (value: Content) => void
  className?: string
  editorContentClassName?: string
  isReadOnly: boolean
}

const Toolbar = ({
  editor,
  isReadOnly
}: {
  editor: Editor
  isReadOnly: boolean
}) => (
  <div
    className={cn(
      'shrink-0 overflow-x-auto border-b border-border p-2',
      isReadOnly && 'opacity-15 cursor-default pointer-events-none'
    )}
  >
    <div className="flex w-max items-center gap-px">
      <SectionOne editor={editor} activeLevels={[1, 2, 3, 4, 5, 6]} />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionTwo
        editor={editor}
        activeActions={[
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'code',
          'clearFormatting'
        ]}
        mainActionCount={3}
      />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionThree editor={editor} />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionFour
        editor={editor}
        activeActions={['orderedList', 'bulletList']}
        mainActionCount={0}
      />

      <Separator orientation="vertical" className="mx-2 h-7" />

      <SectionFive
        editor={editor}
        activeActions={['codeBlock', 'blockquote', 'horizontalRule']}
        mainActionCount={0}
      />
    </div>
  </div>
)

export const MinimalTiptapEditor = React.forwardRef<
  HTMLDivElement,
  MinimalTiptapProps
>(
  (
    {
      value,
      onChange,
      className,
      editorContentClassName,
      isReadOnly,
      ...props
    },
    ref
  ) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      ...props
    })

    if (!editor) {
      return null
    }

    // Sync the `isReadOnly` state with the editor's editable setting
    React.useEffect(() => {
      editor.setOptions({
        editable: !isReadOnly
      })
    }, [isReadOnly, editor])

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-auto min-h-72 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary',
          className
        )}
      >
        <Toolbar editor={editor} isReadOnly={isReadOnly} />

        <EditorContent
          editor={editor}
          className={cn('minimal-tiptap-editor', editorContentClassName)}
        />
        <LinkBubbleMenu editor={editor} />
        {/* <ImageBubbleMenu editor={editor} /> */}
      </div>
    )
  }
)

MinimalTiptapEditor.displayName = 'MinimalTiptapEditor'

export default MinimalTiptapEditor
