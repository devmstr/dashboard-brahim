/*
 * Under line the selected text
 */
import { Underline as TiptapUnderline } from '@tiptap/extension-underline'

export const Underline = TiptapUnderline.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-U': () => this.editor.commands.toggleMark(this.name)
    }
  }
})

export default Underline
