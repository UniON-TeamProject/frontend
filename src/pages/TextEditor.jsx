import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Markdown } from 'tiptap-markdown'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { useParams, useLocation } from 'react-router-dom';
import Typography from '@tiptap/extension-typography'
import React, { useState, useEffect, useRef } from 'react'
import { getNoteDetails, editNote, renameNote, addNoteTag, removeNoteTag, getNoteTags, getNoteSuggestedTags, getSocialGroup } from '../api'
import styled from 'styled-components'
import Image from '@tiptap/extension-image'
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import Text from '../components/atoms/Text';
import Commands from '../helpers/textEditor/commands.js'
import createSuggestion from '../helpers/textEditor/suggestion.js'
import { slashItems } from '../helpers/textEditor/slashItems.jsx'
import TextEditorFormatting from '../components/editor/TextEditorFormatting.jsx'
import DragHandle from '@tiptap/extension-drag-handle-react'
import FlashcardCreatorSidebar from '../components/editor/FlashcardCreatorSidebar.jsx'
import AIFlashcardModal from '../components/editor/AIFlashcardModal.jsx'
import Layout from '../components/organisms/Layout.jsx'

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
  box-shadow: 0 1px 8px ${({ theme }) => theme.colors.primary};
  @media(max-width:768px){
    position:static;
  }
`

const StyledTitleInput = styled.input`
  width:65%;
  padding: 10px 0 10px 0;
  margin: 0;
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
    padding: 35px 10px 10px 10px;
  }
`

const TagsContainer = styled.div`
  width:65%;
  display:flex;
  flex-flow:row wrap;
  align-items:center;
  margin-bottom:10px;
  >p{
    color:${({ theme }) => theme.colors.darkGrey};
    font-size:0.85rem;
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
  min-height:28px;
  margin: 3px;
  background-color:${({ theme, $inactive }) => $inactive ? "rgba(200, 212, 184, 0.7)" : theme.colors.secondary};
  border-radius:12px;
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
    bottom:3px;
  }
`

const StyledAddTagButton = styled.div`
  padding:0px 8px;
  margin: 0 3px;
  border-radius:10px;
  border: 1px dashed ${({ theme }) => theme.colors.secondary};
  color:${({ theme }) => theme.colors.text};
  font-weight:500;
  cursor: pointer;
    color: ${({ theme }) => theme.colors.secondary};
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
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const ContentContainer = styled.div`
  width:100%;
  margin:30px auto 0 auto;
  background-color:${({ theme }) => theme.colors.lightGrey};
  border-radius:5px;
  height:100%;
  min-height:70vh;
  @media(max-width:768px){
    padding-bottom: 70px;
  }
  >div{
    width:100%;
    height:100%;
  }
  .ProseMirror{
    width:65%;
    height:100%;
    padding:22px 0 50px 0;
    margin:0 auto;
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

const TopControlsWrapper = styled.div`
  width: 65%;
  display: flex;
  align-items: center;
  padding-top: ${({ $collapsed }) => $collapsed ? "15px" : "35px"};
  transition: padding 0.35s ease;
  z-index: 11;
  
  @media(max-width: 768px) {
    width: 100%;
    padding: 15px 10px 0 10px;
  }
`

const ReturnButton = styled.div`
  display:flex;
  align-items:center;
  cursor:pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.darkGrey || '#666'};
  transition: color 0.2s;
  user-select: none;
  -webkit-user-select: none;
  
  &:hover {
      color: ${({ theme }) => theme.colors?.text || '#000'};
  }
  
  svg {
      height: 20px;
      width: 20px;
      margin-right: 8px;
  }
`

const CollapsingSection = styled.div`
    width:100%;
    display:flex;
    flex-direction:column;
    align-items:center;
    overflow:hidden;
    max-height: ${({ $collapsed }) => $collapsed ? '0' : '300px'};
    opacity: ${({ $collapsed }) => $collapsed ? '0' : '1'};
    transition: max-height 0.35s ease, opacity 0.25s ease;
`

const TagsDivider = styled.div`
    width:65%;
    height:1px;
    background-color:${({ theme }) => theme.colors.primary};
    margin:6px 0 0 0;
    @media(max-width:768px){
        width:100%;
    }
`

const FlashcardToggleButton = styled.button`
  position: absolute;
  top: 18px;
  right: 20px;
  z-index: 11;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  svg {
    width: 20px;
    height: 20px;
    margin: auto;
  }
`

const FlashcardBubbleButton = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  margin: 0 1px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  box-sizing: content-box;
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }
`

const StyledFloatingButton = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  color:${({ theme }) => theme.colors.text};
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

const noteNameRegex = /^[a-zA-Z0-9 _\-ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const collapsingSectionRef = useRef(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const location = useLocation();
  const socialId = React.useMemo(() => new URLSearchParams(location.search).get('socialId'), [location.search]);
  const [groupRole, setGroupRole] = useState(null);

  const isReadyForAutoSave = useRef(false);

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

  const ImageDropHandler = Extension.create({
    name: 'imageDropHandler',
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleDrop(view, event) {
              const files = event.dataTransfer?.files;
              if (!files || files.length === 0) return false;

              const images = Array.from(files).filter(f => f.type.startsWith('image/'));
              if (images.length === 0) return false;

              event.preventDefault();
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

              images.forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                  const { tr } = view.state;
                  const node = view.state.schema.nodes.image.create({ src: reader.result });
                  const insertPos = pos?.pos ?? view.state.selection.from;
                  view.dispatch(tr.insert(insertPos, node));
                };
                reader.readAsDataURL(file);
              });

              return true;
            },
            handlePaste(view, event) {
              const items = event.clipboardData?.items;
              if (!items) return false;

              const images = Array.from(items).filter(i => i.type.startsWith('image/'));
              if (images.length === 0) return false;

              event.preventDefault();

              images.forEach(item => {
                const file = item.getAsFile();
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const { tr } = view.state;
                  const node = view.state.schema.nodes.image.create({ src: reader.result });
                  view.dispatch(tr.replaceSelectionWith(node));
                };
                reader.readAsDataURL(file);
              });

              return true;
            },
          },
        }),
      ];
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Markdown, Typography, SaveShortcut, ImageDropHandler,
      Commands.configure({
        suggestion: createSuggestion(slashItems),
      }),
      Placeholder.configure({
        placeholder: () => {
          return "'/' dla formatowania"
        },
      }),
      Image.configure({ inline: false }),
    ],
    content: '',
    onUpdate() {
      if (!isReadyForAutoSave.current) return;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => save(), 2000)
    },
  })


  const fetchNoteDetails = async () => {
    setErrorMessage("");
    const result = await getNoteDetails(id, socialId);

    let currentRole = null;
    if (socialId) {
        const groupRes = await getSocialGroup(socialId);
        if (!groupRes.errorCode) {
            currentRole = groupRes.userRole;
            setGroupRole(currentRole);
        }
    }

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
        if (editor) {
          isReadyForAutoSave.current = false;
          editor.commands.setContent(result.content, false);
          
          const isReadOnly = socialId ? (currentRole !== 'ADMIN' && currentRole !== 'EDITOR') : false;
          editor.setEditable(!isReadOnly);

          setTimeout(() => {
              isReadyForAutoSave.current = true;
          }, 1000);
        }
      }
      handleFetchTags();
      handleFetchSuggestedTags(result.folderId);
    }
  }

  const handleRenameNote = async () => {
    setErrorMessage("");
    const result = await renameNote(id, newName.trim(), socialId);
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
    if (socialId) return;
    setErrorMessage("");
    const result = await getNoteTags(id, socialId);
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
    if (!folderId || socialId) return;
    const result = await getNoteSuggestedTags(folderId);
    if (!result.errorCode) {
      setSuggestedTags(result.tags);
    }
  }

  const handleAddTag = async (tagName) => {
    setErrorMessage("");
    const result = await addNoteTag(id, tagName, socialId);
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
    const result = await removeNoteTag(id, tagName, socialId);
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
    if (!editor || !editor.isEditable) return;
    const html = editor.getHTML();
    if (!html || html === '<p></p>')
      return;

    const result = await editNote(id, html, socialId);
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
        save();
    };
    document.addEventListener('keydown', handler);

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(prev => {
        if (prev && y <= 10) return false;
        if (!prev && y > 10) {
          const collapseHeight = collapsingSectionRef.current?.scrollHeight || 0;
          const maxScrollAfterCollapse = document.documentElement.scrollHeight - collapseHeight - window.innerHeight;
          return maxScrollAfterCollapse > 10;
        }
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('keydown', handler);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id, socialId]);

  useEffect(() => {
    if (editor && content !== undefined)
      editor.commands.setContent(content, false)
  }, [editor, content])

  useEffect(() => {
    if (newName && name != newName.trim()) {
      if (!noteNameRegex.test(newName.trim())) {
        setRenameNoteError(true);
        setRenameNoteErrorMessage("Nazwa może zawierać tylko litery, cyfry, spacje, _ i -");
        return;
      }
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

  const getSelectedText = () => {
    if (!editor) return '';
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const saveSelectionAsFront = () => {
    const text = getSelectedText();
    if (!text) return;
    setIsSidebarOpen(true);
    setFlashcards(prev => {
      if (prev.length === 0) return [{ front: text, back: '' }];
      return prev.map((card, i) =>
        i === prev.length - 1 ? { ...card, front: text } : card
      );
    });
  };

  const saveSelectionAsBack = () => {
    const text = getSelectedText();
    if (!text) return;
    setIsSidebarOpen(true);
    setFlashcards(prev => {
      if (prev.length === 0) return [{ front: '', back: text }];
      return prev.map((card, i) =>
        i === prev.length - 1 ? { ...card, back: text } : card
      );
    });
  };

  const isReadOnly = socialId ? (groupRole !== 'ADMIN' && groupRole !== 'EDITOR') : false;

  return (
    noteNotFoundError ?
      <>
        <Text style={{ marginTop: "100px" }} as="h1" bold text={noteNotFoundMessage} />
        <Text style={{ marginTop: "20px" }} as="h3" text="Sprawdź, czy URL jest poprawny i czy plik istnieje." />
      </>
      :
      <Layout>
        <StyledContainer>
          <StyledHeader>
          {!isReadOnly && (
              <div style={{ position: 'absolute', top: 25, right: 20, display: 'flex', gap: 8, zIndex: 11 }}>
                <FlashcardToggleButton style={{ position: 'static' }} onClick={() => setIsSidebarOpen(o => !o)}>
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                    <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8m0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
                  </svg>
                  Kreator fiszek
                </FlashcardToggleButton>
                <FlashcardToggleButton style={{ position: 'static' }} onClick={() => setIsAIModalOpen(true)}>
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
                  </svg>
                  Stwórz fiszki AI
                </FlashcardToggleButton>
              </div>
            )}

            <TopControlsWrapper $collapsed={isScrolled}>
                <ReturnButton onClick={() => history.back()}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                  </svg>
                  Powrót
                </ReturnButton>
            </TopControlsWrapper>

            <FlashcardCreatorSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              flashcards={flashcards}
              setFlashcards={setFlashcards}
              suggestedTags={suggestedTags}
            />
            <AIFlashcardModal
              isOpen={isAIModalOpen}
              onClose={() => setIsAIModalOpen(false)}
              noteId={id}
            />
            <CollapsingSection ref={collapsingSectionRef} $collapsed={isScrolled}>
              {renameNoteError && <Text style={{ width: "65%", textAlign: 'left' }} color="danger" text={renameNoteErrorMessage} />}
              {isReadOnly ? (
                  <Text as="h1" bold="true" text={newName} style={{ width: '65%', fontSize: '3rem', margin: '10px 0', textAlign: 'left' }} />
              ) : (
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
              )}
              
              {!socialId && (
                <TagsContainer>
                  <p>TAGI: </p>
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
              )}
              <TagsDivider />
            </CollapsingSection>
            {!isReadOnly && <TextEditorFormatting editor={editor} />}
          </StyledHeader >
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
                {isSidebarOpen ? (
                  <>
                    <FlashcardBubbleButton onClick={saveSelectionAsFront}>
                      Zapisz jako przód
                    </FlashcardBubbleButton>
                    <FlashcardBubbleButton onClick={saveSelectionAsBack}>
                      Zapisz jako tył
                    </FlashcardBubbleButton>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </BubbleMenu>
            )}
            <DragHandle editor={editor} nested={false}>
              <div className="custom-drag-handle" />
            </DragHandle>
            <EditorContent editor={editor} />
          </ContentContainer>
        </StyledContainer>
      </Layout>
  )
}

export default TextEditor