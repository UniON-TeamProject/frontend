import React, { useState, useRef, useEffect } from "react";
import { useEditorState } from "@tiptap/react";
import styled, { useTheme } from "styled-components";
import TextSizeDropdown from "./TextSizeDropdown.jsx";
import Text from "../atoms/Text";
import Input from "../atoms/Input";
import SubmitButton from "../atoms/SubmitButton";
import { Modal } from "../atoms/Modal";

const StyledContainer = styled.div`
  margin: 20px auto;
  padding: 0;
  height: 50px;
  width: 65%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  @media (max-width: 768px) {
    width: 100%;
    margin: 10px 0 0 0;
    padding: 0 10px 8px 10px;
    flex-wrap: nowrap;
    height: auto;
    align-items: center;
  }
`;

const ScrollableButtons = styled.div`
  display: contents;
  @media (max-width: 768px) {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 5px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex: 1;
    & > * {
      flex-shrink: 0;
    }
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  margin: 0 4px;
`;

const StyledButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 2px;
  border: none;
  border-radius: 7px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "unset"};
  cursor: pointer;
  @media (hover: hover) {
    &:hover {
      background-color: ${({ $disabled, theme }) =>
        $disabled ? "unset" : theme.colors.primary};
    }
  }
  > svg {
    width: 20px;
    height: 20px;
    margin: 0 3px;
    color: ${({ $disabled, theme }) =>
      $disabled ? theme.colors.darkGrey : theme.colors.text};
  }
  &.image {
    margin-right: 15px;
    @media (max-width: 768px) {
      margin-right: 4px;
    }
    display: flex;
    flex-flow: row nowrap;
    background-color: ${({ theme }) => theme.colors.primary};
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    > svg {
      margin: auto;
      padding: 1px;
    }
    &:hover {
      background-color: ${({ theme }) => theme.colors.primary};
    }
    > p {
      padding-left: 6px;
      @media (max-width: 768px) {
        display: none;
      }
    }
  }
`;

const ImageActionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0px;
  .image {
    margin-right: 5px !important;
  }
`;

const HelpIconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textLight};
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
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.lightTertiary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  padding: 12px 14px;
  border-radius: 8px;
  width: 260px;
  z-index: 100;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  line-height: 1.4;
  @media (max-width: 768px) {
    left: 0;
    transform: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    @media (max-width: 768px) {
      left: 10px;
      transform: none;
    }
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent ${({ theme }) => theme.colors.text}
      transparent;
  }
`;



function TextEditorFormatting({ editor }) {
  const theme = useTheme();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const inputRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsImageModalOpen(false);
        setImageUrl("");
      }, 1500);
    }
  };

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isItalic: ctx.editor.isActive("italic"),
      canItalic: ctx.editor.can().chain().toggleItalic().run(),
      isUnderline: ctx.editor.isActive("underline"),
      canUnderline: ctx.editor.can().chain().toggleUnderline().run(),
      isStrike: ctx.editor.isActive("strike"),
      canStrike: ctx.editor.can().chain().toggleStrike().run(),
      isCode: ctx.editor.isActive("code"),
      canCode: ctx.editor.can().chain().toggleCode().run(),
      isLink: ctx.editor.isActive("link"),
      canLink: ctx.editor.can().chain().toggleLink().run(),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      isCodeBlock: ctx.editor.isActive("codeBlock"),
      isBlockquote: ctx.editor.isActive("blockquote"),
    }),
  });

  return (
    <StyledContainer>
      <ImageActionWrapper>
        <StyledButton
          className="image"
          onClick={() => {
            setIsImageModalOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
            <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z" />
          </svg>
          <p>Dodaj zdjęcie</p>
        </StyledButton>

        <HelpIconWrapper>
          ?
          <HelpTooltip>
            Zdjęcia możesz dodać poprzez{" "}
            <b style={{ color: theme.colors.secondary }}>URL</b> lub{" "}
            <b style={{ color: theme.colors.secondary }}>przeciągając plik</b>{" "}
            bezpośrednio w tekst.
          </HelpTooltip>
        </HelpIconWrapper>
      </ImageActionWrapper>
      <Separator />
      <TextSizeDropdown editor={editor} />
      <Separator />
      <ScrollableButtons>
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
        <Separator />
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
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          $active={editorState.isCodeBlock ? true : false}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
            <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0" />
          </svg>
        </StyledButton>
        <Separator />
        <StyledButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          $active={editorState.isBulletList ? true : false}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            />
          </svg>
        </StyledButton>
        <StyledButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          $active={editorState.isOrderedList ? true : false}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"
            />
            <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z" />
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
      </ScrollableButtons>

      {isImageModalOpen && (
        <Modal
          onClose={() => {
            if (isSuccess) return;
            setIsImageModalOpen(false);
            setImageUrl("");
          }}
        >
          <Text
            bold="true"
            as="h2"
            text="Wstaw obraz z URL"
            style={{ textAlign: "center", marginBottom: "20px" }}
          />

          <Input
            ref={inputRef}
            type="text"
            placeholder="Wklej tutaj link (np. https://example.com/image.png)"
            value={imageUrl}
            disabled={isSuccess}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (isSuccess) return;
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImage();
              }
              if (e.key === "Escape") {
                setIsImageModalOpen(false);
                setImageUrl("");
              }
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <SubmitButton
              text="Anuluj"
              color="light"
              disabled={isSuccess}
              onClick={() => {
                setIsImageModalOpen(false);
                setImageUrl("");
              }}
            />

            <SubmitButton
              text={isSuccess ? "✔ Dodano!" : "Dodaj zdjęcie"}
              color={isSuccess ? "secondary" : "dark"}
              disabled={isSuccess}
              onClick={handleAddImage}
            />
          </div>
        </Modal>
      )}
    </StyledContainer>
  );
}

export default TextEditorFormatting;
