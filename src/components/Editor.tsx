import type { CodeBlockEditorDescriptor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import React from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  useCodeBlockEditorContext,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  ListsToggle,
  // BlockTypeSelect,
  // CreateLink,
  Separator
} from '@mdxeditor/editor'

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: () => true,
  priority: 0,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext()
    return (
      <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
        <textarea rows={3} cols={20} defaultValue={props.code} onChange={(e) => cb.setCode(e.target.value)} />
      </div>
    )
  }
}

const Editor = ({ markdown, updateDescription, contentEditableClassName }: { 
  markdown: string, 
  updateDescription: (updateDescription: string) => void,
  contentEditableClassName?: string 
}) => {
  return <MDXEditor
    onChange={(markdown) => {
      updateDescription(markdown);
    }}
    markdown={markdown}
    contentEditableClassName={contentEditableClassName}
    plugins={[
      headingsPlugin(),
      listsPlugin(),
      linkPlugin(),
      quotePlugin(),
      markdownShortcutPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            {' '}
            {/* <BlockTypeSelect /> */}
            <UndoRedo />
            <Separator />
            <BoldItalicUnderlineToggles />
            {/* <CreateLink /> */}
            {/* <ListsToggle /> */}
          </>
        )
      })
    ]}
  />
}

export default Editor