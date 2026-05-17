import styled, { useTheme, keyframes, css } from "styled-components";
import React, { useState, useEffect, useRef } from "react";
import SubmitButton from "../components/atoms/SubmitButton";
import Text from "../components/atoms/Text";
import Input from "../components/atoms/Input";
import {
  addCard,
  deleteCard,
  editCard,
  addFlashcardSet,
  getAllFlashcardSets,
  editFlashcardSet,
  deleteFlashcardSet,
  resetFlashcardSetProgress,
  getAllDeletedFlashcardSets,
  restoreFlashcardSet,
  hardDeleteFlashcardSet,
  clearFlashcardSetsTrash,
  addFlashcardTag,
  removeFlashcardTag,
  addListOfCardsToSet,
  getFlashcardSetStats,
  getFlashcardSet,
  getAllUsersCards,
  getCardsByTags,
  getSocialGroup,
} from "../api";
import { getToken } from "../token";
import Flashcard from "../components/organisms/Flashcard";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../components/organisms/Layout";
import FlashcardEditor from "../components/editor/FlashcardEditor";
import TagSelector from "../components/organisms/TagSelector";

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\u00a0/g, " ").trim();
};

const StyledContainer = styled.div`
  width: 100%;
  padding: 20px 40px;
  position: relative;
  background-color: transparent;
  box-sizing: border-box;
  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 0.2s ease;
  min-height: calc(100vh - 70px);
  @media (max-width: 768px) {
    padding: 12px 12px;
    min-height: calc(100dvh - 70px);
  }
`;

const StyledUserHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  min-height: 60px;
  gap: 12px;
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-bottom: 10px;
    min-height: 90px;
    gap: 8px;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const StyledSearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.lightGrey};
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 8px 16px;
  gap: 8px;
  transition: all 0.2s;

  border-color: ${({ theme }) => theme.colors.secondary};

  &:focus-within {
    background-color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  > input {
    border: none;
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    width: 200px;
    min-width: 0;

    &::placeholder {
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }

  > svg {
    color: ${({ theme }) => theme.colors.textMuted};
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    gap: 6px;
    width: 100%;

    > input {
      font-size: 16px;
      width: 100%;
    }
  }
`;

const StyledSearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 360px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 200;
  max-height: 420px;
  overflow-y: auto;
  padding: 6px 0;
`;

const StyledSearchSectionTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 8px 14px 4px;
`;

const StyledSearchResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
  }

  > svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const StyledSearchResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledSearchResultName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledSearchResultPath = styled.span`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledSearchEmpty = styled.div`
  padding: 16px 14px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`;

const StyledSearchDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.lightGrey};
  margin: 4px 0;
`;

const StyledName = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: 2.5rem;
  margin: 0;
  cursor: default;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SetNameHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-bottom: 14px;
  }
`;

const BackButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.darkGrey};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  > svg {
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;

    > svg {
      margin-right: 4px;
    }
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  padding: 20px 0 120px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, 350px);
  gap: 30px;
  justify-content: center;

  @media (max-width: 768px) {
    grid-template-columns: ${({ $setsView }) => $setsView ? "repeat(auto-fill, minmax(140px, 1fr))" : "1fr"};
    gap: 10px;
    padding: 10px 0 100px 0;
  }
`;

const StartLearningButton = styled.button`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 1200px) {
    padding: 8px 15px;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
  > svg {
    @media (max-width: 768px) {
      margin-left: 4px !important;
    }
  }
`;

const SetItemWrapper = styled.div`
  width: 100%;
  max-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 15px;
  position: relative;
  cursor: pointer;
  z-index: ${({ $isActive }) => ($isActive ? 50 : 1)};

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 8px 4px;
  }
`;

const SetIconContainer = styled.div`
  position: relative;
  width: 140px;
  height: 100px;
  margin: 0 auto 10px auto;
  color: ${({ theme }) => theme.colors.black};

  @media (max-width: 768px) {
    width: 72px;
    height: 52px;
    margin-bottom: 4px;
  }
`;

const StyledItemHeaderWrapper = styled.div`
  text-align: center;
  word-wrap: break-word;
  word-break: break-word;
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    h4 {
      font-size: 0.78rem !important;
      margin-bottom: 2px !important;
    }
    span,
    p {
      font-size: 0.7rem !important;
    }
  }
`;

const StyledItemHeader = styled.span`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.darkGrey};
  }

  @media (max-width: 768px) {
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const StyledItemOptions = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 10px;
  z-index: 20;
  width: ${({ $narrow }) => ($narrow ? "160px" : "260px")};
  text-align: left;
  cursor: default;
  max-height: 300px;
  overflow-y: auto;

  ${({ $centerBelow }) =>
    $centerBelow
      ? `
        position:fixed;
        top:auto;
        left:50%;
        transform:translateX(-50%);
        margin-top:8px;
        max-width:calc(100vw - 20px);
    `
      : `
        position:absolute;
    `}
  ${({ $flipLeft, $centerBelow }) =>
    !$centerBelow &&
    ($flipLeft
      ? "right:100%; margin-right:10px;"
      : "left:100%; margin-left:10px;")}

  max-height: 350px;
  overflow-y: auto;

  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    right: auto;
    bottom: auto;
    margin: 0;
    width: calc(100vw - 80px);
    max-width: 300px;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.darkGrey};
    border-radius: 10px;
  }

  > input {
    padding: 8px 12px;
    margin: 0 10px 15px 10px;
    width: calc(100% - 20px);
    box-sizing: border-box;
    border-radius: 8px;
    border: 1px solid transparent;
    font-weight: 700;
    font-family: inherit;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.lightGrey};
    outline: none;
    transition: border-color 0.2s;

    @media (max-width: 768px) {
      font-size: 16px;
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const StyledToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGrey};
  padding-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
  min-height: 48px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 10px;
    gap: 8px;
    min-height: 45px;
  }
`;

const StyledTagInput = styled.input`
  padding: 4px 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 90px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  background-color: ${({ theme }) => theme.colors.secondary};
  @media (max-width: 768px) {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const StyledAddTagButton = styled.div`
  padding: 4px 12px;
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  white-space: nowrap;
  display: inline-flex;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.text};
  }
`;

const scaleIn = keyframes`from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}`;

const TagSearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TagMultiselectInput = styled.div`
  width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid
    ${({ $open, theme }) =>
      $open ? theme.colors.secondary : theme.colors.darkGrey};
  background: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-family: inherit;
  cursor: text;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  transition: border-color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const TagMultiselectArrow = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

const TagChipsScroll = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  flex-shrink: 1;
  min-width: 0;
  flex-direction: row-reverse;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TagSelectedChip = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px 2px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
`;

const TagSelectedChipRemove = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
`;

const TagMultiselectTextInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  min-width: 60px;
  padding: 2px 0;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const TagSearchDropdown = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 50;
  padding: 10px;
  max-height: 120px;
  overflow-y: auto;
  animation: ${scaleIn} 0.15s ease;
`;

const TagDropdownSection = styled.div`
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const TagDropdownSectionLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 5px;
`;

const TagDropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  transition: background 0.1s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const TagDropdownCheck = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid
    ${({ $checked, theme }) =>
      $checked ? theme.colors.secondary : theme.colors.darkGrey};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.secondary : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.white};
  flex-shrink: 0;
  transition: all 0.15s;
`;

const StyledItemOption = styled.button`
  padding: 10px 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;

  &.danger {
    color: ${({ theme }) => theme.colors.danger};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const DropdownSectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  margin-top: 5px;
`;

const TagsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const StyledTag = styled.div`
  padding: 2px 10px;
  margin: 3px;
  background-color: ${({ theme, $inactive }) =>
    $inactive ? theme.colors.darkGrey : theme.colors.secondary};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  font-size: 0.8rem;
  display: flex;
  flex-flow: row nowrap;
  cursor: default;

  > div {
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    margin: 0 0 0 6px;
    padding: 0;
    position: relative;
    bottom: 1px;
  }
`;

const CardsFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 100px auto;
`;

const CardInputRow = styled.div`
  display: flex;
  gap: 30px;
  width: 100%;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const CardInputSide = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SideLabel = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const StyledCardTextarea = styled.textarea`
  width: 100%;
  height: 220px;
  border-radius: 15px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  padding: 30px;
  font-size: 16px;
  resize: none;
  outline: none;
  font-family: inherit;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.darkGrey};
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }
`;

const AddMoreRowButton = styled.button`
  background: transparent;
  border: 2px dashed ${({ theme }) => theme.colors.darkGrey};
  border-radius: 10px;
  padding: 15px 40px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, disabled }) =>
      disabled ? "transparent" : theme.colors.lightGrey};
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 70px;
  height: 70px;
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 100;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    bottom: 80px;
    right: 16px;
    width: 54px;
    height: 54px;
    border-radius: 16px;
  }

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.secondary};

    @media (max-width: 768px) {
      width: 24px;
      height: 24px;
    }
  }
`;

const FabMenu = styled.div`
  position: fixed;
  bottom: 124px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  @media (max-width: 768px) {
    bottom: 164px;
    right: 20px;
  }
`;

const FabMenuItem = styled.button`
  background: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: box-shadow 0.15s, background 0.15s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  min-height: 250px;
  padding: 50px;
  border-radius: 25px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;

  @media (max-width: 768px) {
    width: 92%;
    padding: 24px 20px;
    min-height: unset;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
`;

const EmptyStateContainer = styled.div`
  grid-column: 1 / -1;
  width: 100%;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.5;
`;

const StyledModalTextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  margin: 10px 0 20px 0;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 5px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  background-color: ${({ theme }) => theme.colors.lightGrey};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SetHeaderControls = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;

  @media (max-width: 1125px) {
    flex-direction: column;
    align-items: center;
    gap: 18px;

    & > div:first-child {
      order: 2;
      justify-content: center;
      width: 100%;
    }
    & > div:last-child {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    & > div:last-child {
      margin-left: 0;
      justify-content: center;
      width: 100%;
    }
  }
`;

const ActionBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.lightGrey};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px 25px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.darkGrey};
    color: ${({ theme }) => theme.colors.white};
  }

  @media (max-width: 1200px) {
    padding: 8px 15px;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 0.85rem;

    .hide-mobile {
      display: none;
    }
  }
`;

const StyledTabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const TabLabel = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledTab = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.textLight};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    gap: 4px;
    display: ${({ $active }) => ($active ? "none" : "flex")};

    > svg {
      width: 22px;
      height: 22px;
    }
  }

  > svg {
    width: 16px;
    height: 16px;
  }
`;

const SortSelectContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SortSelect = styled.select`
  appearance: none;
  padding: 8px 32px 8px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  background-color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  outline: none;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }

  @media (max-width: 768px) {
    padding: 6px 24px 6px 10px;
    font-size: 0.78rem;
  }
`;

const SortIconWrapper = styled.div`
  position: absolute;
  right: 12px;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
`;

const ModalButton = styled.button`
  background-color: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.borderLight};
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.white : theme.colors.text};
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 7px 10px;
    font-size: 0.8rem;
    border-radius: 8px;
  }
`;

const SelectionBar = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  padding: 14px 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 350px;

  @media (max-width: 768px) {
    bottom: 80px;
    padding: 10px 14px;
    border-radius: 14px;
    width: calc(100vw - 32px);
  }
`;

const SelectionBarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
`;

const SelectionBarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
    white-space: nowrap;
    flex-wrap: nowrap;
  }
`;

const SelectionBarCount = styled.span`
  font-weight: 600;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ModalButtonPrimary = styled(ModalButton)`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
`;

const ModalButtonGhost = styled(ModalButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.darkGrey};
  padding: 12px 10px;

  @media (max-width: 768px) {
    padding: 7px 6px;
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.8 : 1)};
  transition: all 0.2s;

  &.primary {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.secondary};
  }

  &.outline {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.textLight};
    border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 0.78rem;
    gap: 4px;
  }
`;

const FilterContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 15px;
  z-index: 100;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: default;

  box-sizing: border-box;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.darkGrey};
    border-radius: 10px;
  }
  @media (max-width: 768px) {
    position: fixed;
    top: ${({ $filterDropdownY }) => $filterDropdownY}px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100vw - 80px);
    max-width: 300px;
  }
`;

const FilterTag = styled.div`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.lightGrey};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.textLight};
  transition: all 0.2s;

  max-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.secondary : theme.colors.borderLight};
    opacity: ${({ $active }) => ($active ? 0.8 : 1)};
  }
`;

const ActiveFilterBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-left: 6px;
`;

const HelpIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 10px;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colors.darkGrey};
    color: ${({ theme }) => theme.colors.text};
    transform: scale(1.1);
  }
  &:hover > span {
    display: block;
  }
`;

const HelpTooltip = styled.span`
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: ${({ theme }) => theme.colors.veryDarkPrimary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 11px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
  padding: 10px 14px;
  width: 200px;
  white-space: normal;
  line-height: 1.5;
  z-index: 100;
  pointer-events: none;
  text-align: left;
  transform: scale(0.909);
  transform-origin: bottom right;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    right: 8px;
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
`;

const ModeCard = styled.div`
  background: ${({ theme }) => theme.colors.lightGrey};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  text-align: left;

  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const highlightPulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(46, 204, 113, 0.6); border-color: transparent; }
  50% { box-shadow: 0 0 0 15px rgba(46, 204, 113, 0); border-color: #2ecc71; }
  100% { box-shadow: 0 0 0 0px rgba(46, 204, 113, 0); border-color: transparent; }
`;

const HighlightWrapper = styled.div`
  position: relative;
  display: flex;

  ${({ $isHighlighted }) =>
    $isHighlighted &&
    css`
      z-index: 100;

      &::after {
        content: "";
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border-radius: 15px;
        border: 3px solid #2ecc71;
        animation: ${highlightPulse} 2s ease-out 2;
        pointer-events: none;
      }
    `}
`;

const StackedCardsIcon = () => (
  <svg
    viewBox="0 0 140 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <rect
      x="15"
      y="10"
      width="115"
      height="75"
      rx="5"
      transform="rotate(-4 15 10)"
      fill="white"
      stroke="black"
      strokeWidth="2"
    />
    <circle
      cx="22"
      cy="18"
      r="3"
      fill="white"
      stroke="black"
      strokeWidth="1.5"
      transform="rotate(-4 15 10)"
    />
    <rect
      x="5"
      y="20"
      width="115"
      height="75"
      rx="5"
      fill="white"
      stroke="black"
      strokeWidth="2.5"
    />
    <circle
      cx="15"
      cy="32"
      r="3"
      fill="white"
      stroke="black"
      strokeWidth="1.5"
    />
  </svg>
);

const PlusIcon = () => (
  <svg fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="36"
    height="36"
    stroke="currentColor"
    strokeWidth="3"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const EllipsisIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
);

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setId } = useParams();
  const theme = useTheme();
  const [highlightedCardId, setHighlightedCardId] = useState(null);

  const socialId = new URLSearchParams(location.search).get("socialId");

  const isTrashView = location.pathname.includes("trash");

  const [activeSetId, setActiveSetId] = useState(null);

  const [editingName, setEditingName] = useState("");
  const [isAddingItemTag, setIsAddingItemTag] = useState(false);
  const [newItemTag, setNewItemTag] = useState("");

  const [sets, setSets] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [editingSetId, setEditingSetId] = useState(null);
  const [setName, setSetName] = useState("");
  const [suggestedTagsForSet, setSuggestedTagsForSet] = useState([]);
  const [chosenTagsForSet, setChosenTagsForSet] = useState([]);
  const [isAddingTagForSet, setIsAddingTagForSet] = useState(false);
  const [newTagForSet, setNewTagForSet] = useState("");

  const [isCardEditModalOpen, setIsCardEditModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const [isLearningMenuOpen, setIsLearningMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [flipLeft, setFlipLeft] = useState(false);
  const [centerBelow, setCenterBelow] = useState(false);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newCards, setNewCards] = useState([{ question: "", answer: "" }]);
  const hasEmptyCard = newCards.some(
    (card) => card.question.trim() === "" && card.answer.trim() === ""
  );

  // stany dla menu dodawania fiszkek
  const [isAddModeMenuOpen, setIsAddModeMenuOpen] = useState(false);
  const [isAddByTagMode, setIsAddByTagMode] = useState(false);
  const [selectedCardsForAdding, setSelectedCardsForAdding] = useState(
    new Set()
  );
  const [selectedSearchTags, setSelectedSearchTags] = useState([]);
  const [searchTagText, setSearchTagText] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagSearchRef = useRef(null);
  const tagSearchInputRef = useRef(null);
  const [foundCards, setFoundCards] = useState([]);
  const [allUserCards, setAllUserCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSearchedCards, setHasSearchedCards] = useState(false);

  const [setSortOption, setSetSortOption] = useState(() => {
    return localStorage.getItem("flashcardSetsSortOption") || "oldest";
  });

  const [cardSortOption, setCardSortOption] = useState(() => {
    return localStorage.getItem("flashcardsSortOption") || "oldest";
  });

  //zapisywanie w localstorage ostatniego wyboru sortowania
  useEffect(() => {
    localStorage.setItem("flashcardSetsSortOption", setSortOption);
  }, [setSortOption]);
  useEffect(() => {
    localStorage.setItem("flashcardsSortOption", cardSortOption);
  }, [cardSortOption]);

  const [isExitAddModeModalOpen, setIsExitAddModeModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState({
    sets: [],
    cards: [],
  });
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [setToDelete, setSetToDelete] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);

  const [isConfirmingTrashClear, setIsConfirmingTrashClear] = useState(false);

  const [selectedTagsFilter, setSelectedTagsFilter] = useState([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filterDropdownY, setFilterDropdownY] = useState(0);

  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // stany dla dodawania tagów do zaznaczonych fiszek
  const [isBulkTagsModalOpen, setIsBulkTagsModalOpen] = useState(false);
  const [suggestedBulkTags, setSuggestedBulkTags] = useState([]);
  const [chosenBulkTags, setChosenBulkTags] = useState([]);
  const [isAddingBulkTag, setIsAddingBulkTag] = useState(false);
  const [newBulkTag, setNewBulkTag] = useState("");

  // stany dla przenoszenia fiszek
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkMoveTargetSetId, setBulkMoveTargetSetId] = useState("");

  const [isLearningInfoModalOpen, setIsLearningInfoModalOpen] = useState(false);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // stany dla kopiowania
  const [isBulkCopyModalOpen, setIsBulkCopyModalOpen] = useState(false);
  const [bulkTargetSetId, setBulkTargetSetId] = useState("");
  const [bulkNewSetName, setBulkNewSetName] = useState("");
  const [bulkApplyTags, setBulkApplyTags] = useState(false);

  const [groupRole, setGroupRole] = useState(null);

  const [cardValidationErrors, setCardValidationErrors] = useState([]);
  const [isPartialEmptyModalOpen, setIsPartialEmptyModalOpen] = useState(false);
  const [pendingValidCards, setPendingValidCards] = useState([]);
  const [pendingIgnoreDuplicates, setPendingIgnoreDuplicates] = useState(false);

  const fetchData = async () => {
    setIsReady(false);
    setErrorMessage("");

    const setsRes = isTrashView
      ? await getAllDeletedFlashcardSets()
      : await getAllFlashcardSets();

    let safeSets = [];
    if (!setsRes.errorCode) {
      safeSets = Array.isArray(setsRes.sets)
        ? [...setsRes.sets]
        : Array.isArray(setsRes)
        ? [...setsRes]
        : [];
    } else {
      if (setsRes.errorCode === "TOKEN_UNDEFINED") {
        navigate("/", { replace: true });
        return;
      } else setErrorMessage(setsRes.message);
    }

    if (setId && !isTrashView) {
      const parsedId = parseInt(setId);
      let targetSet = safeSets.find((s) => s.id === parsedId);

      if (!targetSet) {
        const sId = new URLSearchParams(location.search).get("socialId");
        if (sId) {
          const singleRes = await getFlashcardSet(parsedId, sId);

          if (!singleRes.errorCode && singleRes.id) {
            safeSets = [...safeSets, singleRes];
            targetSet = singleRes;

            const groupRes = await getSocialGroup(sId);
            if (!groupRes.errorCode) {
              setGroupRole(groupRes.userRole);
            }
          } else {
            setErrorMessage(
              singleRes.message || "Brak dostępu do zestawu grupowego."
            );
          }
        }
      } else {
        setGroupRole(null);
      }

      if (targetSet) {
        setActiveSetId(targetSet.id);
      } else {
        setActiveSetId(null);
      }
    } else {
      setActiveSetId(null);
      setIsLearningMenuOpen(false);
      setIsAddingMode(false);
    }

    setSets(safeSets);
    setIsReady(true);
  };

  useEffect(() => {
    if (!getToken()) {
      navigate("/", { replace: true });
      return;
    }
    fetchData();
  }, [isTrashView, setId, location.search]);

  // Załaduj wszystkie fiszki gdy otwieramy tryb AddByTagMode
  useEffect(() => {
    const loadAllCards = async () => {
      if (isAddByTagMode && activeSetId) {
        const set = sets.find((s) => s.id === activeSetId);
        if (set) {
          setIsLoadingCards(true);
          const allCards = await getAllUsersCards();
          if (!allCards.errorCode) {
            const cardsNotInSet = allCards.cards.filter(
              (card) => !set.cards.some((c) => c.id === card.id)
            );
            setAllUserCards(cardsNotInSet);
            setFoundCards(cardsNotInSet);
            setHasSearchedCards(true);
          }
          setIsLoadingCards(false);
        }
      }
    };
    loadAllCards();
  }, [isAddByTagMode, activeSetId, sets]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagSearchRef.current && !tagSearchRef.current.contains(e.target)) {
        setShowTagDropdown(false);
      }
    };
    if (showTagDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTagDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isAddModeMenuOpen &&
        !e.target.closest("[data-add-mode-menu]") &&
        !e.target.closest("[data-fab-button]")
      ) {
        setIsAddModeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddModeMenuOpen]);

  const currentSet = sets.find((s) => s.id === activeSetId);

  const isReadOnly = socialId
    ? groupRole !== "ADMIN" && groupRole !== "EDITOR"
    : false;

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setGlobalSearchResults({ sets: [], cards: [] });
      return;
    }

    setIsSearchLoading(true);
    const timer = setTimeout(() => {
      const lower = q.toLowerCase();

      let matchedSets = [];
      let matchedCards = [];

      sets.forEach((set) => {
        if (set.name.toLowerCase().includes(lower)) {
          matchedSets.push(set);
        }

        if (set.cards && Array.isArray(set.cards)) {
          set.cards.forEach((card) => {
            const textFront = stripHtml(
              card.contentFirstSide || card.question || ""
            ).toLowerCase();

            const textBack = stripHtml(
              card.contentFlipSide || card.answer || ""
            ).toLowerCase();

            if (textFront.includes(lower) || textBack.includes(lower)) {
              matchedCards.push({
                ...card,
                setName: set.name,
                setId: set.id,
              });
            }
          });
        }
      });

      setGlobalSearchResults({ sets: matchedSets, cards: matchedCards });
      setIsSearchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, sets]);

  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(null); //fast lub fsrs

  useEffect(() => {
    if (!getToken()) {
      navigate("/", { replace: true });
      return;
    }
    fetchData();
  }, [isTrashView]);

  useEffect(() => {
    if (setId && sets.length > 0 && !isTrashView) {
      const setToOpen = sets.find((set) => set.id === parseInt(setId));
      if (setToOpen) {
        setActiveSetId(setToOpen.id);
      }
    } else if (!setId) {
      setActiveSetId(null);
      setIsLearningMenuOpen(false);
      setIsAddingMode(false);
    }
  }, [setId, sets, isTrashView]);

  const getSortedSets = () => {
    let sorted = [...sets];

    //LOGIKA FILTROWANIA PO TAGACH (zakładamy że zestaw musi mieć WSZYSTKIE wybrane tagi)
    if (selectedTagsFilter.length > 0) {
      sorted = sorted.filter((set) =>
        selectedTagsFilter.every((tag) => set.tags?.includes(tag))
      );
    }

    //LOGIKA SORTOWANIA
    if (setSortOption === "oldest") {
      sorted.sort((a, b) => a.id - b.id);
    } else if (setSortOption === "newest") {
      sorted.sort((a, b) => b.id - a.id);
    } else if (setSortOption === "alphabetical") {
      sorted.sort((a, b) => {
        const textA = (a.name || "").toLowerCase();
        const textB = (b.name || "").toLowerCase();
        return textA.localeCompare(textB);
      });
    }
    return sorted;
  };

  const getSortedCards = () => {
    if (!currentSet || !currentSet.cards) return [];
    const sorted = [...currentSet.cards];

    if (cardSortOption === "oldest") {
      sorted.sort((a, b) => a.id - b.id);
    } else if (cardSortOption === "newest") {
      sorted.sort((a, b) => b.id - a.id);
    } else if (cardSortOption === "alphabetical") {
      const stripHtml = (html) =>
        html
          .replace(/<[^>]*>/g, "")
          .trim()
          .toLowerCase();
      sorted.sort((a, b) => {
        const textA = stripHtml(a.contentFirstSide || a.question || "");
        const textB = stripHtml(b.contentFirstSide || b.question || "");
        return textA.localeCompare(textB, "pl");
      });
    }
    return sorted;
  };

  const sortedSets = getSortedSets();
  const sortedCards = getSortedCards();

  useEffect(() => {
    const targetId = location.state?.highlightCardId;

    if (targetId && sortedCards.some((c) => c.id === targetId)) {
      setHighlightedCardId(targetId);

      const scrollToElement = () => {
        const element = document.getElementById(`flashcard-item-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };

      const scrollTimer = setTimeout(scrollToElement, 150);

      const clearTimer = setTimeout(() => {
        setHighlightedCardId(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 4000);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [location.state?.highlightCardId, sortedCards.length, location.pathname]);

  // DODAWANIE FISZEK
  const updateNewCard = (index, field, value) => {
    const updated = [...newCards];
    updated[index][field] = value;
    setNewCards(updated);

    if (cardValidationErrors.length > 0) {
      const newErrors = [...cardValidationErrors];
      if (newErrors[index]) {
        newErrors[index][field === "question" ? "qError" : "aError"] = false;
      }
      setCardValidationErrors(newErrors);
    }
  };

  const handleSaveNewCards = async (
    ignoreDuplicates = false,
    skipEmptyWarning = false
  ) => {
    setErrorMessage("");
    setCardValidationErrors([]);

    let errors = new Array(newCards.length).fill({
      qError: false,
      aError: false,
    });
    let hasAnyErrors = false;
    let validCards = [];

    for (let i = 0; i < newCards.length; i++) {
      const card = newCards[i];
      const isQEmpty = stripHtml(card.question).length === 0;
      const isAEmpty = stripHtml(card.answer).length === 0;

      if (!isQEmpty && !isAEmpty) {
        validCards.push(card);
        errors[i] = { qError: false, aError: false };
      } else {
        if (newCards.length === 1 && isQEmpty && isAEmpty) {
          setErrorMessage(
            "Nie dodano żadnej fiszki (pola nie mogą być puste)."
          );
          return;
        }
        errors[i] = { qError: isQEmpty, aError: isAEmpty };
        hasAnyErrors = true;
      }
    }

    // jeśli wszystko jest puste
    if (validCards.length === 0) {
      setCardValidationErrors(errors);
      setErrorMessage(
        "Brak prawidłowych fiszek. Uzupełnij brakujące pytania i odpowiedzi."
      );
      return;
    }

    // jeśli są jakieś błędy
    if (hasAnyErrors && !skipEmptyWarning) {
      setCardValidationErrors(errors);
      setPendingValidCards(validCards);
      setPendingIgnoreDuplicates(ignoreDuplicates);
      setIsPartialEmptyModalOpen(true);
      return;
    }

    // jak wszystko jest super albo użytkownik zaakceptował ostrzeżenie
    await executeSaveCards(validCards, ignoreDuplicates);
  };

  const executeSaveCards = async (cardsToSave, ignoreDuplicates) => {
    if (!ignoreDuplicates) {
      let duplicates = [];
      for (const newCard of cardsToSave) {
        const plainNewQuestion = stripHtml(newCard.question).toLowerCase();
        sets.forEach((set) => {
          if (set.cards && Array.isArray(set.cards)) {
            set.cards.forEach((existingCard) => {
              const plainExistingQuestion = stripHtml(
                existingCard.contentFirstSide || existingCard.question || ""
              ).toLowerCase();

              if (plainNewQuestion === plainExistingQuestion) {
                duplicates.push({
                  question: stripHtml(newCard.question),
                  setName: set.name,
                });
              }
            });
          }
        });
      }

      if (duplicates.length > 0) {
        setDuplicateWarning(duplicates);
        setPendingValidCards(cardsToSave);
        return;
      }
    }

    let addedCount = 0;
    const inheritedTags = currentSet?.tags ? [...currentSet.tags] : [];

    for (const card of cardsToSave) {
      const res = await addCard(
        card.question,
        card.answer,
        parseInt(activeSetId),
        inheritedTags
      );
      if (res.errorCode === "TOKEN_UNDEFINED") {
        navigate("/", { replace: true });
        return;
      }
      if (!res.errorCode) addedCount++;
    }

    if (addedCount > 0) {
      setSuccessMessage("Zapisano!");
      setDuplicateWarning(null);

      setTimeout(() => {
        fetchData();
        setIsAddingMode(false);
        setNewCards([{ question: "", answer: "" }]);
        setCardValidationErrors([]);
        setSuccessMessage("");
      }, 1000);
    }
  };

  // EDYCJA POJEDYNCZEJ FISZKI
  const openEditCardModal = (card) => {
    setEditingCardId(card.id);
    setEditQuestion(card.question || card.contentFirstSide);
    setEditAnswer(card.answer || card.contentFlipSide);
    setErrorMessage("");
    setSuccessMessage("");
    setIsCardEditModalOpen(true);
  };

  const handleEditSingleCard = async (e) => {
    e.preventDefault();
    if (!stripHtml(editQuestion) || !stripHtml(editAnswer)) {
      setErrorMessage("Pytanie i odpowiedź są wymagane!");
      return;
    }

    const currentCardData = currentSet.cards.find(
      (c) => c.id === editingCardId
    );
    const existingTags = currentCardData ? currentCardData.cardTags || [] : [];

    const res = await editCard(
      editingCardId,
      editQuestion,
      editAnswer,
      parseInt(activeSetId),
      existingTags
    );
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") {
        navigate("/", { replace: true });
        return;
      }
      setErrorMessage(res.message);
    } else {
      setSuccessMessage("Zapisano!");
      setTimeout(() => {
        fetchData();
        setIsCardEditModalOpen(false);
        setSuccessMessage("");
      }, 1000);
    }
  };

  const confirmDeleteCard = (id) => {
    setCardToDelete(id);
  };

  const executeDeleteCard = async () => {
    if (!cardToDelete) return;

    const res = await deleteCard(cardToDelete);
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") {
        navigate("/", { replace: true });
        return;
      }
      setErrorMessage(res.message);
    } else {
      fetchData();
    }
    setCardToDelete(null);
  };

  const handleInlineCardTagAdd = async (card, tagToAdd) => {
    if (card.cardTags?.includes(tagToAdd)) return;

    const res = await addFlashcardTag(card.id, tagToAdd);
    if (!res.errorCode) {
      fetchData();
    } else {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setErrorMessage(res.message);
    }
  };

  const handleInlineCardTagRemove = async (card, tagToRemove) => {
    const res = await removeFlashcardTag(card.id, tagToRemove);
    if (!res.errorCode) {
      fetchData();
    } else {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setErrorMessage(res.message);
    }
  };

  const handleRenameSetInline = async (set, newName) => {
    if (!newName.trim() || newName === set.name) return;
    const res = await editFlashcardSet(
      set.id,
      newName,
      set.tags || [],
      socialId
    );
    if (!res.errorCode) fetchData();
    else setErrorMessage(res.message);
  };

  const handleInlineSetTagAdd = async (set, tagToAdd) => {
    if (set.tags?.includes(tagToAdd)) return;
    const updatedTags = [...(set.tags || []), tagToAdd];
    const res = await editFlashcardSet(set.id, set.name, updatedTags, socialId);
    if (!res.errorCode) fetchData();
  };

  const handleInlineSetTagRemove = async (set, tagToRemove) => {
    const updatedTags = (set.tags || []).filter((t) => t !== tagToRemove);
    const res = await editFlashcardSet(set.id, set.name, updatedTags, socialId);
    if (!res.errorCode) fetchData();
  };

  const openAddSetModal = () => {
    setEditingSetId(null);
    setSetName("");
    setSuggestedTagsForSet([]);
    setChosenTagsForSet([]);
    setIsAddingTagForSet(false);
    setNewTagForSet("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsSetModalOpen(true);
  };

  const openEditSetModal = (set) => {
    setEditingSetId(set.id);
    setSetName(set.name);
    const existingTags = set.tags && set.tags.length > 0 ? set.tags : [];
    setSuggestedTagsForSet([]);
    setChosenTagsForSet(existingTags);
    setIsAddingTagForSet(false);
    setNewTagForSet("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsSetModalOpen(true);
  };

  const confirmDeleteSet = (id) => {
    setSetToDelete(id);
    setActiveMenuId(null);
  };

  const executeDeleteSet = async () => {
    if (!setToDelete) return;

    const res = isTrashView
      ? await hardDeleteFlashcardSet(setToDelete)
      : await deleteFlashcardSet(setToDelete, socialId);

    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") {
        navigate("/", { replace: true });
        return;
      }
      setErrorMessage(res.message);
    } else {
      fetchData();
    }
    setSetToDelete(null);
  };

  const handleRestoreSet = async (id) => {
    setErrorMessage("");
    const res = await restoreFlashcardSet(id);
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setErrorMessage(res.message);
    } else {
      fetchData();
    }
  };

  const handleClearTrash = async () => {
    setErrorMessage("");

    const safeSetsForTrash = Array.isArray(sets) ? sets : [];
    const idsToDelete = safeSetsForTrash.map((s) => s.id);

    if (idsToDelete.length === 0) {
      setIsConfirmingTrashClear(false);
      return;
    }

    const res = await clearFlashcardSetsTrash(idsToDelete);

    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setErrorMessage(res.message);
    } else {
      setIsConfirmingTrashClear(false);
      fetchData();
    }
  };

  const handleSaveNewSet = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!setName.trim()) {
      setErrorMessage("Nazwa zestawu jest wymagana!");
      return;
    }

    let res;
    if (editingSetId) {
      res = await editFlashcardSet(
        editingSetId,
        setName,
        chosenTagsForSet,
        socialId
      );
    } else {
      res = await addFlashcardSet(setName, chosenTagsForSet, socialId);
    }

    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setErrorMessage(res.message);
    } else {
      setSuccessMessage("Zapisano!");
      setTimeout(() => {
        fetchData();
        setIsSetModalOpen(false);
        setSuccessMessage("");
      }, 1000);
    }
  };

  const handleStartNewFastLearning = (id) => {
    setErrorMessage("");
    navigate(`/learning/fast/${id}`);
  };

  const allAvailableTags = [
    ...new Set(sets.flatMap((set) => set.tags || [])),
  ].sort();

  const getCardsCountWord = (count) => {
    if (count === 1) return "fiszka";
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (
      lastDigit >= 2 &&
      lastDigit <= 4 &&
      (lastTwoDigits < 12 || lastTwoDigits > 14)
    ) {
      return "fiszki";
    }
    return "fiszek";
  };

  const toggleCardSelection = (card) => {
    setSelectedCards((prev) => {
      const isAlreadySelected = prev.some((c) => c.id === card.id);
      if (isAlreadySelected) return prev.filter((c) => c.id !== card.id);
      return [...prev, card];
    });
  };

  const handleBulkDeleteClick = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const executeBulkDelete = async () => {
    setIsDeletingBulk(true);
    await Promise.all(selectedCards.map((c) => deleteCard(c.id)));

    setIsDeletingBulk(false);
    setIsBulkDeleteModalOpen(false);
    setIsSelectMode(false);
    setSelectedCards([]);
    fetchData();
    setSuccessMessage("Usunięto!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleBulkCopy = async () => {
    setErrorMessage("");
    let targetId = bulkTargetSetId;
    let targetTags = [];

    if (!targetId) {
      setErrorMessage("Wybierz zestaw docelowy");
      return;
    }

    if (targetId === "NEW") {
      if (!bulkNewSetName.trim()) {
        setErrorMessage("Podaj nazwę nowego zestawu");
        return;
      }
      const res = await addFlashcardSet(bulkNewSetName.trim(), [], socialId);
      if (res.errorCode) {
        setErrorMessage(res.message);
        return;
      }
      targetId = res.id;
    } else if (bulkApplyTags) {
      const targetSet = sets.find((s) => s.id === parseInt(targetId));
      if (targetSet && targetSet.tags) targetTags = targetSet.tags;
    }

    let copyError = null;
    for (const card of selectedCards) {
      const finalTags = bulkApplyTags
        ? [...new Set([...(card.cardTags || []), ...targetTags])]
        : card.cardTags || [];
      const res = await addCard(
        card.contentFirstSide || card.question,
        card.contentFlipSide || card.answer,
        parseInt(targetId),
        finalTags,
        false
      );
      if (res.errorCode) {
        copyError = res.message;
        break;
      }
    }

    if (copyError) {
      setErrorMessage(copyError);
    } else {
      setIsBulkCopyModalOpen(false);
      setIsSelectMode(false);
      setSelectedCards([]);
      fetchData();
      setSuccessMessage("Skopiowano pomyślnie!");
      setTimeout(() => setSuccessMessage(""), 2000);
    }
  };

  const handleModeSelection = async (mode) => {
    setIsLearningMenuOpen(false);
    setPendingMode(mode);

    // sprawdzamy po statystykach czy sesja nauki trwa
    const res = await getFlashcardSetStats(currentSet.id);

    // jesli uzytkownik juz cos umie czyli learnedCards > 0, pytamy o reset
    if (!res.errorCode && res.stats > 0) {
      setIsResetConfirmModalOpen(true);
    } else {
      // jesli nie, po prostu wchodzimy do nauki
      goToLearning(mode);
    }
  };

  const goToLearning = (mode) => {
    if (mode === "fast") {
      navigate(`/learning/fast/${currentSet.id}`);
    } else {
      navigate(`/learning/fsrs/${currentSet.id}`);
    }
  };

  const handleResetAndStart = async () => {
    const res = await resetFlashcardSetProgress(currentSet.id);
    if (!res.errorCode) {
      setIsResetConfirmModalOpen(false);
      goToLearning(pendingMode);
    } else {
      setErrorMessage("Nie udało się zresetować zestawu.");
    }
  };

  return (
    <Layout>
      <StyledContainer
        $ready={isReady}
        onClick={() => {
          setActiveMenuId(null);
          setIsSearchFocused(false);
          setIsFilterMenuOpen(false);
        }}
      >
        <StyledUserHeader>
          {!activeSetId ? (
            <StyledName>Nauka</StyledName>
          ) : (
            <BackButton
              style={{ fontSize: "1.1rem", fontWeight: "600" }}
              onClick={() => {
                if (isAddByTagMode) {
                  setIsAddByTagMode(false);
                  setFoundCards([]);
                  setSelectedSearchTags([]);
                  setSearchTagText("");
                  setShowTagDropdown(false);
                  setSelectedCardsForAdding(new Set());
                  setHasSearchedCards(false);
                } else if (isAddingMode) {
                  const hasChanges = newCards.some(
                    (card) =>
                      card.question.trim() !== "" || card.answer.trim() !== ""
                  );
                  if (hasChanges) {
                    setIsExitAddModeModalOpen(true);
                  } else {
                    setIsAddingMode(false);
                    setErrorMessage("");
                  }
                } else {
                  navigate("/learning");
                }
              }}
            >
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
              {isAddingMode || isAddByTagMode
                ? "Wróć do zestawu"
                : "Powrót do zestawów"}
            </BackButton>
          )}

          {/* WYSZUKIWARKA */}
          <SearchWrapper
            style={{
              visibility: isAddByTagMode || isAddingMode ? "hidden" : "visible",
            }}
          >
            <StyledSearchInput onClick={(e) => e.stopPropagation()}>
              <svg
                width="15"
                height="15"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
              <input
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />

              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <StyledSearchDropdown>
                  {isSearchLoading ? (
                    <StyledSearchEmpty>Szukam...</StyledSearchEmpty>
                  ) : globalSearchResults.sets.length === 0 &&
                    globalSearchResults.cards.length === 0 ? (
                    <StyledSearchEmpty>
                      Brak wyników dla „{searchQuery}”
                    </StyledSearchEmpty>
                  ) : (
                    <>
                      {/* Wyniki dla ZESTAWÓW */}
                      {globalSearchResults.sets.length > 0 && (
                        <>
                          <StyledSearchSectionTitle>
                            Zestawy
                          </StyledSearchSectionTitle>
                          {globalSearchResults.sets.map((s) => (
                            <StyledSearchResultItem
                              key={`set-${s.id}`}
                              onClick={() => {
                                setSearchQuery("");
                                setIsSearchFocused(false);
                                navigate(`/learning/set/${s.id}`);
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                              >
                                <rect
                                  x="4"
                                  y="4"
                                  width="16"
                                  height="16"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <rect
                                  x="4"
                                  y="4"
                                  width="16"
                                  height="16"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <line x1="4" y1="10" x2="20" y2="10"></line>
                              </svg>
                              <StyledSearchResultInfo>
                                <StyledSearchResultName>
                                  {s.name}
                                </StyledSearchResultName>
                              </StyledSearchResultInfo>
                            </StyledSearchResultItem>
                          ))}
                        </>
                      )}

                      {globalSearchResults.sets.length > 0 &&
                        globalSearchResults.cards.length > 0 && (
                          <StyledSearchDivider />
                        )}

                      {/* Wyniki dla FISZEK */}
                      {globalSearchResults.cards.length > 0 && (
                        <>
                          <StyledSearchSectionTitle>
                            Fiszki
                          </StyledSearchSectionTitle>
                          {globalSearchResults.cards.map((c) => {
                            const textFront = stripHtml(
                              c.contentFirstSide || c.question || ""
                            );
                            return (
                              <StyledSearchResultItem
                                key={`card-${c.id}`}
                                onClick={() => {
                                  setSearchQuery("");
                                  setIsSearchFocused(false);
                                  navigate(`/learning/set/${c.setId}`, {
                                    state: { highlightCardId: c.id },
                                  });
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z" />
                                </svg>
                                <StyledSearchResultInfo>
                                  <StyledSearchResultName>
                                    {textFront}
                                  </StyledSearchResultName>
                                  <StyledSearchResultPath>
                                    Zestaw: {c.setName}
                                  </StyledSearchResultPath>
                                </StyledSearchResultInfo>
                              </StyledSearchResultItem>
                            );
                          })}
                        </>
                      )}
                    </>
                  )}
                </StyledSearchDropdown>
              )}
            </StyledSearchInput>
          </SearchWrapper>
        </StyledUserHeader>

        {/* ZAKŁADKI I TOOLBAR U GÓRY */}
        {!activeSetId && (
          <StyledToolbar>
            <StyledTabsContainer>
              <StyledTab
                $active={!isTrashView}
                onClick={() => navigate("/learning")}
              >
                <svg fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
                </svg>
                <TabLabel>Moje zestawy fiszek</TabLabel>
              </StyledTab>
              <StyledTab
                $active={isTrashView}
                onClick={() => navigate("/learning/trash")}
              >
                <svg fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
                <TabLabel>Kosz</TabLabel>
              </StyledTab>
            </StyledTabsContainer>

            <ToolbarActions>
              {!isTrashView && (
                <FilterContainer>
                  <ToolbarButton
                    className="outline"
                    disabled={sets.length === 0}
                    title={
                      sets.length === 0 ? "Brak zestawów do filtrowania" : ""
                    }
                    style={{ opacity: sets.length === 0 ? 0.5 : 1 }}
                    onClick={(e) => {
                      if (sets.length === 0) return;
                      e.stopPropagation();
                      setIsFilterMenuOpen(!isFilterMenuOpen);
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"
                      />
                    </svg>
                    Filtruj
                    {selectedTagsFilter.length > 0 && (
                      <ActiveFilterBadge>
                        {selectedTagsFilter.length}
                      </ActiveFilterBadge>
                    )}
                  </ToolbarButton>

                  {/* MENU FILTRÓW */}
                  {isFilterMenuOpen && (
                    <FilterDropdown onClick={(e) => e.stopPropagation()}>
                      <Text
                        bold="true"
                        text="Filtruj po tagach"
                        style={{ fontSize: "0.95rem", margin: "0 0 5px 5px" }}
                      />

                      {allAvailableTags.length === 0 ? (
                        <Text
                          text="Brak tagów w Twoich zestawach."
                          style={{
                            fontSize: "0.85rem",
                            color: theme.colors.textMuted,
                            marginLeft: "5px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {allAvailableTags.map((tag) => {
                            const isActive = selectedTagsFilter.includes(tag);
                            return (
                              <FilterTag
                                key={tag}
                                $active={isActive}
                                title={tag}
                                onClick={() => {
                                  if (isActive) {
                                    setSelectedTagsFilter((prev) =>
                                      prev.filter((t) => t !== tag)
                                    );
                                  } else {
                                    setSelectedTagsFilter((prev) => [
                                      ...prev,
                                      tag,
                                    ]);
                                  }
                                }}
                              >
                                {tag}
                              </FilterTag>
                            );
                          })}
                        </div>
                      )}

                      {selectedTagsFilter.length > 0 && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: theme.colors.danger,
                            cursor: "pointer",
                            marginTop: "10px",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                          onClick={() => setSelectedTagsFilter([])}
                        >
                          Wyczyść filtry
                        </div>
                      )}
                    </FilterDropdown>
                  )}
                </FilterContainer>
              )}

              {sets.length > 0 && !isTrashView && (
                <SortSelectContainer>
                  <SortSelect
                    value={setSortOption}
                    onChange={(e) => setSetSortOption(e.target.value)}
                  >
                    <option value="oldest">↑ Sortuj: Od najstarszych</option>
                    <option value="newest">↓ Sortuj: Od najnowszych</option>
                    <option value="alphabetical">
                      ↓ Sortuj: Alfabetycznie (A-Z)
                    </option>
                  </SortSelect>
                  <SortIconWrapper>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                    </svg>
                  </SortIconWrapper>
                </SortSelectContainer>
              )}
              {isTrashView && (
                <HelpIcon>
                  ?
                  <HelpTooltip>
                    Zestawy w koszu są przechowywane przez 30 dni, po czym
                    ulegają automatycznemu usunięciu.
                  </HelpTooltip>
                </HelpIcon>
              )}
            </ToolbarActions>
          </StyledToolbar>
        )}

        {/* NAGŁÓWEK WIDOKU ZESTAWU */}
        {activeSetId && (
          <>
            <SetNameHeader>
              <StyledName style={{ fontSize: "2rem", margin: 0 }}>
                {currentSet?.name}
              </StyledName>
              {currentSet?.tags &&
                currentSet.tags.length > 0 &&
                !isAddingMode &&
                !isAddByTagMode && (
                  <TagsContainer style={{ width: "auto", marginTop: 0 }}>
                    {currentSet.tags.map((tag, i) => (
                      <StyledTag key={i}>{tag}</StyledTag>
                    ))}
                  </TagsContainer>
                )}
            </SetNameHeader>

            {!isAddingMode && !isAddByTagMode && !isTrashView && (
              <SetHeaderControls>
                {isSelectMode && sortedCards.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => setSelectedCards(sortedCards)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.secondary,
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = `${theme.colors.secondary}15`)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                      </svg>
                      Zaznacz wszystko
                    </button>
                    <button
                      onClick={() => setSelectedCards([])}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.textLight,
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = theme.colors.text)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = theme.colors.textLight)
                      }
                    >
                      Wyczyść
                    </button>
                  </div>
                )}

                {!isSelectMode && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "nowrap",
                    }}
                  >
                    <ActionBanner
                      onClick={() =>
                        navigate(`/learning/fast/${currentSet?.id}`)
                      }
                    >
                      Wznów ostatnią sesję
                      <span className="hide-mobile"> (szybka nauka)</span>
                    </ActionBanner>

                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <StartLearningButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLearningMenuOpen(!isLearningMenuOpen);
                        }}
                      >
                        Rozpocznij naukę
                        <svg
                          style={{ marginLeft: "8px" }}
                          width="12"
                          height="12"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                        </svg>
                      </StartLearningButton>

                      <HelpIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLearningInfoModalOpen(true);
                        }}
                        title="Jak działają tryby nauki?"
                      >
                        ?
                      </HelpIcon>

                      {isLearningMenuOpen && (
                        <StyledItemOptions
                          style={{
                            top: "calc(100% + 5px)",
                            left: "auto",
                            right: "0",
                          }}
                        >
                          <StyledItemOption
                            onClick={() => handleModeSelection("fast")}
                          >
                            Szybka nauka
                          </StyledItemOption>
                          <StyledItemOption
                            onClick={() => handleModeSelection("fsrs")}
                          >
                            Trwała nauka
                          </StyledItemOption>
                        </StyledItemOptions>
                      )}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginLeft: "auto",
                  }}
                >
                  {/* PRZYCISK ZAZNACZANIA FISZEK */}
                  {!isReadOnly &&
                    ((currentSet?.cards && currentSet.cards.length > 0) ||
                      isSelectMode) && (
                      <ToolbarButton
                        className="outline"
                        disabled={
                          !currentSet?.cards || currentSet.cards.length === 0
                        }
                        onClick={() => {
                          if (
                            !currentSet?.cards ||
                            currentSet.cards.length === 0
                          )
                            return;
                          setIsSelectMode(!isSelectMode);
                          setSelectedCards([]);
                        }}
                        title={
                          !currentSet?.cards || currentSet.cards.length === 0
                            ? "Brak fiszek do zaznaczenia"
                            : ""
                        }
                      >
                        <svg
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          width="14"
                          height="14"
                          style={{
                            opacity:
                              !currentSet?.cards ||
                              currentSet.cards.length === 0
                                ? 0.5
                                : 1,
                          }}
                        >
                          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                          <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                        </svg>
                        {isSelectMode ? "Zamknij wybór" : "Zaznacz fiszki"}
                      </ToolbarButton>
                    )}

                  {currentSet?.cards && currentSet.cards.length > 0 && (
                    <SortSelectContainer>
                      <SortSelect
                        value={cardSortOption}
                        onChange={(e) => setCardSortOption(e.target.value)}
                      >
                        <option value="oldest">
                          ↑ Sortuj: Od najstarszych
                        </option>
                        <option value="newest">↓ Sortuj: Od najnowszych</option>
                        <option value="alphabetical">
                          ↓ Sortuj: Alfabetycznie (A-Z)
                        </option>
                      </SortSelect>
                      <SortIconWrapper>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                        </svg>
                      </SortIconWrapper>
                    </SortSelectContainer>
                  )}
                </div>
              </SetHeaderControls>
            )}
          </>
        )}

        {errorMessage && !isSetModalOpen && !isCardEditModalOpen && (
          <Text color="danger" text={errorMessage} />
        )}

        {/* LISTA ZESTAWÓW */}
        {!activeSetId && (
          <ContentContainer $setsView>
            {isReady && sets.length === 0 && !errorMessage ? (
              <EmptyStateContainer>
                <svg
                  width="48"
                  height="48"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  {isTrashView ? (
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                  ) : (
                    <>
                      <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4z" />
                    </>
                  )}
                </svg>
                <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                  {isTrashView
                    ? "Kosz jest pusty."
                    : "Brak zestawów. Utwórz swój pierwszy!"}
                </p>
              </EmptyStateContainer>
            ) : (
              sortedSets.map((set) => (
                <SetItemWrapper
                  key={set.id}
                  $disabled={isTrashView}
                  $isActive={activeMenuId === set.id}
                  onClick={() => {
                    if (activeMenuId !== null) return;
                    if (!isTrashView) navigate(`/learning/set/${set.id}`);
                  }}
                >
                  <SetIconContainer>
                    <StackedCardsIcon />
                  </SetIconContainer>
                  <StyledItemHeaderWrapper>
                    <Text
                      as="h4"
                      bold="true"
                      text={set.name}
                      style={{ marginBottom: "10px" }}
                    />
                    <Text
                      text={`${set.cards?.length || 0} ${getCardsCountWord(
                        set.cards?.length || 0
                      )}`}
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    />

                    {/* TRZY KROPKI - WIDOCZNE TYLKO DLA ADMINA / EDYTORA LUB WŁAŚCICIELA */}
                    {!isReadOnly && (
                      <StyledItemHeader
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeMenuId !== set.id) {
                            setIsAddingItemTag(false);
                            setNewItemTag("");
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          const fitsRight =
                            rect.right + 10 + 350 <= window.innerWidth;
                          const fitsLeft = rect.left - 10 - 350 >= 0;
                          setCenterBelow(!fitsRight && !fitsLeft);
                          setFlipLeft(!fitsRight && fitsLeft);
                          setActiveMenuId(
                            activeMenuId === set.id ? null : set.id
                          );
                        }}
                      >
                        <EllipsisIcon />
                        {activeMenuId === set.id && (
                          <StyledItemOptions
                            $flipLeft={flipLeft}
                            $centerBelow={centerBelow}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isTrashView ? (
                              <StyledItemOption
                                $narrow={isTrashView}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreSet(set.id);

                                  setActiveMenuId(null);
                                }}
                              >
                                Przywróć zestaw
                              </StyledItemOption>
                            ) : (
                              <>
                                <div style={{ padding: "0 10px" }}>
                                  <DropdownSectionLabel>
                                    Nazwa
                                  </DropdownSectionLabel>
                                </div>
                                <input
                                  defaultValue={set.name}
                                  maxLength={55}
                                  onBlur={(e) => {
                                    const newName = e.target.value;
                                    if (
                                      newName.trim() &&
                                      newName.trim() !== set.name
                                    ) {
                                      handleRenameSetInline(
                                        set,
                                        newName.trim()
                                      );
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const newName = e.target.value;
                                      if (
                                        newName.trim() &&
                                        newName.trim() !== set.name
                                      ) {
                                        handleRenameSetInline(
                                          set,
                                          newName.trim()
                                        );
                                      }
                                      setActiveMenuId(null);
                                    }
                                    if (e.key === "Escape") {
                                      setActiveMenuId(null);
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />

                                <div style={{ padding: "0 12px" }}>
                                  <DropdownSectionLabel>
                                    Tagi
                                  </DropdownSectionLabel>
                                  <TagsContainer
                                    style={{
                                      justifyContent: "flex-start",
                                      margin: "0 0 10px 0",
                                    }}
                                  >
                                    {set.tags?.map((tag, idx) => (
                                      <StyledTag key={idx}>
                                        {tag}
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleInlineSetTagRemove(set, tag);
                                          }}
                                        >
                                          ×
                                        </div>
                                      </StyledTag>
                                    ))}

                                    {isAddingItemTag ? (
                                      <StyledTagInput
                                        autoFocus
                                        maxLength={55}
                                        value={newItemTag}
                                        onChange={(e) =>
                                          setNewItemTag(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            newItemTag.trim()
                                          ) {
                                            handleInlineSetTagAdd(
                                              set,
                                              newItemTag.trim()
                                            );
                                            setNewItemTag("");
                                            setIsAddingItemTag(false);
                                          }
                                          if (e.key === "Escape") {
                                            setIsAddingItemTag(false);
                                            setNewItemTag("");
                                          }
                                        }}
                                        onBlur={() => {
                                          setIsAddingItemTag(false);
                                          setNewItemTag("");
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <StyledAddTagButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsAddingItemTag(true);
                                        }}
                                      >
                                        + Dodaj
                                      </StyledAddTagButton>
                                    )}
                                  </TagsContainer>
                                </div>

                                <div
                                  style={{
                                    height: "1px",
                                    background: theme.colors.borderLight,
                                    margin: "5px 0",
                                  }}
                                ></div>

                                <StyledItemOption
                                  className="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteSet(set.id);
                                  }}
                                >
                                  <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                                  </svg>
                                  Usuń zestaw
                                </StyledItemOption>
                              </>
                            )}
                          </StyledItemOptions>
                        )}
                      </StyledItemHeader>
                    )}
                  </StyledItemHeaderWrapper>
                </SetItemWrapper>
              ))
            )}
          </ContentContainer>
        )}

        {/* WNETRZE ZESTAWU */}
        {activeSetId && !isAddingMode && !isAddByTagMode && (
          <ContentContainer>
            {isReady &&
            (!currentSet?.cards || currentSet.cards.length === 0) &&
            !errorMessage ? (
              <EmptyStateContainer>
                <svg
                  width="48"
                  height="48"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                </svg>
                <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                  Ten zestaw jest pusty. Kliknij +, aby dodać fiszkę!
                </p>
              </EmptyStateContainer>
            ) : (
              sortedCards.map((card) => (
                <HighlightWrapper
                  key={card.id}
                  id={`flashcard-item-${card.id}`}
                  $isHighlighted={highlightedCardId === card.id}
                >
                  <Flashcard
                    card={card}
                    question={card.contentFirstSide || card.question}
                    answer={card.contentFlipSide || card.answer}
                    onEdit={() => openEditCardModal(card)}
                    onDelete={() => confirmDeleteCard(card.id)}
                    onTagAdd={handleInlineCardTagAdd}
                    onTagRemove={handleInlineCardTagRemove}
                    isSelectMode={isSelectMode}
                    isSelected={selectedCards.some((c) => c.id === card.id)}
                    onToggleSelect={() => toggleCardSelection(card)}
                    isReadOnly={isReadOnly}
                  />
                </HighlightWrapper>
              ))
            )}
          </ContentContainer>
        )}

        {/* TRYB DODAWANIA FISZEK */}
        {activeSetId && isAddingMode && (
          <CardsFormContainer>
            {newCards.map((card, index) => (
              <CardInputRow key={index}>
                <CardInputSide>
                  <SideLabel>Przód:</SideLabel>
                  <FlashcardEditor
                    maxLength={1020}
                    value={card.question}
                    placeholder="Wprowadź pytanie lub wpisz /"
                    hasError={cardValidationErrors[index]?.qError}
                    onChange={(htmlContent) =>
                      updateNewCard(index, "question", htmlContent)
                    }
                  />
                </CardInputSide>
                <CardInputSide>
                  <SideLabel>Tył:</SideLabel>
                  <FlashcardEditor
                    maxLength={1020}
                    value={card.answer}
                    placeholder="Wprowadź odpowiedź lub wpisz /"
                    hasError={cardValidationErrors[index]?.aError}
                    onChange={(htmlContent) =>
                      updateNewCard(index, "answer", htmlContent)
                    }
                  />
                </CardInputSide>
              </CardInputRow>
            ))}

            <AddMoreRowButton
              disabled={hasEmptyCard}
              onClick={() =>
                setNewCards([...newCards, { question: "", answer: "" }])
              }
            >
              + Dodaj nową fiszkę...
            </AddMoreRowButton>
          </CardsFormContainer>
        )}

        {!isTrashView && !isReadOnly && (
          <FloatingActionButton
            onClick={() => {
              if (isAddingMode) {
                handleSaveNewCards();
              } else if (activeSetId) {
                setIsAddingMode(true);
                setNewCards([{ question: "", answer: "" }]);
              } else {
                openAddSetModal();
              }
            }}
          >
            {isAddingMode ? <CheckmarkIcon /> : <PlusIcon />}
          </FloatingActionButton>
        )}

        {/* TRYB DODAWANIA PO TAGU */}
        {activeSetId && isAddByTagMode && (
          <CardsFormContainer>
            <CardInputRow style={{ flexDirection: "column", gap: "16px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <TagSearchContainer ref={tagSearchRef} style={{ flex: 1 }}>
                  <TagMultiselectInput
                    $open={showTagDropdown}
                    onClick={() => {
                      setShowTagDropdown(true);
                      setTimeout(() => tagSearchInputRef.current?.focus(), 0);
                    }}
                  >
                    <TagChipsScroll>
                      {[...selectedSearchTags].reverse().map((tag) => (
                        <TagSelectedChip key={tag}>
                          {tag}
                          <TagSelectedChipRemove
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTags = selectedSearchTags.filter(
                                (t) => t !== tag
                              );
                              setSelectedSearchTags(newTags);
                              if (newTags.length > 0) {
                                setIsLoadingCards(true);
                                getCardsByTags(newTags).then((res) => {
                                  if (!res.errorCode) {
                                    const uniqueCards = Array.from(
                                      new Map(
                                        res.cards.map((c) => [c.id, c])
                                      ).values()
                                    );
                                    setFoundCards(
                                      uniqueCards.filter(
                                        (c) =>
                                          !currentSet.cards.some(
                                            (sc) => sc.id === c.id
                                          )
                                      )
                                    );
                                  }
                                  setIsLoadingCards(false);
                                });
                              } else {
                                getAllUsersCards().then((res) => {
                                  if (!res.errorCode) {
                                    setFoundCards(
                                      res.cards.filter(
                                        (c) =>
                                          !currentSet.cards.some(
                                            (sc) => sc.id === c.id
                                          )
                                      )
                                    );
                                  }
                                });
                              }
                            }}
                          >
                            ×
                          </TagSelectedChipRemove>
                        </TagSelectedChip>
                      ))}
                    </TagChipsScroll>
                    <TagMultiselectTextInput
                      ref={tagSearchInputRef}
                      maxLength={55}
                      placeholder={
                        selectedSearchTags.length === 0
                          ? "Filtruj po tagach..."
                          : ""
                      }
                      value={searchTagText}
                      onChange={(e) => {
                        setSearchTagText(e.target.value);
                        if (!showTagDropdown) setShowTagDropdown(true);
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !searchTagText &&
                          selectedSearchTags.length > 0
                        ) {
                          const newTags = selectedSearchTags.slice(0, -1);
                          setSelectedSearchTags(newTags);
                          if (newTags.length > 0) {
                            setIsLoadingCards(true);
                            getCardsByTags(newTags).then((res) => {
                              if (!res.errorCode) {
                                const uniqueCards = Array.from(
                                  new Map(
                                    res.cards.map((c) => [c.id, c])
                                  ).values()
                                );
                                setFoundCards(
                                  uniqueCards.filter(
                                    (c) =>
                                      !currentSet.cards.some(
                                        (sc) => sc.id === c.id
                                      )
                                  )
                                );
                              }
                              setIsLoadingCards(false);
                            });
                          } else {
                            getAllUsersCards().then((res) => {
                              if (!res.errorCode) {
                                setFoundCards(
                                  res.cards.filter(
                                    (c) =>
                                      !currentSet.cards.some(
                                        (sc) => sc.id === c.id
                                      )
                                  )
                                );
                              }
                            });
                          }
                        }
                        if (e.key === "Escape") {
                          setShowTagDropdown(false);
                          setSearchTagText("");
                          tagSearchInputRef.current?.blur();
                        }
                      }}
                    />
                    <TagMultiselectArrow>
                      {showTagDropdown ? "▲" : "▼"}
                    </TagMultiselectArrow>
                  </TagMultiselectInput>
                  {showTagDropdown &&
                    (() => {
                      const allTags = [
                        ...new Set(
                          allUserCards.flatMap((card) => card.cardTags || [])
                        ),
                      ].sort();
                      const filteredTags = allTags.filter((tag) =>
                        tag.toLowerCase().includes(searchTagText.toLowerCase())
                      );
                      return (
                        <TagSearchDropdown
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {filteredTags.length > 0 ? (
                            <TagDropdownSection>
                              <TagDropdownSectionLabel>
                                Tagi
                              </TagDropdownSectionLabel>
                              {filteredTags.map((tag) => (
                                <TagDropdownItem
                                  key={tag}
                                  onClick={async () => {
                                    const newTags = selectedSearchTags.includes(
                                      tag
                                    )
                                      ? selectedSearchTags.filter(
                                          (t) => t !== tag
                                        )
                                      : [...selectedSearchTags, tag];
                                    setSelectedSearchTags(newTags);
                                    setSearchTagText("");
                                    setTimeout(
                                      () => tagSearchInputRef.current?.focus(),
                                      0
                                    );
                                    setIsLoadingCards(true);
                                    if (newTags.length > 0) {
                                      const res = await getCardsByTags(newTags);
                                      if (!res.errorCode) {
                                        const uniqueCards = Array.from(
                                          new Map(
                                            res.cards.map((c) => [c.id, c])
                                          ).values()
                                        );
                                        setFoundCards(
                                          uniqueCards.filter(
                                            (c) =>
                                              !currentSet.cards.some(
                                                (sc) => sc.id === c.id
                                              )
                                          )
                                        );
                                      }
                                    } else {
                                      const res = await getAllUsersCards();
                                      if (!res.errorCode) {
                                        setFoundCards(
                                          res.cards.filter(
                                            (c) =>
                                              !currentSet.cards.some(
                                                (sc) => sc.id === c.id
                                              )
                                          )
                                        );
                                      }
                                    }
                                    setIsLoadingCards(false);
                                  }}
                                >
                                  <TagDropdownCheck
                                    $checked={selectedSearchTags.includes(tag)}
                                  >
                                    {selectedSearchTags.includes(tag) && "✓"}
                                  </TagDropdownCheck>
                                  {tag}
                                </TagDropdownItem>
                              ))}
                            </TagDropdownSection>
                          ) : (
                            <TagDropdownItem
                              style={{ pointerEvents: "none", color: "grey" }}
                            >
                              Brak tagów
                            </TagDropdownItem>
                          )}
                        </TagSearchDropdown>
                      );
                    })()}
                </TagSearchContainer>
                {!isLoadingCards && foundCards.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexShrink: 0,
                      marginLeft: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: theme.colors.textLight,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Zaznaczone: {selectedCardsForAdding.size}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedCardsForAdding(
                          new Set(foundCards.map((card) => card.id))
                        )
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor: theme.colors.secondary,
                        color: theme.colors.white,
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Zaznacz wszystko
                    </button>
                    <button
                      onClick={() => setSelectedCardsForAdding(new Set())}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: theme.colors.lightGrey,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.borderLight}`,
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Wyczyść
                    </button>
                  </div>
                )}
              </div>

              {isLoadingCards && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Text text="Szukam fiszkek..." />
                </div>
              )}

              {!isLoadingCards &&
                foundCards.length === 0 &&
                hasSearchedCards && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#888",
                      fontSize: "0.95rem",
                    }}
                  >
                    Brak fiszkek z tym tagiem, które nie są już w zestawie
                  </div>
                )}
            </CardInputRow>

            {!isLoadingCards &&
              foundCards.length > 0 &&
              foundCards.map((card) => (
                <CardInputRow
                  key={card.id}
                  onClick={() => {
                    const newSet = new Set(selectedCardsForAdding);
                    if (newSet.has(card.id)) newSet.delete(card.id);
                    else newSet.add(card.id);
                    setSelectedCardsForAdding(newSet);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "16px",
                    borderRadius: "12px",
                    border: `2px solid ${
                      selectedCardsForAdding.has(card.id)
                        ? theme.colors.secondary
                        : "#eee"
                    }`,
                    background: selectedCardsForAdding.has(card.id)
                      ? `${theme.colors.secondary}15`
                      : "white",
                    transition: "all 0.15s",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: `2px solid ${
                        selectedCardsForAdding.has(card.id)
                          ? theme.colors.secondary
                          : "#ccc"
                      }`,
                      background: selectedCardsForAdding.has(card.id)
                        ? theme.colors.secondary
                        : "white",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      order: -1,
                    }}
                  >
                    {selectedCardsForAdding.has(card.id) && (
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <CardInputSide>
                    <SideLabel>Przód</SideLabel>
                    <div
                      style={{ fontSize: "0.95rem" }}
                      dangerouslySetInnerHTML={{
                        __html: card.contentFirstSide,
                      }}
                    />
                  </CardInputSide>
                  <CardInputSide>
                    <SideLabel>Tył</SideLabel>
                    <div
                      style={{ fontSize: "0.95rem" }}
                      dangerouslySetInnerHTML={{ __html: card.contentFlipSide }}
                    />
                  </CardInputSide>
                  {card.cardTags && card.cardTags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        alignItems: "flex-start",
                        minWidth: "150px",
                        paddingLeft: "16px",
                        borderLeft: `1px solid ${theme.colors.borderLight}`,
                      }}
                    >
                      {card.cardTags.map((tag, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: theme.colors.secondary,
                            color: theme.colors.white,
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </CardInputRow>
              ))}
          </CardsFormContainer>
        )}

        {!isTrashView && (
          <>
            {isAddModeMenuOpen && activeSetId && (
              <FabMenu data-add-mode-menu>
                <FabMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingMode(true);
                    setNewCards([{ question: "", answer: "" }]);
                    setIsAddModeMenuOpen(false);
                  }}
                >
                  Wpisz fiszki ręcznie
                </FabMenuItem>
                <FabMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddByTagMode(true);
                    setIsAddModeMenuOpen(false);
                    setSelectedSearchTags([]);
                    setSearchTagText("");
                    setShowTagDropdown(false);
                    setSelectedCardsForAdding(new Set());
                    setHasSearchedCards(false);
                    // Załaduj wszystkie fiszki użytkownika
                    setFoundCards([]);
                    setIsLoadingCards(true);
                  }}
                >
                  Wybierz istniejące fiszki
                </FabMenuItem>
              </FabMenu>
            )}
            <FloatingActionButton
              data-fab-button
              onClick={async (e) => {
                e.stopPropagation();
                if (isAddingMode) {
                  handleSaveNewCards();
                } else if (isAddByTagMode) {
                  if (selectedCardsForAdding.size > 0) {
                    const selectedToAdd = foundCards.filter((card) =>
                      selectedCardsForAdding.has(card.id)
                    );
                    const cardRequests = selectedToAdd.map((card) => ({
                      contentFirstSide: card.contentFirstSide,
                      contentFlipSide: card.contentFlipSide,
                      setId: currentSet.id,
                      cardTags: card.cardTags ? Array.from(card.cardTags) : [],
                    }));
                    const res = await addListOfCardsToSet(
                      currentSet.id,
                      cardRequests
                    );
                    if (res.errorCode) {
                      setErrorMessage(res.message);
                      return;
                    }
                    setSuccessMessage("Zapisano!");
                    setTimeout(() => setSuccessMessage(""), 1000);
                    fetchData();
                  }
                  setIsAddByTagMode(false);
                  setSelectedCardsForAdding(new Set());
                  setSelectedSearchTags([]);
                  setSearchTagText("");
                  setShowTagDropdown(false);
                  setFoundCards([]);
                  setHasSearchedCards(false);
                  setHasSearchedCards(false);
                } else if (activeSetId) {
                  setIsAddModeMenuOpen(!isAddModeMenuOpen);
                } else {
                  openAddSetModal();
                }
              }}
            >
              {isAddingMode || isAddByTagMode ? (
                <CheckmarkIcon />
              ) : (
                <PlusIcon />
              )}
            </FloatingActionButton>
          </>
        )}

        {/* EDYCJA POJEDYNCZEJ FISZKI */}
        {isCardEditModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsCardEditModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <Text bold="true" as="h2" text="Edytuj fiszkę" />
              {errorMessage && <Text color="danger" text={errorMessage} />}

              <Text text="Pytanie:" style={{ marginTop: "20px" }} />
              <FlashcardEditor
                maxLength={1020}
                value={editQuestion}
                placeholder="Wpisz pytanie..."
                onChange={(htmlContent) => setEditQuestion(htmlContent)}
              />

              <Text text="Odpowiedź:" style={{ marginTop: "20px" }} />
              <FlashcardEditor
                maxLength={1020}
                value={editAnswer}
                placeholder="Wpisz odpowiedź..."
                onChange={(htmlContent) => setEditAnswer(htmlContent)}
              />

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <SubmitButton
                  text={successMessage ? "✔ Zapisano!" : "Zapisz zmiany"}
                  color={successMessage ? "secondary" : "dark"}
                  onClick={handleEditSingleCard}
                />
              </div>
            </StyledPopup>
          </>
        )}

        {/* DODAWANIE/EDYCJA ZESTAWU */}
        {isSetModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsSetModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <Text
                bold="true"
                as="h2"
                text={editingSetId ? "Edytuj zestaw" : "Nowy zestaw fiszek"}
              />
              {errorMessage && <Text color="danger" text={errorMessage} />}

              <div style={{ marginTop: "30px", marginBottom: "20px" }}>
                <Input
                  autoFocus
                  type="text"
                  name="setName"
                  placeholder="Nazwa zestawu"
                  value={setName}
                  onChange={(e) => {
                    if (e.target.value.length <= 55) {
                      setSetName(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveNewSet(e);
                  }}
                />
              </div>

              <TagSelector
                suggestedTags={suggestedTagsForSet}
                chosenTags={chosenTagsForSet}
                isAddingTag={isAddingTagForSet}
                newTag={newTagForSet}
                onToggleTag={(tag) => {
                  setChosenTagsForSet((prev) => [...prev, tag]);
                }}
                onAddNewTag={(tag) => {
                  if (!chosenTagsForSet.includes(tag)) {
                    setChosenTagsForSet((prev) => [...prev, tag]);
                  }
                }}
                onRemoveTag={(tag) => {
                  setChosenTagsForSet((prev) => prev.filter((t) => t !== tag));
                }}
                onSetIsAddingTag={setIsAddingTagForSet}
                onSetNewTag={setNewTagForSet}
              />

              <div style={{ display: "flex", justifyContent: "center" }}>
                <SubmitButton
                  text={
                    successMessage
                      ? "✔ Zapisano!"
                      : editingSetId
                      ? "Zapisz zmiany"
                      : "Utwórz zestaw"
                  }
                  color={successMessage ? "secondary" : "dark"}
                  onClick={handleSaveNewSet}
                />
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL WYJŚCIA Z TRYBU DODAWANIA FISZEK */}
        {isExitAddModeModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsExitAddModeModalOpen(false)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Czy na pewno chcesz wyjść?" />
              <Text
                text="Wprowadzone zmiany zostaną bezpowrotnie utracone."
                style={{
                  margin: "20px 0 30px 0",
                  color: theme.colors.textLight,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton
                  type="button"
                  $danger
                  onClick={() => {
                    setIsExitAddModeModalOpen(false);
                    setIsAddingMode(false);
                    setNewCards([{ question: "", answer: "" }]);
                    setErrorMessage("");
                  }}
                >
                  Wyjdź bez zapisywania
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => setIsExitAddModeModalOpen(false)}
                >
                  Zostań i dokończ
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL USUWANIA ZESTAWU */}
        {setToDelete && (
          <>
            <ModalOverlay onClick={() => setSetToDelete(null)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Usuń zestaw" />
              <Text
                text="Czy na pewno chcesz usunąć ten zestaw?"
                style={{
                  margin: "20px 0 30px 0",
                  color: theme.colors.textLight,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton type="button" $danger onClick={executeDeleteSet}>
                  Usuń
                </ModalButton>
                <ModalButton type="button" onClick={() => setSetToDelete(null)}>
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL OSTRZEGAJĄCY O DUPLIKATACH */}
        {duplicateWarning && (
          <>
            <ModalOverlay onClick={() => setDuplicateWarning(null)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Uwaga: Znaleziono duplikaty!" />
              <Text
                text="Fiszki z takimi pytaniami już istnieją w Twoich zestawach:"
                style={{ margin: "15px 0", color: theme.colors.textLight }}
              />

              <div
                style={{
                  textAlign: "left",
                  background: theme.colors.lightGrey,
                  padding: "15px",
                  borderRadius: "10px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  marginBottom: "25px",
                }}
              >
                {duplicateWarning.map((dup, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: "8px", fontSize: "0.9rem" }}
                  >
                    <strong>{dup.question}</strong>{" "}
                    <span style={{ color: theme.colors.textMuted }}>
                      (w: {dup.setName})
                    </span>
                  </div>
                ))}
              </div>

              <Text
                text="Czy na pewno chcesz dodać je ponownie?"
                style={{ marginBottom: "20px", fontWeight: "600" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                >
                  Anuluj
                </ModalButton>
                <ModalButton
                  type="button"
                  $danger
                  onClick={() => {
                    setDuplicateWarning(null);
                    executeSaveCards(pendingValidCards, true);
                  }}
                >
                  Zapisz mimo to
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* PŁYWAJĄCY PASEK ZAZNACZENIA */}
        {isSelectMode && selectedCards.length > 0 && (
          <SelectionBar>
            <SelectionBarTop>
              <SelectionBarCount>
                Zaznaczono: {selectedCards.length}
              </SelectionBarCount>
              <ModalButtonGhost
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedCards([]);
                }}
              >
                Anuluj
              </ModalButtonGhost>
            </SelectionBarTop>
            <SelectionBarActions>
              <ModalButton onClick={() => setIsBulkTagsModalOpen(true)}>
                Dodaj tagi
              </ModalButton>
              <ModalButtonPrimary onClick={() => setIsBulkMoveModalOpen(true)}>
                Przenieś do..
              </ModalButtonPrimary>
              <ModalButtonPrimary onClick={() => setIsBulkCopyModalOpen(true)}>
                Kopiuj do..
              </ModalButtonPrimary>
              <ModalButton $danger onClick={handleBulkDeleteClick}>
                Usuń
              </ModalButton>
            </SelectionBarActions>
          </SelectionBar>
        )}

        {/* MODAL KOPIOWANIA FISZEK */}
        {isBulkCopyModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsBulkCopyModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <Text
                bold="true"
                as="h2"
                text={`Kopiowanie ${selectedCards.length} ${
                  selectedCards.length === 1 ? "fiszki" : "fiszek"
                }`}
              />
              {errorMessage && (
                <Text
                  color="danger"
                  text={errorMessage}
                  style={{ marginBottom: "10px" }}
                />
              )}

              <Text
                text="Wybierz zestaw docelowy:"
                style={{ marginTop: "20px", marginBottom: "10px" }}
              />
              <SortSelect
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  border: `1px solid ${theme.colors.darkGrey}`,
                }}
                value={bulkTargetSetId}
                onChange={(e) => setBulkTargetSetId(e.target.value)}
              >
                <option value="" disabled>
                  -- Wybierz zestaw --
                </option>
                <option value="NEW" style={{ fontWeight: "bold" }}>
                  + Utwórz nowy zestaw
                </option>
                {sets
                  .filter((s) => s.id !== activeSetId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </SortSelect>

              {bulkTargetSetId === "NEW" && (
                <Input
                  autoFocus
                  placeholder="Nazwa nowego zestawu"
                  value={bulkNewSetName}
                  onChange={(e) => setBulkNewSetName(e.target.value)}
                  style={{ marginBottom: "20px" }}
                />
              )}

              {bulkTargetSetId && bulkTargetSetId !== "NEW" && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    marginBottom: "30px",
                    fontWeight: "500",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    checked={bulkApplyTags}
                    onChange={(e) => setBulkApplyTags(e.target.checked)}
                  />
                  Dodaj tagi docelowego zestawu jako tagi fiszki
                </label>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                <ModalButton
                  type="button"
                  onClick={handleBulkCopy}
                  style={{
                    background: theme.colors.secondary,
                    color: theme.colors.white,
                  }}
                >
                  Skopiuj fiszki
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => {
                    setIsBulkCopyModalOpen(false);
                    setBulkTargetSetId("");
                    setBulkNewSetName("");
                    setErrorMessage("");
                  }}
                >
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL DODAWANIA TAGÓW DO ZAZNACZONYCH FISZEK */}
        {isBulkTagsModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsBulkTagsModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <Text
                bold="true"
                as="h2"
                text={`Dodaj tagi do ${selectedCards.length} ${
                  selectedCards.length === 1 ? "fiszki" : "fiszek"
                }`}
              />
              {errorMessage && (
                <Text
                  color="danger"
                  text={errorMessage}
                  style={{ marginBottom: "10px" }}
                />
              )}

              <TagSelector
                suggestedTags={suggestedBulkTags}
                chosenTags={chosenBulkTags}
                isAddingTag={isAddingBulkTag}
                newTag={newBulkTag}
                onToggleTag={(tag) => {
                  setChosenBulkTags((prev) => [...prev, tag]);
                }}
                onAddNewTag={(tag) => {
                  if (!chosenBulkTags.includes(tag)) {
                    setChosenBulkTags((prev) => [...prev, tag]);
                  }
                }}
                onRemoveTag={(tag) => {
                  setChosenBulkTags((prev) => prev.filter((t) => t !== tag));
                }}
                onSetIsAddingTag={setIsAddingBulkTag}
                onSetNewTag={setNewBulkTag}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                <ModalButton
                  type="button"
                  onClick={async () => {
                    if (chosenBulkTags.length === 0) {
                      setErrorMessage("Wybierz co najmniej jeden tag");
                      return;
                    }

                    // Dodajemy tagi sekwencyjnie dla każdej fiszki
                    for (const card of selectedCards) {
                      for (const tag of chosenBulkTags) {
                        // Sprawdzamy czy tag już istnieje na tej fiszce
                        if (!card.cardTags?.includes(tag)) {
                          await addFlashcardTag(card.id, tag);
                        }
                      }
                    }

                    setSuccessMessage("Tagi dodane!");
                    setTimeout(() => setSuccessMessage(""), 1500);
                    setIsBulkTagsModalOpen(false);
                    setSelectedCards([]);
                    setIsSelectMode(false);
                    setChosenBulkTags([]);
                    setSuggestedBulkTags([]);
                    setIsAddingBulkTag(false);
                    setNewBulkTag("");
                    fetchData();
                  }}
                  style={{
                    background: theme.colors.secondary,
                    color: theme.colors.white,
                  }}
                >
                  Dodaj tagi
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => {
                    setIsBulkTagsModalOpen(false);
                    setChosenBulkTags([]);
                    setSuggestedBulkTags([]);
                    setIsAddingBulkTag(false);
                    setNewBulkTag("");
                    setErrorMessage("");
                  }}
                >
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL PRZENOSZENIA FISZEK */}
        {isBulkMoveModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsBulkMoveModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <Text
                bold="true"
                as="h2"
                text={`Przenoszenie ${selectedCards.length} ${
                  selectedCards.length === 1 ? "fiszki" : "fiszek"
                }`}
              />
              {errorMessage && (
                <Text
                  color="danger"
                  text={errorMessage}
                  style={{ marginBottom: "10px" }}
                />
              )}

              <Text
                text="Wybierz zestaw docelowy:"
                style={{ marginTop: "20px", marginBottom: "10px" }}
              />
              <SortSelect
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "20px",
                  border: `1px solid ${theme.colors.darkGrey}`,
                }}
                value={bulkMoveTargetSetId}
                onChange={(e) => setBulkMoveTargetSetId(e.target.value)}
              >
                <option value="" disabled>
                  -- Wybierz zestaw --
                </option>
                <option value="NEW" style={{ fontWeight: "bold" }}>
                  + Utwórz nowy zestaw
                </option>
                {sets
                  .filter((s) => s.id !== activeSetId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </SortSelect>

              {bulkMoveTargetSetId === "NEW" && (
                <Input
                  autoFocus
                  placeholder="Nazwa nowego zestawu"
                  value={bulkNewSetName}
                  onChange={(e) => setBulkNewSetName(e.target.value)}
                  style={{ marginBottom: "20px" }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton
                  type="button"
                  onClick={async () => {
                    if (!bulkMoveTargetSetId) {
                      setErrorMessage("Wybierz zestaw docelowy");
                      return;
                    }

                    let targetId = bulkMoveTargetSetId;

                    if (targetId === "NEW") {
                      if (!bulkNewSetName.trim()) {
                        setErrorMessage("Podaj nazwę nowego zestawu");
                        return;
                      }
                      const res = await addFlashcardSet(
                        bulkNewSetName.trim(),
                        [],
                        socialId
                      );
                      if (res.errorCode) {
                        setErrorMessage(res.message);
                        return;
                      }
                      targetId = res.id;
                    } else {
                      const targetSet = sets.find(
                        (s) => s.id === parseInt(targetId)
                      );
                      if (!targetSet) {
                        setErrorMessage("Zestaw nie istnieje");
                        return;
                      }
                    }

                    const cardRequests = selectedCards.map((card) => ({
                      contentFirstSide: card.contentFirstSide || card.question,
                      contentFlipSide: card.contentFlipSide || card.answer,
                      setId: parseInt(targetId),
                      cardTags: card.cardTags || [],
                      isForced: false,
                    }));

                    const res = await addListOfCardsToSet(
                      targetId,
                      cardRequests
                    );

                    if (res.errorCode) {
                      setErrorMessage(res.message);
                    } else {
                      setSuccessMessage("Fiszki przeniesione!");
                      setTimeout(() => setSuccessMessage(""), 2000);
                      setIsBulkMoveModalOpen(false);
                      setIsSelectMode(false);
                      setSelectedCards([]);
                      setBulkMoveTargetSetId("");
                      setBulkNewSetName("");
                      fetchData();
                    }
                  }}
                  style={{
                    background: theme.colors.secondary,
                    color: theme.colors.white,
                  }}
                >
                  Przenieś
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => {
                    setIsBulkMoveModalOpen(false);
                    setBulkMoveTargetSetId("");
                    setBulkNewSetName("");
                    setErrorMessage("");
                  }}
                >
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL USUWANIA FISZKI */}
        {cardToDelete && (
          <>
            <ModalOverlay onClick={() => setCardToDelete(null)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Usuń fiszkę" />
              <Text
                text="Czy na pewno chcesz usunąć tę fiszkę?"
                style={{
                  margin: "20px 0 30px 0",
                  color: theme.colors.textLight,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton type="button" $danger onClick={executeDeleteCard}>
                  Usuń
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => setCardToDelete(null)}
                >
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* PRZYCISK WYCZYSZCZENIA KOSZA */}
        {isTrashView && sets.length > 0 && (
          <FloatingActionButton
            style={{ backgroundColor: theme.colors.danger }}
            title="Wyczyść kosz permanentnie"
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirmingTrashClear(true);
            }}
          >
            <svg viewBox="0 0 16 16" fill="white" width="32" height="32">
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
            </svg>
          </FloatingActionButton>
        )}

        {/* MODAL POTWIERDZENIA CZYSZCZENIA KOSZA */}
        {isConfirmingTrashClear && (
          <>
            <ModalOverlay onClick={() => setIsConfirmingTrashClear(false)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Wyczyścić kosz?" />
              <Text
                text="Czy na pewno chcesz usunąć wszystkie zestawy wraz z ich fiszkiami z kosza? Tej operacji nie można cofnąć."
                style={{ margin: "20px 0", color: theme.colors.textLight }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginTop: "30px",
                }}
              >
                <ModalButton type="button" $danger onClick={handleClearTrash}>
                  Wyczyść kosz
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => setIsConfirmingTrashClear(false)}
                >
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL INFORMACYJNY O TRYBACH NAUKI */}
        {isLearningInfoModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsLearningInfoModalOpen(false)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center", maxWidth: "650px" }}
            >
              <Text
                bold="true"
                as="h2"
                text="Jak chcesz się uczyć?"
                style={{ marginBottom: "25px" }}
              />

              <ModeCard>
                <h3>Szybka nauka</h3>
                <p>
                  Idealna przed jutrzejszym kolokwium! Przeglądasz wszystkie
                  fiszki w zestawie jedną po drugiej. Fiszki, których "nie
                  umiesz", będą wracać na koniec kolejki, aż zaliczysz
                  wszystkie.
                </p>
              </ModeCard>

              <ModeCard>
                <h3>Trwała nauka (FSRS)</h3>
                <p>
                  Zbuduj swoją pamięć! Inteligentny algorytm sam decyduje, kiedy
                  powinieneś powtórzyć daną fiszkę, tuż zanim zdążysz ją
                  zapomnieć.{" "}
                  <b>
                    Oceniasz poziom trudności fiszki, a system optymalizuje Twój
                    harmonogram nauki.
                  </b>
                </p>
              </ModeCard>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "30px",
                }}
              >
                <ModalButton
                  type="button"
                  onClick={() => setIsLearningInfoModalOpen(false)}
                >
                  Rozumiem
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* RESET SESJI */}
        {isResetConfirmModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsResetConfirmModalOpen(false)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <CloseButton
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                title="Zamknij"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </CloseButton>
              <Text bold="true" as="h2" text="Trwająca sesja" />
              <Text
                text="Masz już rozpoczętą sesję nauki w tym zestawie. Co chcesz zrobić?"
                style={{
                  margin: "20px 0 30px 0",
                  color: theme.colors.textLight,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <ModalButton
                  type="button"
                  style={{ width: "85%", padding: "14px", fontSize: "1.05rem" }}
                  onClick={() => {
                    setIsResetConfirmModalOpen(false);
                    goToLearning(pendingMode);
                  }}
                >
                  Kontynuuj naukę
                </ModalButton>
                <ModalButton
                  type="button"
                  style={{
                    width: "85%",
                    padding: "14px",
                    background: "transparent",
                    border: `2px solid ${theme.colors.danger}`,
                    color: theme.colors.danger,
                    fontSize: "1.05rem",
                  }}
                  onClick={handleResetAndStart}
                >
                  Zacznij od nowa (zresetuj postępy)
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL USUWANIA FISZEK Z ZAZNACZENIA */}
        {isBulkDeleteModalOpen && (
          <>
            <ModalOverlay
              onClick={() => !isDeletingBulk && setIsBulkDeleteModalOpen(false)}
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Usuń zaznaczone fiszki" />
              <Text
                text={`Czy na pewno chcesz trwale usunąć zaznaczone fiszki (${selectedCards.length})?`}
                style={{
                  margin: "20px 0 30px 0",
                  color: theme.colors.textLight,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton
                  type="button"
                  $danger
                  onClick={executeBulkDelete}
                  disabled={isDeletingBulk}
                >
                  {isDeletingBulk ? "Usuwanie..." : "Tak, usuń"}
                </ModalButton>
                <ModalButton
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  disabled={isDeletingBulk}
                >
                  Anuluj
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL CZĘŚCIOWO PUSTYCH FISZEK */}
        {isPartialEmptyModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsPartialEmptyModalOpen(false)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <Text bold="true" as="h2" text="Puste pola!" />
              <Text
                text="Niektóre fiszki mają puste pola (pytanie lub odpowiedź). Możesz wrócić i je uzupełnić albo kontynuować – puste fiszki nie zostaną zapisane."
                style={{
                  margin: "20px 0 30px 0",
                  color: theme.colors.textLight,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ModalButton
                  type="button"
                  onClick={() => setIsPartialEmptyModalOpen(false)}
                >
                  Wróć i uzupełnij
                </ModalButton>
                <ModalButton
                  type="button"
                  $danger
                  onClick={() => {
                    setIsPartialEmptyModalOpen(false);
                    executeSaveCards(
                      pendingValidCards,
                      pendingIgnoreDuplicates
                    );
                  }}
                >
                  Kontynuuj bez nich
                </ModalButton>
              </div>
            </StyledPopup>
          </>
        )}
      </StyledContainer>
    </Layout>
  );
};

export default FlashcardsPage;
