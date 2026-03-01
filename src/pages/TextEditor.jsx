import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Markdown } from 'tiptap-markdown'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { useParams } from 'react-router-dom';
import Typography from '@tiptap/extension-typography'
import React, { useState, useEffect, useRef } from 'react'
import { getNoteDetails, editNote, renameNote, addNoteTag, removeNoteTag, getNoteTags, getNoteSuggestedTags } from '../api'
import styled from 'styled-components'
import Image from '@tiptap/extension-image'
import { Extension } from '@tiptap/core';
import Text from '../components/atoms/Text';
import Commands from '../helpers/textEditor/commands.js'
import createSuggestion from '../helpers/textEditor/suggestion.js'
import { slashItems } from '../helpers/textEditor/slashItems.jsx'
import TextSizeDropdown from '../components/editor/TextSizeDropdown.jsx'
import RightMenuBar from '../components/editor/RightMenuBar.jsx'

const StyledContainer = styled.div`
  width:100%;
  min-height:100vh;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  display:flex;
  flex-flow: column;
  align-items:center;
  position:relative;
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
  background-color:${({ theme, $inactive }) => $inactive ? theme.colors.darkGrey : theme.colors.secondary};
  border-radius:10px;
  color:${({ theme }) => theme.colors.white};
  font-weight:500;
  font-size: 0.9rem;
  display:flex;
  flex-flow:row-nowrap;
  cursor: ${({ $inactive }) => $inactive ? 'pointer' : 'default'};
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

const RightMenuContainer = styled.div`
  display:flex;
  flex-flow: row-nowrap;
  align-items:center;
  gap:3px;
`

const StyledButton = styled.button`
  color:${({ theme }) => theme.colors.text};
  padding:8px 3px;
  border:none;
  border-radius:10px;
  background-color: ${({ $active, theme }) => $active ? 'rgba(50, 50, 50, 0.1)' : 'unset'};
  cursor:pointer;
  >svg{
    width:23px;
    height:23px;
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
    margin:16px auto 0 auto;
    @media(max-width:768px){
      width:100%;
      padding:0 10px;
      margin:0;
    }
  }
  .bubble-menu{
    background-color: ${({ theme }) => theme.colors.white};
    padding:3px;
    border-radius:13px;
  }

  .ProseMirror:focus{
    border:none;
    outline:none;
  }
  //placeholder
  .is-empty::before {
    color: ${({ theme }) => theme.colors.darkGrey};
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
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
  h3 {
    line-height: 1.2;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.6rem;
  }

  h3 {
    font-size: 1.4rem;
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

const ReturnButton = styled.div`
    position:absolute;
    top:45px;
    left:30px;
    z-index:11;
    display:flex;
    flex-flow:row nowrap;
    align-items:center;
    cursor:pointer;
    svg{
        height:16px;
        color:${({ theme }) => theme.colors.dark};
    }
    p{
        font-size:.9rem;
        margin-left:5px;
        color:${({ theme }) => theme.colors.dark};
    }
`

const StyledFloatingButton = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  border:none;
  border-radius:10px;
  margin:0 1px;
  padding:5px 10px;
  cursor:pointer;
  box-sizing:content-box;
  &:hover{
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }
`

const TextEditor = () => {
  const { id } = useParams();
  const newNameTimeout = useRef(null);
  const [errorMessage, setErrorMessage] = useState();
  const [renameNoteError, setRenameNoteError] = useState(false);
  const [renameNoteErrorMessage, setRenameNoteErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [content, setContent] = useState(undefined);
  const [tags, setTags] = useState([])
  const [suggestedTags, setSuggestedTags] = useState([])
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
    extensions: [StarterKit, Image, Markdown, Typography, SaveShortcut,
      Commands.configure({
        suggestion: createSuggestion(slashItems),
      }),
      Placeholder.configure({
        placeholder: () => {
          return "'/' dla formatowania"
        },
      }),
    ],
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
      if (result.errorCode == "TOKEN_UNDEFINED")
        navigate("/", { replace: true });
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
      handleFetchTags();
      handleFetchSuggestedTags(result.folderId);
    }
  }

  const handleRenameNote = async () => {
    setErrorMessage("");
    const result = await renameNote(id, newName.trim());
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      }
      else {
        setRenameNoteErrorMessage(result.message);
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setRenameNoteError(true);
      }
    }
    setName(result.newName);
  }

  const handleFetchTags = async () => {
    setErrorMessage("");
    const result = await getNoteTags(id);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      }
      else {
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setErrorMessage(result.message);
      }
      return;
    }
    setTags(result.tags);
  }

  const handleFetchSuggestedTags = async (folderId) => {
    if (!folderId) return;
    const result = await getNoteSuggestedTags(folderId);
    if (!result.errorCode) {
      setSuggestedTags(result.tags);
    }
  }

  const handleAddTag = async (tagName) => {
    setErrorMessage("");
    const result = await addNoteTag(id, tagName);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      }
      else {
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setErrorMessage(result.message);
      }
      return;
    }
    await handleFetchTags();
  }

  const handleRemoveTag = async (tagName) => {
    setErrorMessage("");
    const result = await removeNoteTag(id, tagName);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      }
      else {
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setErrorMessage(result.message);
      }
      return;
    }
    await handleFetchTags();
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
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
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
    if (newName && name != newName.trim()) {
      if (newNameTimeout.current)
        clearTimeout(newNameTimeout.current);
      newNameTimeout.current = setTimeout(() => {
        handleRenameNote();
      }, 1000);
    }
  }, [newName]);

  const addTag = () => {
    const value = newTag.trim()
    setNewTag('')
    setIsAddingTag(false)

    if (value && !tags.includes(value))
      handleAddTag(value)
  }

  return (
    noteNotFoundError ?
      <>
        <Text style={{ marginTop: "100px" }} as="h1" bold text={noteNotFoundMessage} />
        <Text style={{ marginTop: "20px" }} as="h3" text="Sprawdź, czy URL jest poprawny i czy plik istnieje." />
      </>
      :
      <StyledContainer>
        <ReturnButton onClick={() => history.back()}>
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
          </svg>
          <p>Wróć</p>
        </ReturnButton>
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
                <div onClick={() => { handleRemoveTag(tag) }}>x</div>
              </StyledTag>
            ))}
            {suggestedTags.filter(t => !tags.includes(t)).map((tag, index) => (
              <StyledTag key={`suggested-${index}`} $inactive onClick={() => handleAddTag(tag)}>
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
          {editor && (
            <BubbleMenu className="bubble-menu" editor={editor}>
              <StyledFloatingButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
              >
                Pogrubienie
              </StyledFloatingButton>
              <StyledFloatingButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
              >
                Kursywa
              </StyledFloatingButton>
              <StyledFloatingButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'is-active' : ''}
              >
                Podkreślenie
              </StyledFloatingButton>
              <StyledFloatingButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'is-active' : ''}
              >
                Przekreślenie
              </StyledFloatingButton>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </ContentContainer>
      </StyledContainer >
  )
}

export default TextEditor
