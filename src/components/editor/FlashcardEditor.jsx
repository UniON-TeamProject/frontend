import React, { useEffect } from "react";
import styled from "styled-components";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Placeholder } from "@tiptap/extensions";
import Commands from "../../helpers/textEditor/commands.js";
import createSuggestion from "../../helpers/textEditor/suggestion.js";
import { slashItems } from "../../helpers/textEditor/slashItems.jsx";

const EditorWrapper = styled.div`
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.darkGrey};
  border-radius: 8px;
  padding: 10px 12px;
  height: 100px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.white};
  cursor: text;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  .ProseMirror {
    min-height: 100%;
    outline: none;
    font-size: 16px;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.text};
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .ProseMirror p {
    margin: 0.35em 0;
  }

  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0.5em 0;
  }

  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin: 0.5em 0;
  }

  .ProseMirror li {
    display: list-item;
    margin: 0.25em 0;
  }

  .ProseMirror li p {
    margin: 0;
  }

  .is-empty::before {
    color: ${({ theme }) => theme.colors.textMuted};
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

const FlashcardEditor = ({ value, onChange, placeholder, hasError }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Commands.configure({
        suggestion: createSuggestion(slashItems),
      }),
      Placeholder.configure({
        placeholder: placeholder || "Wpisz tekst lub /",
      }),
    ],
    content: value,
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      onChange(editor.getHTML());
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, onChange]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <EditorWrapper
      $hasError={hasError}
      onClick={() => editor?.commands.focus()}
    >
      <EditorContent editor={editor} />
    </EditorWrapper>
  );
};

export default FlashcardEditor;
