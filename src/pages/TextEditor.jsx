import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { Markdown } from 'tiptap-markdown'
import StarterKit from '@tiptap/starter-kit'
import React, { useState, useEffect } from 'react'
import { getDocumentDetails } from '../api'
import styled from 'styled-components'
import Image from '@tiptap/extension-image'
import { Dropcursor } from '@tiptap/extensions'

const StyledContainer = styled.div`
  width:100%;
  height:100%;
  background-color: ${({ theme }) => theme.colors.white};
  display:flex;
  flex-flow: column;
  align-items:center;
`

const StyledTitleInput = styled.input`
  width:65%;
  padding:20px 0;
  border:none;
  font-size: 3rem;
  font-weight:900;
  color:${({ theme }) => theme.colors.text};
  &:focus{
    border:none;
    outline:none;
  }
`

const RightMenuContainer = styled.div`
  display:flex;
  flex-flow: row-nowrap;
  align-items:center;
`

const TagsContainer = styled.div`
  width:65%;
  display:flex;
  flex-flow:row nowrap;
  align-items:center;
  >p{
    color:${({ theme }) => theme.colors.darkGrey};
    font-size:1rem;
    margin-right:7px;
    font-weight:600;
  }
`

const StyledTag = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  background-color:${({ theme }) => theme.colors.secondary};
  border-radius:10px;
  color:${({ theme }) => theme.colors.white};
  font-weight:500;
  font-size: 0.9rem;
  cursor: default;
`

const StyledAddTagButton = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  background-color:${({ theme }) => theme.colors.darkGrey};
  border-radius:7px;
  color:${({ theme }) => theme.colors.text};
  font-weight:500;
  cursor: pointer;
`
const StyledTagInput = styled.input`
  padding: 2px 10px;
  margin: 0 3px;
  border-radius: 10px;
  color:${({ theme }) => theme.colors.white};
  border:none;
  width:100px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus{
    outline:none;
  }

`

const ContentContainer = styled.div`  
  width:100%;
  margin:20px auto;
  background-color:${({ theme }) => theme.colors.white};
  padding:10px;
  border-radius:5px;
  height:85vh;
  >div{
    width:100%;
    height:100%;
  }
  .ProseMirror{
    width:65%;
    height:100%;
    margin:0 auto;
  }
  .ProseMirror:focus{
    border:none;
    outline:none;
  }

  /* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }
  img {
    display: block;
    height: auto;
    margin: 1.5rem 0;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid var(--purple);
    }
  }
  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: ${({ theme }) => theme.colors.darkGrey};
    border-radius: 2px;
    color: ${({ theme }) => theme.colors.black};
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background-color: ${({ theme }) => theme.colors.black};
    border-radius: 0.5rem;
    color:   ${({ theme }) => theme.colors.white};
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: ${({ theme }) => theme.colors.text};
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.lightGrey};
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}
`

const StyledMenuContainer = styled.div`
  margin:20px auto;
  padding:0;
  height:50px;
  width:65%;
  display:flex;
  flex-flow: row nowrap;
  align-items:center;
  justify-content:space-between;
  border-radius:35px;
  background-color:${({ theme }) => theme.colors.white};
`

const StyledSelect = styled.select`
  height:40px;
  border:none;
  background-color:unset;
`

const StyledButton = styled.button`
  color:${({ theme }) => theme.colors.text};
  margin: 0 5px;
  padding:2px 0;
  border:none;
  border-radius:5px;
  background-color: ${({ $active, $disabled, theme }) => $active ? theme.colors.darkGrey : $disabled ? theme.colors.lightGrey : 'unset'};
  cursor:pointer;
  >img{
    width:25px;
    height:25px;
    margin: 0 5px;
  }
  &.image{
    padding:5px;
    margin: 0;
    background-color: rgb(144, 223, 232);
  }
`

function TextSizeDropdown({ editor }) {
  if (!editor) return null;

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      currentHeading:
        ctx.editor.isActive('heading', { level: 1 })
          ? 'h1'
          : ctx.editor.isActive('heading', { level: 2 })
            ? 'h2'
            : ctx.editor.isActive('heading', { level: 3 })
              ? 'h3'
              : ctx.editor.isActive('heading', { level: 4 })
                ? 'h4'
                : ctx.editor.isActive('heading', { level: 5 })
                  ? 'h5'
                  : 'paragraph',
    }),
  });

  const handleChange = (e) => {
    const val = e.target.value;
    // editor.chain().focus();
    if (val === 'paragraph') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: Number(val.replace('h', '')) }).run();
  };

  return (
    <StyledSelect value={editorState.currentHeading} onChange={handleChange}>
      <option value="paragraph">Tekst</option>
      <option value="h1">Nagłówek 1</option>
      <option value="h2">Nagłówek 2</option>
      <option value="h3">Nagłówek 3</option>
      <option value="h4">Nagłówek 4</option>
      <option value="h5">Nagłówek 5</option>
      <option value="h6">Nagłówek 6</option>
    </StyledSelect>
  );
}

function RightMenuBar({ editor }) {
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive('italic') ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isUnderline: ctx.editor.isActive('underline') ?? false,
      canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
      isStrike: ctx.editor.isActive('strike') ?? false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
      isCode: ctx.editor.isActive('code') ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
      isLink: ctx.editor.isActive('link') ?? false,
      canLink: ctx.editor.can().chain().toggleLink().run() ?? false,
      isBulletList: ctx.editor.isActive('bulletList') ?? false,
      isOrderedList: ctx.editor.isActive('orderedList') ?? false,
      isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
      isBlockquote: ctx.editor.isActive('blockquote') ?? false,
    }),
  })

  return (
    <>
      <StyledButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        $disabled={!editorState.canBold}
        $active={editorState.isBold ? true : false}
      >
        <img src="./icons/type-bold.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        $disabled={!editorState.canItalic}
        $active={editorState.isItalic ? true : false}
      >
        <img src="./icons/type-italic.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        $disabled={!editorState.canUnderline}
        $active={editorState.isUnderline ? true : false}
      >
        <img src="./icons/type-underline.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        $disabled={!editorState.canStrike}
        $active={editorState.isStrike ? true : false}
      >
        <img src="./icons/type-strikethrough.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        $disabled={!editorState.canCode}
        $active={editorState.isCode ? true : false}
      >
        <img src="./icons/code.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleLink().run()}
        $active={editorState.isLink ? true : false}
      >
        <img src="./icons/link.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        $active={editorState.isBulletList ? true : false}
      >
        <img src="./icons/list-ul.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        $active={editorState.isOrderedList ? true : false}
      >
        <img src="./icons/list-ol.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        $active={editorState.isCodeBlock ? true : false}
      >
        <img src="./icons/code-square.svg" />
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        $active={editorState.isBlockquote ? true : false}
      >
        <img src="./icons/blockquote-left.svg" />
      </StyledButton>
    </>
  )
}

const TextEditor = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [name, setName] = useState("Wykład algorytmika i programowanie");
  const [content, setContent] = useState("Siemano *kolano*");
  const [tags, setTags] = useState(["studia", "semestr1", "kolokwium1", "algorytmika"])
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    const result = getDocumentDetails(1, "12314532");
    if (result.errorCode)
      setErrorMessage(result.message);
    else {
      if (result.name)
        setName(result.name);
      if (result.content)
        setContent(result.content);
    }
  }, []);

  const addTag = () => {
    const value = newTag.trim()
    if (!value) return

    if (!tags.includes(value)) {
      setTags(prev => [...prev, value])
    }

    setNewTag('')
    setIsAddingTag(false)
  }

  const editor = useEditor({
    extensions: [StarterKit, Image, Dropcursor, Markdown],
    content: content,
  })

  return (
    <StyledContainer>
      <StyledTitleInput
        type="text"
        name="name"
        value={name}
        autoComplete="off"
        onChange={e => setName(e.target.value)}
      />
      <TagsContainer>
        <p>Tagi: </p>
        {tags.map((tag, index) => (
          <StyledTag key={index}>
            {tag}
          </StyledTag>
        ))}
        {isAddingTag && (
          <StyledTagInput
            autoFocus
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addTag()
              if (e.key === 'Escape') {
                setIsAddingTag(false)
                setNewTag('')
              }
            }}
            onBlur={() => {
              setIsAddingTag(false)
              setNewTag('')
            }}
          />
        )}

        {!isAddingTag && (
          <StyledAddTagButton onClick={() => setIsAddingTag(true)}>
            +
          </StyledAddTagButton>
        )}

      </TagsContainer>
      <StyledMenuContainer>
        <StyledButton className="image" onClick={() => {
          const url = window.prompt('URL')
          if (url)
            editor.chain().focus().setImage({ src: url }).run();
        }}>
          <img src="./icons/card-image.svg" />
        </StyledButton>
        <RightMenuContainer>
          <TextSizeDropdown editor={editor} />
          <RightMenuBar editor={editor} />
        </RightMenuContainer>
      </StyledMenuContainer>
      <ContentContainer>
        <EditorContent editor={editor} />
      </ContentContainer>
    </StyledContainer >
  )
}

export default TextEditor