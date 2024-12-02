import {
  Dispatch,
  HTMLAttributes,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import { Content, Editor } from '@tiptap/react'
import { MinimalTiptapEditor } from './minimal-tiptap'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { EditorProps } from '@tiptap/pm/view'
import { cn } from '@/lib/utils'

interface MdEditorProps extends HTMLAttributes<HTMLDivElement> {
  editorContentClassName?: string
  value?: Content
  setValue: Dispatch<SetStateAction<Content>>
  placeholder?: string
  isReadOnly?: boolean
}

export const MdEditor = ({
  editorContentClassName,
  value,
  setValue,
  className,
  placeholder = 'Type something here...',
  isReadOnly = false,
  autoFocus
}: MdEditorProps) => {
  return (
    <TooltipProvider>
      <MinimalTiptapEditor
        value={value}
        onChange={setValue}
        throttleDelay={0}
        className={cn(className)}
        editorContentClassName={editorContentClassName}
        output="json"
        placeholder={placeholder}
        autofocus={autoFocus}
        immediatelyRender={true}
        editable={!isReadOnly}
        injectCSS={true}
        editorClassName={'focus:outline-none'}
        isReadOnly={isReadOnly}
      />
    </TooltipProvider>
  )
}
