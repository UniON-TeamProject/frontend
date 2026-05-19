import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Markdown } from "tiptap-markdown";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { useParams, useLocation } from "react-router-dom";
import Typography from "@tiptap/extension-typography";
import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import {
  getNoteDetails,
  editNote,
  renameNote,
  addNoteTag,
  removeNoteTag,
  getNoteTags,
  getNoteSuggestedTags,
  getSocialGroup,
} from "../api";
import styled, { useTheme } from "styled-components";
import Image from "@tiptap/extension-image";
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import Text from "../components/atoms/Text";
import Commands from "../helpers/textEditor/commands.js";
import createSuggestion from "../helpers/textEditor/suggestion.js";
import { slashItems } from "../helpers/textEditor/slashItems.jsx";
import TextEditorFormatting from "../components/editor/TextEditorFormatting.jsx";
import DragHandle from "@tiptap/extension-drag-handle-react";
import FlashcardCreatorSidebar from "../components/editor/FlashcardCreatorSidebar.jsx";
import AIFlashcardModal from "../components/editor/AIFlashcardModal.jsx";
import Layout from "../components/organisms/Layout.jsx";

const StyledContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  display: flex;
  flex-flow: column;
  align-items: center;
  position: relative;
`;

const StyledHeader = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.lightGrey};
`;

const StickyToolbar = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 10;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledTitleInput = styled.input`
  width: 65%;
  padding: 10px 0 10px 0;
  margin: 0;
  border: none;
  font-size: 3rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme, $mode }) =>
    $mode == "error" ? `rgba(239, 68, 68, 0.2)` : theme.colors.lightGrey};

  &:focus {
    border: none;
    outline: none;
  }
  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
  }
`;

const TagsContainer = styled.div`
  width: 65%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  margin-bottom: 10px;
  > p {
    color: ${({ theme }) => theme.colors.darkGrey};
    font-size: 0.85rem;
    margin-right: 7px;
    font-weight: 600;
  }
  @media (max-width: 768px) {
    width: 100%;
    padding: 0 10px;
  }
`;

const StyledTag = styled.div`
  padding: 2px 10px;
  min-height: 28px;
  margin: 3px;
  background-color: ${({ theme, $inactive }) =>
    $inactive ? "rgba(200, 212, 184, 0.7)" : theme.colors.secondary};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  flex-flow: row-nowrap;
  cursor: ${({ $inactive }) => ($inactive ? "pointer" : "default")};
  > div {
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    margin: 0 0 0 6px;
    padding: 0;
    position: relative;
    bottom: 3px;
  }
`;

const StyledAddTagButton = styled.div`
  padding: 4px 12px;
  margin: 0 3px;
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: all 0.2s;
  @media (hover: hover) {
    &:hover {
      background-color: ${({ theme }) => theme.colors.lightGrey};
      color: ${({ theme }) => theme.colors.text};
      border-color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const StyledTagInput = styled.input`
  padding: 2px 10px;
  margin: 0 3px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 100px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus {
    outline: none;
  }
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  margin: 30px auto 0 auto;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  border-radius: 5px;
  height: 100%;
  min-height: 70vh;
  @media (max-width: 768px) {
    padding-bottom: 20px;
    min-height: unset;
  }
  > div {
    width: 100%;
    height: 100%;
  }
  .ProseMirror {
    width: 65%;
    height: 100%;
    padding: 22px 0 50px 0;
    margin: 0 auto;
    @media (max-width: 768px) {
      width: 100%;
      padding: 0 10px;
      margin: 0;
    }
  }
  .bubble-menu {
    background-color: ${({ theme }) => theme.colors.white};
    padding: 3px;
    border-radius: 13px;
  }

  .ProseMirror:focus {
    border: none;
    outline: none;
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
      font-family: "JetBrainsMono", monospace;
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
`;

const TopControlsWrapper = styled.div`
  width: 65%;
  display: flex;
  align-items: center;
  padding-top: 35px;
  z-index: 11;

  @media (max-width: 768px) {
    width: 100%;
    padding: 15px 10px 0 10px;
  }
`;

const ReturnButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.darkGrey || "#666"};
  transition: color 0.2s;
  user-select: none;
  -webkit-user-select: none;

  &:hover {
    color: ${({ theme }) => theme.colors?.text || "#000"};
  }

  svg {
    height: 20px;
    width: 20px;
    margin-right: 8px;
  }
`;

const CollapsingSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RenameErrorWrapper = styled.div`
  width: 65%;
  text-align: left;
  align-self: flex-start;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 768px) {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    margin-left: 0;
    margin-right: 0;
  }
`;

const TagsDivider = styled.div`
  width: 65%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.primary};
  margin: 6px 0 0 0;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

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
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 51;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MobileDropdown = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? "flex" : "none")};
    flex-direction: column;
    position: absolute;
    top: 48px;
    right: 12px;
    z-index: 100;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    min-width: 200px;
  }
`;

const MobileDropdownItem = styled.button`
  background: none;
  border: none;
  padding: 13px 16px;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const DesktopButtonsWrapper = styled.div`
  position: absolute;
  top: 25px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 50;
  @media (max-width: 768px) {
    display: none;
  }
`;

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
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 7px;
  }
`;

const StyledFloatingButton = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 10px;
  margin: 0 1px;
  padding: 5px 10px;
  cursor: pointer;
  box-sizing: content-box;
  @media (hover: hover) {
    &:hover {
      background-color: ${({ theme }) => theme.colors.lightGrey};
    }
  }
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 7px;
  }
`;

const HelpIconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors?.borderLight};
  color: ${({ theme }) => theme.colors?.textLight};
  font-size: 0.8rem;
  font-weight: bold;
  cursor: default;
  z-index: 12;

  &:hover > div {
    display: block;
  }
`;

const HelpTooltip = styled.div`
  display: none;
  position: absolute;
  right: calc(100% + 12px); // zeby otwieral sie w lewo
  top: 50%;
  transform: translateY(-50%);
  background-color: ${({ theme }) => theme.colors?.takiSmiesznyZielonyAleJasny};
  color: ${({ theme }) => theme.colors?.white};
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  padding: 12px 14px;
  border-radius: 8px;
  width: 280px;
  z-index: 100;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  line-height: 1.4;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent
      ${({ theme }) => theme.colors?.veryDarkPrimary} transparent;
  }
`;

const noteNameRegex = /^[a-zA-Z0-9 _\-ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;
const stripEmoji = (str) => str.replace(/\p{Extended_Pictographic}/gu, "");

const TextEditor = () => {
  const { id } = useParams();
  const theme = useTheme();
  const newNameTimeout = useRef(null);
  const [errorMessage, setErrorMessage] = useState();
  const [renameNoteError, setRenameNoteError] = useState(false);
  const [renameNoteErrorMessage, setRenameNoteErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [content, setContent] = useState(undefined);
  const [tags, setTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [noteNotFoundError, setNoteNotFoundError] = useState(false);
  const [noteNotFoundMessage, setNoteNotFoundMessage] = useState("");
  const saveTimeout = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const location = useLocation();
  const socialId = React.useMemo(
    () => new URLSearchParams(location.search).get("socialId"),
    [location.search]
  );
  const [groupRole, setGroupRole] = useState(null);

  const isReadyForAutoSave = useRef(false);

  const SaveShortcut = Extension.create({
    name: "saveShortcut",

    addKeyboardShortcuts() {
      return {
        "Mod-s": () => {
          save();
          return true;
        },
      };
    },
  });

  const ImageDropHandler = Extension.create({
    name: "imageDropHandler",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleDrop(view, event) {
              const files = event.dataTransfer?.files;
              if (!files || files.length === 0) return false;

              const images = Array.from(files).filter((f) =>
                f.type.startsWith("image/")
              );
              if (images.length === 0) return false;

              event.preventDefault();
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              images.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const { tr } = view.state;
                  const node = view.state.schema.nodes.image.create({
                    src: reader.result,
                  });
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

              const images = Array.from(items).filter((i) =>
                i.type.startsWith("image/")
              );
              if (images.length === 0) return false;

              event.preventDefault();

              images.forEach((item) => {
                const file = item.getAsFile();
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const { tr } = view.state;
                  const node = view.state.schema.nodes.image.create({
                    src: reader.result,
                  });
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
    extensions: [
      StarterKit,
      Markdown,
      Typography,
      SaveShortcut,
      ImageDropHandler,
      Commands.configure({
        suggestion: createSuggestion(slashItems),
      }),
      Placeholder.configure({
        placeholder: () => {
          return "'/' dla formatowania";
        },
      }),
      Image.configure({ inline: false }),
    ],
    content: "",
    onUpdate() {
      if (!isReadyForAutoSave.current) return;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => save(), 2000);
    },
  });

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
      } else setErrorMessage(result.message);
      if (result.errorCode == "TOKEN_UNDEFINED")
        navigate("/", { replace: true });
    } else {
      if (result.name) {
        setName(result.name);
        setNewName(result.name);
      }
      if (result.content !== undefined) {
        setContent(result.content);
        if (editor) {
          isReadyForAutoSave.current = false;
          editor.commands.setContent(result.content, false);

          const isReadOnly = socialId
            ? currentRole !== "ADMIN" && currentRole !== "EDITOR"
            : false;
          editor.setEditable(!isReadOnly);

          setTimeout(() => {
            isReadyForAutoSave.current = true;
          }, 1000);
        }
      }
      handleFetchTags();
      handleFetchSuggestedTags(result.folderId);
    }
  };

  const handleRenameNote = async () => {
    setErrorMessage("");
    const result = await renameNote(id, newName.trim(), socialId);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      } else {
        setRenameNoteErrorMessage(result.message);
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setRenameNoteError(true);
      }
    }
    setName(result.newName);
  };

  const handleFetchTags = async () => {
    if (socialId) return;
    setErrorMessage("");
    const result = await getNoteTags(id, socialId);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      } else {
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setErrorMessage(result.message);
      }
      return;
    }
    setTags(result.tags);
  };

  const handleFetchSuggestedTags = async (folderId) => {
    if (!folderId || socialId) return;
    const result = await getNoteSuggestedTags(folderId);
    if (!result.errorCode) {
      setSuggestedTags(result.tags);
    }
  };

  const handleAddTag = async (tagName) => {
    setErrorMessage("");
    const result = await addNoteTag(id, tagName, socialId);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      } else {
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setErrorMessage(result.message);
      }
      return;
    }
    await handleFetchTags();
  };

  const handleRemoveTag = async (tagName) => {
    setErrorMessage("");
    const result = await removeNoteTag(id, tagName, socialId);
    if (result.errorCode) {
      if (result.errorCode == "NOTE_NOT_FOUND") {
        setNoteNotFoundError(true);
        setNoteNotFoundMessage(result.message);
      } else {
        if (result.errorCode == "TOKEN_UNDEFINED")
          navigate("/", { replace: true });
        setErrorMessage(result.message);
      }
      return;
    }
    await handleFetchTags();
  };

  const save = async () => {
    if (!editor || !editor.isEditable) return;
    const html = editor.getHTML();
    if (!html || html === "<p></p>") return;

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

  const prepareHtmlForPdf = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const processList = (list, depth = 0) => {
      const isOrdered = list.tagName === "OL";
      const items = Array.from(list.children).filter((c) => c.tagName === "LI");
      const wrapper = document.createElement("div");
      wrapper.style.paddingLeft = depth === 0 ? "0" : "1.2rem";
      wrapper.style.margin = "0.3rem 0";

      items.forEach((li, index) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "baseline";
        row.style.margin = "0.15rem 0";

        const marker = document.createElement("span");
        marker.style.minWidth = "1.4rem";
        marker.style.flexShrink = "0";
        marker.textContent = isOrdered ? `${index + 1}.` : "•";

        const content = document.createElement("span");
        content.style.flex = "1";

        Array.from(li.childNodes).forEach((child) => {
          if (child.tagName === "UL" || child.tagName === "OL") {
            row.appendChild(processList(child, depth + 1));
          } else {
            content.appendChild(child.cloneNode(true));
          }
        });

        row.appendChild(marker);
        row.appendChild(content);

        const nestedLists = Array.from(li.querySelectorAll(":scope > ul, :scope > ol"));
        nestedLists.forEach((nested) => row.appendChild(processList(nested, depth + 1)));

        wrapper.appendChild(row);
      });

      return wrapper;
    };

    doc.querySelectorAll("ul, ol").forEach((list) => {
      if (!list.closest("li")) {
        list.replaceWith(processList(list));
      }
    });

    doc.querySelectorAll("img").forEach((img) => {
      const wrapper = document.createElement("div");
      wrapper.style.pageBreakInside = "avoid";
      wrapper.style.breakInside = "avoid";
      wrapper.style.display = "block";
      wrapper.style.margin = "1rem 0";
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    });

    return doc.body.innerHTML;
  };

  const exportToPdf = () => {
    if (!editor) return;
    const html = prepareHtmlForPdf(editor.getHTML());
    const content = `
      <div style="font-family: sans-serif; padding: 20px;">
        <style>
          ul, ol { list-style: none; padding: 0; margin: 0; }
          pre {
            background-color: #1e1e1e;
            color: #ffffff;
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin: 1.5rem 0;
            white-space: pre-wrap;
            word-break: break-all;
            font-family: monospace;
            font-size: 0.8rem;
          }
          pre code {
            background: none;
            color: #ffffff;
            padding: 0;
            font-size: 0.8rem;
          }
        </style>
        ${html}
      </div>
    `;
    html2pdf()
      .set({
        margin: [10, 15],
        filename: `${newName || "notatka"}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css"] },
      })
      .from(content)
      .save();
  };

  useEffect(() => {
    fetchNoteDetails();
    const handler = (e) => {
      if (
        e.key === "s" &&
        (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)
      )
        e.preventDefault();
      save();
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [id, socialId]);

  useEffect(() => {
    if (editor && content !== undefined)
      editor.commands.setContent(content, false);
  }, [editor, content]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target))
        setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (newName && name != newName.trim()) {
      if (!noteNameRegex.test(newName.trim())) {
        setRenameNoteError(true);
        setRenameNoteErrorMessage(
          "Nazwa może zawierać tylko litery, cyfry, spacje, _ i -"
        );
        return;
      }
      if (newNameTimeout.current) clearTimeout(newNameTimeout.current);
      newNameTimeout.current = setTimeout(() => {
        handleRenameNote();
      }, 1000);
    }
  }, [newName]);

  const addTag = () => {
    const value = newTag.trim().substring(0, 55);
    setNewTag("");
    setIsAddingTag(false);

    if (value && !tags.includes(value)) handleAddTag(value);
  };

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, " ");
  };

  const saveSelectionAsFront = () => {
    const text = getSelectedText();
    if (!text) return;
    setIsSidebarOpen(true);
    setFlashcards((prev) => {
      if (prev.length === 0) return [{ front: text, back: "" }];
      return prev.map((card, i) =>
        i === prev.length - 1 ? { ...card, front: text } : card
      );
    });
  };

  const saveSelectionAsBack = () => {
    const text = getSelectedText();
    if (!text) return;
    setIsSidebarOpen(true);
    setFlashcards((prev) => {
      if (prev.length === 0) return [{ front: "", back: text }];
      return prev.map((card, i) =>
        i === prev.length - 1 ? { ...card, back: text } : card
      );
    });
  };

  const isReadOnly = socialId
    ? groupRole !== "ADMIN" && groupRole !== "EDITOR"
    : false;

  return noteNotFoundError ? (
    <>
      <Text
        style={{ marginTop: "100px" }}
        as="h1"
        bold
        text={noteNotFoundMessage}
      />
      <Text
        style={{ marginTop: "20px" }}
        as="h3"
        text="Sprawdź, czy URL jest poprawny i czy plik istnieje."
      />
    </>
  ) : (
    <Layout hideBottomBar>
      <StyledContainer>
        <StyledHeader>
          {!isReadOnly && (
            <>
              {/* Desktop: przyciski widoczne bezpośrednio */}
              <DesktopButtonsWrapper>
                <FlashcardToggleButton
                  style={{ position: "static" }}
                  onClick={exportToPdf}
                >
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                    <path d="M4.603 14.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45q.226.245.435.41c.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828q.046-.282.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z" />
                  </svg>
                  Eksportuj PDF
                </FlashcardToggleButton>
                <FlashcardToggleButton
                  style={{ position: "static" }}
                  onClick={() => setIsSidebarOpen((o) => !o)}
                >
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                    <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8m0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
                  </svg>
                  Kreator fiszek
                </FlashcardToggleButton>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FlashcardToggleButton
                    style={{ position: "static" }}
                    onClick={() => setIsAIModalOpen(true)}
                  >
                    <svg fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
                    </svg>
                    Stwórz fiszki AI
                  </FlashcardToggleButton>
                  <HelpIconWrapper style={{ marginLeft: "8px" }}>
                    ?
                    <HelpTooltip>
                      <b style={{ color: theme.colors.secondary }}>
                        Stwórz fiszki AI
                      </b>{" "}
                      - kreator AI automatycznie wygeneruje propozycje fiszek z treści, która
                      jest obecnie zapisana w notatce.
                    </HelpTooltip>
                  </HelpIconWrapper>
                </div>
              </DesktopButtonsWrapper>

              {/* Mobile: przycisk 3 kropek + dropdown */}
              <div ref={mobileMenuRef}>
                <MobileMenuButton
                  onClick={() => setIsMobileMenuOpen((o) => !o)}
                  aria-label="Opcje"
                >
                  <svg
                    width="22"
                    height="22"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </MobileMenuButton>
                <MobileDropdown $open={isMobileMenuOpen}>
                  <MobileDropdownItem
                    onClick={() => {
                      exportToPdf();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <svg fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                      <path d="M4.603 14.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45q.226.245.435.41c.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828q.046-.282.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z" />
                    </svg>
                    Eksportuj PDF
                  </MobileDropdownItem>
                  <MobileDropdownItem
                    onClick={() => {
                      setIsSidebarOpen((o) => !o);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <svg fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                      <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8m0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
                    </svg>
                    Kreator fiszek
                  </MobileDropdownItem>
                  <MobileDropdownItem
                    onClick={() => {
                      setIsAIModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <svg fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
                    </svg>
                    Stwórz fiszki AI
                  </MobileDropdownItem>
                </MobileDropdown>
              </div>
            </>
          )}

          <TopControlsWrapper>
            <ReturnButton onClick={() => history.back()}>
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                />
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
          <CollapsingSection>
            {renameNoteError && (
              <RenameErrorWrapper>
                <Text
                  color="danger"
                  text={renameNoteErrorMessage}
                  style={{ textAlign: "left" }}
                />
              </RenameErrorWrapper>
            )}
            {isReadOnly ? (
              <Text
                as="h1"
                bold="true"
                text={newName}
                style={{
                  width: "65%",
                  fontSize: "3rem",
                  margin: "10px 0",
                  textAlign: "left",
                }}
              />
            ) : (
              <StyledTitleInput
                type="text"
                name="name"
                value={newName}
                $mode={renameNoteError ? "error" : ""}
                autoComplete="off"
                onChange={(e) => {
                  setRenameNoteError(false);
                  setRenameNoteErrorMessage("");
                  setNewName(stripEmoji(e.target.value));
                }}
              />
            )}

            {!socialId && (
              <TagsContainer>
                <p>TAGI: </p>
                {tags.map((tag, index) => (
                  <StyledTag key={index}>
                    {tag}
                    <div
                      onClick={() => {
                        handleRemoveTag(tag);
                      }}
                    >
                      x
                    </div>
                  </StyledTag>
                ))}

                {suggestedTags
                  .filter((t) => !tags.includes(t))
                  .map((tag, index) => (
                    <StyledTag
                      key={`suggested-${index}`}
                      $inactive
                      onClick={() => handleAddTag(tag)}
                    >
                      {tag}
                    </StyledTag>
                  ))}

                {isAddingTag && (
                  <StyledTagInput
                    autoFocus
                    maxLength={55}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTag();
                      if (e.key === "Escape") {
                        setIsAddingTag(false);
                        setNewTag("");
                      }
                    }}
                    onBlur={() => {
                      setIsAddingTag(false);
                      setNewTag("");
                    }}
                  />
                )}
                {!isAddingTag && (
                  <StyledAddTagButton onClick={() => setIsAddingTag(true)}>
                    + Dodaj
                  </StyledAddTagButton>
                )}
              </TagsContainer>
            )}
            <TagsDivider />
          </CollapsingSection>
        </StyledHeader>
        {!isReadOnly && <StickyToolbar><TextEditorFormatting editor={editor} /></StickyToolbar>}
        {errorMessage && <Text color="danger" text={errorMessage} />}
        <ContentContainer
          onClick={(e) => {
            if (!editor) return;
            if (e.target === e.currentTarget) editor.chain().focus("end").run();
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
                    className={editor.isActive("bold") ? "is-active" : ""}
                  >
                    Pogrubienie
                  </StyledFloatingButton>
                  <StyledFloatingButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "is-active" : ""}
                  >
                    Kursywa
                  </StyledFloatingButton>
                  <StyledFloatingButton
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                    className={editor.isActive("underline") ? "is-active" : ""}
                  >
                    Podkreślenie
                  </StyledFloatingButton>
                  <StyledFloatingButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive("strike") ? "is-active" : ""}
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
  );
};

export default TextEditor;
