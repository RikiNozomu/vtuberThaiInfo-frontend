"use client";

import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { useToggle } from "@mantine/hooks";
import { Editor as CodeEditor } from "@monaco-editor/react";
import esthetic from "esthetic";

type props = {
  value?: string;
  onChange?: (value: string | null | undefined) => void;
};

export function Editor({ value = "", onChange = (value) => {} }: props) {

  esthetic.rules({
    language: "html",
    indentSize: 3,
    markup: {
      attributeSort: true,
      forceAttribute: true,
    },
    script: {
      noSemicolon: true,
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <RichTextEditor
      editor={editor}
      classNames={{
        content: "prose max-w-full shadow-inner bg-slate-100 min-h-[300px]",
        control: "disabled:opacity-50 disabled:bg-black/30",
      }}
    >
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold  />
          <RichTextEditor.Italic  />
          <RichTextEditor.Underline  />
          <RichTextEditor.Strikethrough  />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList  />
          <RichTextEditor.OrderedList  />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link  />
          <RichTextEditor.Unlink  />
        </RichTextEditor.ControlsGroup>

      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
