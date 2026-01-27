import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { Markdown } from 'tiptap-markdown'
import StarterKit from '@tiptap/starter-kit'
import { useParams } from 'react-router-dom';
import Typography from '@tiptap/extension-typography'
import React, { useState, useEffect, useRef } from 'react'
import { getNoteDetails, editNote, renameNote } from '../api'
import styled from 'styled-components'
import Image from '@tiptap/extension-image'
import { Extension } from '@tiptap/core';
import Text from '../components/atoms/Text';

const StyledContainer = styled.div`
  width:100%;
  min-height:100vh;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  display:flex;
  flex-flow: column;
  align-items:center;
`

const StyledHeader = styled.div`
  position: sticky;
  width:100%;  
  display:flex;
  flex-flow: column;
  align-items:center;
  top: 0;
  z-index: 10;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  @media(max-width:768px){
    position:static;
  }
`

const StyledTitleInput = styled.input`
  width:65%;
  padding:10px 0;
  margin: 10px 0;
  border:none;
  font-size: 3rem;
  font-weight:900;
  color:${({ theme }) => theme.colors.text};
  background-color: ${({ theme, $mode }) => $mode == "error" ? `rgba(239, 68, 68, 0.2)` : theme.colors.lightGrey};

  &:focus{
    border:none;
    outline:none;
  }
  @media(max-width:768px){
    width:100%;
    padding:0 10px; 
  }
`

const TagsContainer = styled.div`
  width:65%;
  display:flex;
  flex-flow:row wrap;
  align-items:center;
  >p{
    color:${({ theme }) => theme.colors.darkGrey};
    font-size:1rem;
    margin-right:7px;
    font-weight:600;
  }
  @media(max-width:768px){
    width:100%;
    padding:0 10px; 
  }
`

const StyledTag = styled.div`
  padding:2px 10px;
  margin: 3px;
  background-color:${({ theme }) => theme.colors.secondary};
  border-radius:10px;
  color:${({ theme }) => theme.colors.white};
  font-weight:500;
  font-size: 0.9rem;
  display:flex;
  flex-flow:row-nowrap;
  cursor: default;
  >div{
    cursor:pointer;
    font-weight:700;
    font-size:1rem;
    margin:0 0 0 6px;
    padding:0;
    position:relative;
    bottom:2px;
  }
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

const StyledMenuContainer = styled.div`
  margin:20px auto;
  padding:0;
  height:50px;
  width:65%;
  display:flex;
  flex-flow: row wrap;
  align-items:center;
  justify-content:space-between;
  border-radius:35px;
  background-color:${({ theme }) => theme.colors.lightGrey};
  @media(max-width:768px){
    width:100%;
    padding:0 10px; 
  }
`

const StyledSelect = styled.select`
  height:40px;
  border:none;
  background-color:unset;
  margin-right:15px;
  option{
    font-weight:600;
  }
  @media(max-width:768px){
    margin-right:5px;
  }
`

const RightMenuContainer = styled.div`
  display:flex;
  flex-flow: row-nowrap;
  align-items:center;
`

const StyledButton = styled.button`
  color:${({ theme }) => theme.colors.text};
  margin: 0 5px;
  padding:3px 0;
  border:none;
  border-radius:5px;
  background-color: ${({ $active, theme }) => $active ? theme.colors.darkGrey : 'unset'};
  cursor:pointer;
  >svg{
    width:25px;
    height:25px;
    margin: 0 5px;
    color: ${({ $disabled, theme }) => $disabled ? theme.colors.darkGrey : theme.colors.text};
  }
  &.image{
    padding:0px;
    width:35px;
    height:35px;
    margin: 0;
    background-color: rgb(144, 223, 232);
    >svg{
      margin: auto;
    }
  }
`

const ContentContainer = styled.div`  
  width:100%;
  margin:20px auto;
  background-color:${({ theme }) => theme.colors.lightGrey};
  padding:10px;
  border-radius:5px;
  height:100%;
  min-height:70vh;
  >div{
    width:100%;
    height:100%;
  }
  .ProseMirror{
    width:65%;
    height:100%;
    margin:0 auto;
    @media(max-width:768px){
      width:100%;
      padding:0 10px; 
      margin:0;
    }
  }
  .ProseMirror:focus{
    border:none;
    outline:none;
  }

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
    background-color: ${({ theme }) => theme.colors.dark};
    border-radius: 0.5rem;
    color: ${({ theme }) => theme.colors.white};
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: ${({ theme }) => theme.colors.white};
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
    if (val === 'paragraph') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: Number(val.replace('h', '')) }).run();
  };

  return (
    <StyledSelect value={editorState.currentHeading} onChange={handleChange}>
      <option value="paragraph">Tekst</option>
      <option value="h1">H1</option>
      <option value="h2">H2</option>
      <option value="h3">H3</option>
      <option value="h4">H4</option>
      <option value="h5">H5</option>
      <option value="h6">H6</option>
    </StyledSelect>
  );
}

function RightMenuBar({ editor }) {
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isItalic: ctx.editor.isActive('italic'),
      canItalic: ctx.editor.can().chain().toggleItalic().run(),
      isUnderline: ctx.editor.isActive('underline'),
      canUnderline: ctx.editor.can().chain().toggleUnderline().run(),
      isStrike: ctx.editor.isActive('strike'),
      canStrike: ctx.editor.can().chain().toggleStrike().run(),
      isCode: ctx.editor.isActive('code'),
      canCode: ctx.editor.can().chain().toggleCode().run(),
      isLink: ctx.editor.isActive('link'),
      canLink: ctx.editor.can().chain().toggleLink().run(),
      isBulletList: ctx.editor.isActive('bulletList'),
      isOrderedList: ctx.editor.isActive('orderedList'),
      isCodeBlock: ctx.editor.isActive('codeBlock'),
      isBlockquote: ctx.editor.isActive('blockquote'),
    }),
  })

  return (
    <>
      <StyledButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        $disabled={!editorState.canBold}
        $active={editorState.isBold ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        $disabled={!editorState.canItalic}
        $active={editorState.isItalic ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        $disabled={!editorState.canUnderline}
        $active={editorState.isUnderline ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57s-2.687-1.08-2.687-2.57zM12.5 15h-9v-1h9z" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        $disabled={!editorState.canStrike}
        $active={editorState.isStrike ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.8 2.8 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        $disabled={!editorState.canCode}
        $active={editorState.isCode ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleLink().run()}
        $active={editorState.isLink ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        $active={editorState.isBulletList ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        $active={editorState.isOrderedList ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5" />
          <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        $active={editorState.isCodeBlock ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
          <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0" />
        </svg>
      </StyledButton>
      <StyledButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        $active={editorState.isBlockquote ? true : false}
      >
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1zm.79-5.373q.168-.117.444-.275L3.524 6q-.183.111-.452.287-.27.176-.51.428a2.4 2.4 0 0 0-.398.562Q2 7.587 2 7.969q0 .54.217.873.217.328.72.328.322 0 .504-.211a.7.7 0 0 0 .188-.463q0-.345-.211-.521-.205-.182-.568-.182h-.282q.036-.305.123-.498a1.4 1.4 0 0 1 .252-.37 2 2 0 0 1 .346-.298zm2.167 0q.17-.117.445-.275L5.692 6q-.183.111-.452.287-.27.176-.51.428a2.4 2.4 0 0 0-.398.562q-.165.31-.164.692 0 .54.217.873.217.328.72.328.322 0 .504-.211a.7.7 0 0 0 .188-.463q0-.345-.211-.521-.205-.182-.568-.182h-.282a1.8 1.8 0 0 1 .118-.492q.087-.194.257-.375a2 2 0 0 1 .346-.3z" />
        </svg>
      </StyledButton>
    </>
  )
}

const TextEditor = () => {
  const { id } = useParams();
  const newNameTimeout = useRef(null);
  const [errorMessage, setErrorMessage] = useState();
  const [renameNoteError, setRenameNoteError] = useState(false);
  const [renameNoteErrorMessage, setRenameNoteErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [content, setContent] = useState(undefined);
  const [tags, setTags] = useState(["studia", "semestr1", "kolokwium1", "algorytmika"])
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [noteNotFoundError, setNoteNotFoundError] = useState(false);
  const [noteNotFoundMessage, setNoteNotFoundMessage] = useState("");
  const saveTimeout = useRef(null);

  const SaveShortcut = Extension.create({
    name: 'saveShortcut',

    addKeyboardShortcuts() {
      return {
        'Mod-s': () => {
          save();
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Image, Markdown, Typography, SaveShortcut],
    content: '',
    onUpdate() {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => save(), 2000)
    },
  })

  const fetchNoteDetails = async () => {
    setErrorMessage("");
    const result = await getNoteDetails(id);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      }
      else
        setErrorMessage(result.message);
    }
    else {
      if (result.name) {
        setName(result.name);
        setNewName(result.name);
      }
      if (result.content !== undefined) {
        setContent(result.content);
        if (editor)
          editor.commands.setContent(result.content);
      }
    }
  }

  const handleRenameNote = async () => {
    setErrorMessage("");
    const result = await renameNote(id, newName);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      }
      else {
        setRenameNoteError(true);
        setRenameNoteErrorMessage(result.message);
      }
    }
    setName(result.newName);
  }

  const save = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    if (!html || html === '<p></p>')
      return;

    const result = await editNote(id, html);
    if (result.errorCode) {
      if (result.errorCode === "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      } else {
        setErrorMessage(result.message);
      }
    }
  };

  useEffect(() => {
    fetchNoteDetails();
    const handler = (e) => {
      if (e.key === 's' && (navigator.userAgent.includes('Mac') ? e.metaKey : e.ctrlKey))
        e.preventDefault();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (editor && content !== undefined)
      editor.commands.setContent(content)
  }, [editor, content])

  useEffect(() => {
    if (newName && name != newName) {
      if (newNameTimeout.current)
        clearTimeout(newNameTimeout.current);
      newNameTimeout.current = setTimeout(() => {
        handleRenameNote();
      }, 1000);
    }
  }, [newName]);

  const addTag = () => {
    const value = newTag.trim()

    if (value && !tags.includes(value))
      setTags(prev => [...prev, value])

    setNewTag('')
    setIsAddingTag(false)
  }

  const removeTag = (valueToRemove) => {
    setTags(prev => prev.filter(tag => tag !== valueToRemove));
  }

  return (
    noteNotFoundError ?
      <>
        <Text style={{ marginTop: "100px" }} as="h1" bold text={noteNotFoundMessage} />
        <Text style={{ marginTop: "20px" }} as="h3" text="Sprawdź, czy URL jest poprawny i czy plik istnieje." />
      </>
      :
      <StyledContainer>
        <StyledHeader>
          {renameNoteError && <Text style={{ width: "65%", textAlign: 'left' }} color="danger" text={renameNoteErrorMessage} />}
          <StyledTitleInput
            type="text"
            name="name"
            value={newName}
            $mode={renameNoteError ? "error" : ""}
            autoComplete="off"
            onChange={e => {
              setRenameNoteError(false);
              setRenameNoteErrorMessage("");
              setNewName(e.target.value);
            }}
          />
          <TagsContainer>
            <p>Tagi: </p>
            {tags.map((tag, index) => (
              <StyledTag key={index}>
                {tag}
                <div onClick={() => { removeTag(tag) }}>x</div>
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
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z" />
              </svg>
            </StyledButton>
            <RightMenuContainer>
              <TextSizeDropdown editor={editor} />
              <RightMenuBar editor={editor} />
            </RightMenuContainer>
          </StyledMenuContainer>
        </StyledHeader>
        {errorMessage && <Text color="danger" text={errorMessage} />}
        <ContentContainer
          onClick={(e) => {
            if (!editor) return;
            if (e.target === e.currentTarget)
              editor.chain().focus('end').run();
          }}
        >
          <EditorContent editor={editor} />
        </ContentContainer>
      </StyledContainer >
  )
}

export default TextEditor