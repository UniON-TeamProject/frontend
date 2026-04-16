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
      $hasError
        ? theme.colors?.danger || "red"
        : theme.colors?.darkGrey || "#ccc"};
  border-radius: 8px;
  padding: 10px 12px;
  min-height: 70px;
  background: ${({ theme }) => theme.colors.white};
  cursor: text;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors?.secondary || "#00b894"};
  }

  .ProseMirror {
    min-height: 50px;
    outline: none;
    font-size: 0.9rem;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors?.text || "#333"};
  }

  .is-empty::before {
    color: #a0a0a0;
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
    if (editor && value !== editor.getHTML()) {
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
