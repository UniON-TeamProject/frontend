import styled, { useTheme } from "styled-components";
import React, { useState, useEffect } from "react";
import SubmitButton from "../components/atoms/SubmitButton";
import Text from "../components/atoms/Text";
import {
  addNote,
  deleteNote,
  clearTrash,
  restoreNote,
  getFolderSuggestedTags,
  addFolder,
  deleteFolder,
  restoreFolder,
  clearFolderTrash,
  renameNote,
  renameFolder,
  getAllDeletedNotes,
  getAllDeletedFolders,
  resolveFolderByPath,
  getNoteTags,
  addNoteTag,
  removeNoteTag,
  getNoteSuggestedTags,
  getFolderTags,
  addFolderTag,
  removeFolderTag,
  moveNote,
  moveFolder,
  getAllFolders,
  getAllNotes,
  getFolderItemsCount,
} from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, parseJwt } from "../token";
import Input from "../components/atoms/Input";
import Layout from "../components/organisms/Layout";
import AIFlashcardModal from "../components/editor/AIFlashcardModal.jsx";
import TagSelector from "../components/organisms/TagSelector";
import { Modal } from "../components/atoms/Modal";
import HelpInfoIcon from "../components/atoms/HelpIcon";

const noteNameRegex = /^[a-zA-Z0-9 _\-ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;
const folderNameRegex = /^[a-zA-Z0-9 _\-ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;
const stripEmoji = (str) => str.replace(/\p{Extended_Pictographic}/gu, "");

const StyledContainer = styled.div`
  width: 100%;
  padding: 20px 40px;
  position: relative;
  box-sizing: border-box;
  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 0.2s ease;
  min-height: calc(100vh - 70px);
  @media (max-width: 768px) {
    padding: 12px 12px;
    min-height: calc(100dvh - 70px);
  }
`;

const StyledHeader = styled.div`
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

const StyledName = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: 2.2rem;
  margin: 0;
  cursor: default;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StyledBreadcrumbPath = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 0.95rem;
  gap: 8px;
  .crumb-item {
    margin: 0;
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.text};
  }
  .separator {
    cursor: default;
    color: ${({ theme }) => theme.colors.darkGrey};
  }
  .current {
    font-weight: 700;
    cursor: default;
  }
  .clickable {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    gap: 4px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px 0 120px 0;

  display: grid;
  grid-template-columns: repeat(auto-fit, 250px);
  justify-content: center;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
    padding: 10px 0 100px 0;
  }
`;

const StyledClearTrashButton = styled.div`
  margin-left: auto;
  padding: 5px 13px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
  &.danger {
    background-color: ${({ theme }) => theme.colors.danger};
  }
  > svg {
    margin: 3px 0;
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 70px;
  height: 70px;
  background-color: ${({ theme, $danger }) =>
    $danger ? theme.colors.danger : theme.colors.white};
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

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme, $danger }) =>
      $danger ? theme.colors.white : theme.colors.secondary};
  }

  @media (max-width: 768px) {
    bottom: 80px;
    right: 16px;
    width: 54px;
    height: 54px;
    border-radius: 16px;

    svg {
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
    bottom: 142px;
    right: 15px;
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

const StyledItem = styled.div`
  width: 100%;
  max-width: 250px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 15px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: ${({ $isActive }) => ($isActive ? 50 : 1)};

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 8px 4px;

    h4 {
      font-size: 0.78rem !important;
    }
  }
`;

const StyledNoteImage = styled.div`
  width: 100px;
  height: 120px;
  margin: 0 auto 10px auto;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    width: 80%;
    height: 80%;
    /* color: ${({ theme }) => theme.colors.darkGrey}; */
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 68px;
    margin-bottom: 4px;
  }
`;

const StyledFolderImage = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 10px auto;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    width: 100%;
    height: 100%;
    color: ${({ theme }) => theme.colors.black};
  }

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    margin-bottom: 4px;
    padding: 4px;
  }
`;

const StyledItemHeaderWrapper = styled.div`
  text-align: center;
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
    z-index: 50;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const StyledItemOptions = styled.div`
  display: ${({ $active }) => ($active ? "flex" : "none")};
  flex-direction: column;
  width: ${({ $narrow }) => ($narrow ? "200px" : "280px")};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 10px;
  z-index: 20;
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

  > input {
    padding: 8px 12px;
    margin: 0 10px 15px 10px;
    width: calc(100% - 20px);
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

  > svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  margin-bottom: 10px;
  box-sizing: border-box;
  gap: 6px;

  > p {
    color: ${({ theme }) => theme.colors.darkGrey};
    font-size: 1rem;
    margin-right: 7px;
    font-weight: 600;
  }
`;

const StyledTag = styled.div`
    padding: 2px 10px;
    margin: 3px;
    background-color: ${({ theme, $inactive }) =>
      $inactive ? theme.colors.borderLight : theme.colors.secondary};
    border-radius: 10px;
    color: ${({ theme, $inactive }) =>
      $inactive ? theme.colors.textLight : theme.colors.white};
    font-weight: 500;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    cursor: ${({ $inactive }) => ($inactive ? "pointer" : "default")};
    transition: all 0.2s;

    &:hover {
        opacity: 0.8;
    }

    > div {
        cursor: pointer;
        font-weight: 700;
        font-size: 1rem;
        margin-left: 6px;
        line-height: 1;
        display: ${({ $inactive }) => ($inactive ? "none" : "block")};
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
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const StyledTreeItem = styled.div`
  padding-left: ${({ $depth }) => $depth * 20}px;
`;

const StyledTreeItemLabel = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 5px;
  background-color: ${({ $selected, $disabled, theme }) =>
    $disabled
      ? theme.colors.lightGrey
      : $selected
      ? theme.colors.primary
      : "transparent"};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
  &:hover {
    background-color: ${({ $selected, $disabled, theme }) =>
      $disabled
        ? undefined
        : $selected
        ? theme.colors.primary
        : theme.colors.lightGrey};
  }
  > svg {
    width: 16px;
    margin-right: 6px;
    flex-shrink: 0;
  }
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
`;

const DropdownSectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  margin-top: 5px;
  padding: 0 10px;
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
    border-radius: 12px;

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

const StyledSearchDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.lightGrey};
  margin: 4px 0;
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

const BackButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.darkGrey};
  transition: color 0.2s;

  user-select: none;
  -webkit-user-select: none;

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


const EllipsisIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
);

const Notes = () => {
  const theme = useTheme();
  const params = useParams();
  const urlPath = params["*"] || "";
  const isTrashView = urlPath === "trash" || urlPath.startsWith("trash/");
  const folderPath = isTrashView ? urlPath.replace(/^trash\/?/, "") : urlPath;
  const pathSegments = folderPath ? folderPath.split("/").filter(Boolean) : [];

  const [username, setUsername] = useState(undefined);
  const [noteName, setNoteName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [notes, setNotes] = useState([]);
  const [activeFolderOptionsId, setActiveFolderOptionsId] = useState(null);
  const [addNoteErrorMessage, setAddNoteErrorMessage] = useState("");
  const [addFolderErrorMessage, setAddFolderErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeNoteOptionsId, setActiveNoteOptionsId] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isActiveAddOptions, setIsActiveAddOptions] = useState(false);
  const [isActivePathOptions, setIsActivePathOptions] = useState(false);
  const [isConfirmingTrashClear, setIsConfirmingTrashClear] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [trashHasItems, setTrashHasItems] = useState(false);
  const [noteNameErrorMessage, setNoteNameErrorMessage] = useState("");
  const [folderNameErrorMessage, setFolderNameErrorMessage] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [chosenTags, setChosenTags] = useState([]);
  const navigate = useNavigate();
  const breadcrumbs = pathSegments.map((s) => decodeURIComponent(s));
  const [currentFolder, setCurrentFolder] = useState(null);
  const [subFolders, setSubFolders] = useState([]);
  const [editingName, setEditingName] = useState("");
  const [flipLeft, setFlipLeft] = useState(false);
  const [centerBelow, setCenterBelow] = useState(false);
  const [itemTags, setItemTags] = useState([]);
  const [itemSuggestedTags, setItemSuggestedTags] = useState([]);
  const [isAddingItemTag, setIsAddingItemTag] = useState(false);
  const [newItemTag, setNewItemTag] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [movingItem, setMovingItem] = useState(null);
  const [moveTree, setMoveTree] = useState([]);
  const [expandedMoveIds, setExpandedMoveIds] = useState(new Set());
  const [selectedMovePath, setSelectedMovePath] = useState(null);
  const [moveErrorMessage, setMoveErrorMessage] = useState("");
  const [aiModalNoteId, setAiModalNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState({
    notes: [],
    folders: [],
  });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isSuccess, setIsSuccess] = useState(false);
  const [folderCounts, setFolderCounts] = useState({});

  //czytamy z localstorage ostatni wybor i zapamietujemy
  const [sortOption, setSortOption] = useState(() => {
    return localStorage.getItem("notesSortOption") || "recent";
  });
  useEffect(() => {
    localStorage.setItem("notesSortOption", sortOption);
  }, [sortOption]);

  const [selectedTagsFilter, setSelectedTagsFilter] = useState([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filterDropdownY, setFilterDropdownY] = useState(0);

  const allAvailableTags = [
    ...new Set([
      ...subFolders.flatMap((f) => f.tags || []),
      ...notes.flatMap((n) => n.tags || []),
    ]),
  ].sort();

  const filterByTags = (items) => {
    if (selectedTagsFilter.length === 0) return items;
    return items.filter((item) =>
      selectedTagsFilter.every((tag) => item.tags?.includes(tag))
    );
  };

  const handleFetchItemTags = async (id, type) => {
    const suggestedId = type === "folder" ? id : currentFolder?.id;
    const [tagsRes, suggestedRes] = await Promise.all([
      type === "folder" ? getFolderTags(id) : getNoteTags(id),
      suggestedId
        ? type === "folder"
          ? getFolderSuggestedTags(suggestedId)
          : getNoteSuggestedTags(suggestedId)
        : Promise.resolve({ tags: [], errorCode: "", message: "" }),
    ]);
    if (!tagsRes.errorCode) setItemTags(tagsRes.tags || []);
    else setItemTags([]);
    if (!suggestedRes.errorCode) setItemSuggestedTags(suggestedRes.tags || []);
    else setItemSuggestedTags([]);
  };

  const handleAddItemTag = async (id, tagName, type) => {
    const res =
      type === "folder"
        ? await addFolderTag(id, tagName)
        : await addNoteTag(id, tagName);
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await handleFetchItemTags(id, type);
    }
  };

  const handleRemoveItemTag = async (id, tagName, type) => {
    const res =
      type === "folder"
        ? await removeFolderTag(id, tagName)
        : await removeNoteTag(id, tagName);
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await handleFetchItemTags(id, type);
    }
  };

  const buildFolderTree = (folders) => {
    const nonRoot = folders.filter((f) => !(f.name === "/" && f.path === "/"));
    const byFullPath = {};
    const enriched = nonRoot.map((f) => {
      const fullPath = f.path === "/" ? "/" + f.name : f.path + "/" + f.name;
      const node = { ...f, fullPath, children: [] };
      byFullPath[fullPath] = node;
      return node;
    });
    const roots = [];
    enriched.forEach((node) => {
      if (node.path === "/") {
        roots.push(node);
      } else if (byFullPath[node.path]) {
        byFullPath[node.path].children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const handleOpenMovePopup = async (id, type, name) => {
    setMovingItem({ id, type, name });
    setSelectedMovePath(null);
    setMoveErrorMessage("");
    setExpandedMoveIds(new Set());
    const res = await getAllFolders();
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      setMoveErrorMessage(res.message);
      setMoveTree([]);
    } else {
      setMoveTree(buildFolderTree(res.folders || []));
    }
    setIsMoving(true);
    setActiveFolderOptionsId(null);
    setActiveNoteOptionsId(null);
  };

  const handleMove = async () => {
    if (!movingItem || selectedMovePath === null) return;
    setMoveErrorMessage("");
    const res =
      movingItem.type === "note"
        ? await moveNote(movingItem.id, selectedMovePath)
        : await moveFolder(movingItem.id, selectedMovePath);

    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      setMoveErrorMessage(res.message);
    } else {
      setIsSuccess(true);
      setTimeout(async () => {
        setIsSuccess(false);
        setIsMoving(false);
        setMovingItem(null);
        await refreshCurrentView();
      }, 1000);
    }
  };

  const renderMoveTree = (nodes, depth = 1) => {
    return nodes.map((node) => {
      const nodePath = node.fullPath;
      const isExpanded = expandedMoveIds.has(node.id);
      const isSelected = selectedMovePath === nodePath;
      const isCurrentFolder = currentFolder && currentFolder.id === node.id;
      const isMovingThis =
        movingItem?.type === "folder" && movingItem.id === node.id;
      const isDisabled = isCurrentFolder || isMovingThis;

      return (
        <React.Fragment key={node.id}>
          <StyledTreeItem $depth={depth}>
            <StyledTreeItemLabel
              $selected={isSelected}
              $disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) setSelectedMovePath(nodePath);
              }}
            >
              {node.children && node.children.length > 0 && (
                <svg
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  style={{
                    cursor: "pointer",
                    transform: isExpanded ? "rotate(90deg)" : "none",
                    transition: "transform 0.15s",
                    pointerEvents: "auto",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMoveIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(node.id)) next.delete(node.id);
                      else next.add(node.id);
                      return next;
                    });
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                  />
                </svg>
              )}
              {(!node.children || node.children.length === 0) && (
                <span
                  style={{
                    width: 16,
                    marginRight: 6,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
              )}
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
              </svg>
              <span style={{ marginLeft: 4 }}>{node.name}</span>
            </StyledTreeItemLabel>
          </StyledTreeItem>
          {isExpanded &&
            node.children &&
            renderMoveTree(node.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const handleRenameNote = async (id, newName) => {
    setErrorMessage("");
    const result = await renameNote(id, newName);
    if (result.errorCode) {
      setErrorMessage(result.message);
      if (result.errorCode === "TOKEN_UNDEFINED")
        navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const handleRenameFolder = async (id, newName) => {
    setErrorMessage("");
    const result = await renameFolder(id, newName);
    if (result.errorCode) {
      setErrorMessage(result.message);
      if (result.errorCode === "TOKEN_UNDEFINED")
        navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const sortNotes = (notes) => {
    return [...notes].sort((a, b) => {
      const dateA = new Date(a.editTime ?? 0);
      const dateB = new Date(b.editTime ?? 0);
      return dateB - dateA;
    });
  };

  const fetchForCurrentUrl = async () => {
    setErrorMessage("");
    setIsLoading(true);
    const res = await resolveFolderByPath(pathSegments, isTrashView);
    if (res.errorCode === "TOKEN_UNDEFINED") {
      navigate("/", { replace: true });
      setIsLoading(false);
      return;
    }
    if (res.errorCode === "PATH_NOT_FOUND") {
      navigate(isTrashView ? "/notes/trash" : "/notes", { replace: true });
      setIsLoading(false);
      return;
    }
    if (res.errorCode) {
      setErrorMessage(res.message);
      setIsLoading(false);
      return;
    }
    setCurrentFolder(res.currentFolder);
    setNotes(sortNotes(res.notes || []));
    if (isTrashView && pathSegments.length === 0) {
      setTrashHasItems(res.subFolders?.length > 0 || res.notes?.length > 0);
    }

    const folders = res.subFolders || [];
    if (!isTrashView && folders.length > 0) {
      const counts = {};
      await Promise.all(
        folders.map(async (folder) => {
          const r = await getFolderItemsCount(folder.id);
          if (!r.errorCode) counts[folder.id] = r.count;
        })
      );
      setFolderCounts(counts);
    } else {
      setFolderCounts({});
    }
    setSubFolders(folders);
    setIsLoading(false);
  };

  const handleOpenFolder = (folder) => {
    if (activeFolderOptionsId !== null || activeNoteOptionsId !== null) return;
    setSearchQuery("");
    if (isTrashView) {
      const segments =
        folder.path === "/"
          ? [folder.name]
          : [...folder.path.split("/").filter(Boolean), folder.name];
      navigate(`/notes/trash/${segments.map(encodeURIComponent).join("/")}`);
    } else {
      const encodedName = encodeURIComponent(folder.name);
      const newUrl = urlPath
        ? `/notes/${urlPath}/${encodedName}`
        : `/notes/${encodedName}`;
      navigate(newUrl);
    }
  };

  const handleBreadcrumbClick = (index) => {
    setSearchQuery("");
    if (index === -1) {
      navigate(isTrashView ? "/notes/trash" : "/notes");
    } else {
      const segments = breadcrumbs
        .slice(0, index + 1)
        .map((b) => encodeURIComponent(b));
      const newPath = segments.join("/");
      navigate(isTrashView ? `/notes/trash/${newPath}` : `/notes/${newPath}`);
    }
  };

  const refreshCurrentView = () => {
    fetchForCurrentUrl();
  };

  const getCurrentPath = () => {
    if (pathSegments.length === 0) return "/";
    return "/" + pathSegments.map((s) => decodeURIComponent(s)).join("/");
  };

  const handleAddNote = async () => {
    setAddNoteErrorMessage("");
    const res = await addNote(noteName.trim(), getCurrentPath(), chosenTags);
    if (res.errorCode) {
      setAddNoteErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      const newNoteId = res.id;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddingNote(false);
        setNoteName("");
        setChosenTags([]);
        setSuggestedTags([]);
        navigate(`/note/${newNoteId}`);
      }, 1000);
    }
  };

  const handleDeleteNote = async (id) => {
    setErrorMessage("");
    const res = await deleteNote(id);
    if (res.errorCode) {
      setErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const handleRestoreNote = async (id) => {
    setErrorMessage("");
    const res = await restoreNote(id);
    if (res.errorCode) {
      setErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const handleClearTrash = async () => {
    setErrorMessage("");
    const res = await clearTrash();
    if (res.errorCode) {
      setErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const handleDeleteFolder = async (id) => {
    setErrorMessage("");
    const res = await deleteFolder(id);
    if (res.errorCode) {
      setErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "note") await handleDeleteNote(itemToDelete.id);
    else await handleDeleteFolder(itemToDelete.id);
    setItemToDelete(null);
  };

  const handleRestoreFolder = async (id) => {
    setErrorMessage("");
    const res = await restoreFolder(id);
    if (res.errorCode) {
      setErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const handleClearFolderTrash = async () => {
    setErrorMessage("");
    const res = await clearFolderTrash();
    if (res.errorCode) {
      setErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      await refreshCurrentView();
    }
  };

  const handleFetchFolderSuggestedTags = async () => {
    setAddFolderErrorMessage("");
    const res = await getFolderSuggestedTags(currentFolder?.id);
    if (res.errorCode) {
      setAddFolderErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      setSuggestedTags(res.tags);
      setChosenTags(res.tags);
    }
  };

  const handleAddFolder = async () => {
    setAddFolderErrorMessage("");
    const res = await addFolder(
      folderName.trim(),
      getCurrentPath(),
      chosenTags
    );
    if (res.errorCode) {
      setAddFolderErrorMessage(res.message);
      if (res.errorCode == "TOKEN_UNDEFINED") navigate("/", { replace: true });
    } else {
      setIsSuccess(true);
      setTimeout(async () => {
        setIsSuccess(false);
        setIsAddingFolder(false);
        setFolderName("");
        setChosenTags([]);
        setSuggestedTags([]);
        await refreshCurrentView();
      }, 1000);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setGlobalSearchResults({ notes: [], folders: [] });
      return;
    }
    setIsSearchLoading(true);
    const timer = setTimeout(async () => {
      const lower = q.toLowerCase();
      const [notesRes, foldersRes] = await Promise.all([
        getAllNotes(),
        getAllFolders(),
      ]);
      const notes = notesRes.errorCode
        ? []
        : notesRes.notes.filter((n) => n.name.toLowerCase().includes(lower));
      const folders = foldersRes.errorCode
        ? []
        : (foldersRes.folders || [])
            .filter((f) => !(f.name === "/" && f.path === "/"))
            .filter((f) => f.name.toLowerCase().includes(lower));
      setGlobalSearchResults({ notes, folders });
      setIsSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let jwt = getToken();
    if (!jwt) return;

    let tokenContent = parseJwt(jwt);
    setUsername(tokenContent?.sub);

    fetchForCurrentUrl();
  }, [urlPath]);

  const getVisualSortedItems = (items) => {
    const sorted = [...items];

    if (sortOption === "recent") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.editTime ?? 0).getTime();
        const dateB = new Date(b.editTime ?? 0).getTime();
        // dla folderow jesli nie maja edittime:
        if (dateA === 0 && dateB === 0) return (b.id || 0) - (a.id || 0);
        return dateB - dateA;
      });
    } else if (sortOption === "newest") {
      //od najnowszych najwyższe id
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortOption === "oldest") {
      //od najstarszych najmniejsze id
      sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (sortOption === "alphabetical") {
      //alfabetycznie
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return sorted;
  };

  const getElementsCountWord = (count) => {
    if (count === 1) return "plik";
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (
      lastDigit >= 2 &&
      lastDigit <= 4 &&
      (lastTwoDigits < 12 || lastTwoDigits > 14)
    ) {
      return "pliki";
    }
    return "plików";
  };

  return (
    <Layout>
      <StyledContainer
        $ready={!isLoading}
        onClick={() => {
          setActiveNoteOptionsId(null);
          setActiveFolderOptionsId(null);
          setIsAddingNote(false);
          setIsAddingFolder(false);
          setIsActiveAddOptions(false);
          setIsActivePathOptions(false);
          setIsConfirmingTrashClear(false);
          setItemTags([]);
          setItemSuggestedTags([]);
          setIsAddingItemTag(false);
          setNewItemTag("");
          setIsMoving(false);
          setMovingItem(null);
          setMoveErrorMessage("");
          setIsFilterMenuOpen(false);
        }}
      >
        <StyledHeader>
          {pathSegments.length === 0 ? (
            <StyledName>Notatki</StyledName>
          ) : (
            <BackButton
              onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
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
              Powrót
            </BackButton>
          )}
          <SearchWrapper>
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
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
              />
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <StyledSearchDropdown>
                  {isSearchLoading ? (
                    <StyledSearchEmpty>Szukam...</StyledSearchEmpty>
                  ) : globalSearchResults.folders.length === 0 &&
                    globalSearchResults.notes.length === 0 ? (
                    <StyledSearchEmpty>
                      Brak wyników dla „{searchQuery}"
                    </StyledSearchEmpty>
                  ) : (
                    <>
                      {globalSearchResults.folders.length > 0 && (
                        <>
                          <StyledSearchSectionTitle>
                            Foldery
                          </StyledSearchSectionTitle>
                          {globalSearchResults.folders.map((f) => {
                            const fullPath =
                              f.path === "/"
                                ? "/" + f.name
                                : f.path + "/" + f.name;
                            const segments = fullPath.substring(1).split("/");
                            const url =
                              "/notes/" +
                              segments
                                .map((s) => encodeURIComponent(s))
                                .join("/");
                            return (
                              <StyledSearchResultItem
                                key={f.id}
                                onClick={() => {
                                  setSearchQuery("");
                                  setIsSearchFocused(false);
                                  navigate(url);
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                                </svg>
                                <StyledSearchResultInfo>
                                  <StyledSearchResultName>
                                    {f.name}
                                  </StyledSearchResultName>
                                  <StyledSearchResultPath>
                                    {f.path}
                                  </StyledSearchResultPath>
                                </StyledSearchResultInfo>
                              </StyledSearchResultItem>
                            );
                          })}
                        </>
                      )}
                      {globalSearchResults.folders.length > 0 &&
                        globalSearchResults.notes.length > 0 && (
                          <StyledSearchDivider />
                        )}
                      {globalSearchResults.notes.length > 0 && (
                        <>
                          <StyledSearchSectionTitle>
                            Notatki
                          </StyledSearchSectionTitle>
                          {globalSearchResults.notes.map((n) => (
                            <StyledSearchResultItem
                              key={n.id}
                              onClick={() => {
                                setSearchQuery("");
                                setIsSearchFocused(false);
                                navigate(`/note/${n.id}`);
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5m0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"
                                />
                              </svg>
                              <StyledSearchResultInfo>
                                <StyledSearchResultName>
                                  {n.name}
                                </StyledSearchResultName>
                              </StyledSearchResultInfo>
                            </StyledSearchResultItem>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </StyledSearchDropdown>
              )}
            </StyledSearchInput>
          </SearchWrapper>
        </StyledHeader>
        {errorMessage && <Text color="danger" text={errorMessage} />}
        <StyledToolbar>
          <StyledTabsContainer>
            <StyledTab
              $active={!isTrashView}
              onClick={() => navigate("/notes")}
            >
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
              </svg>
              <TabLabel>Moje pliki</TabLabel>
            </StyledTab>
            <StyledTab
              $active={isTrashView}
              onClick={() => navigate("/notes/trash")}
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
                  disabled={subFolders.length === 0 && notes.length === 0}
                  title={
                    subFolders.length === 0 && notes.length === 0
                      ? "Brak elementów do filtrowania"
                      : ""
                  }
                  onClick={(e) => {
                    if (subFolders.length === 0 && notes.length === 0) return;
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setFilterDropdownY(rect.bottom + 8);
                    setIsFilterMenuOpen(!isFilterMenuOpen);
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    style={{
                      opacity:
                        subFolders.length === 0 && notes.length === 0 ? 0.5 : 1,
                    }}
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
                  <FilterDropdown
                    $filterDropdownY={filterDropdownY}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text
                      bold="true"
                      text="Filtruj po tagach"
                      style={{ fontSize: "0.95rem", margin: "0 0 5px 5px" }}
                    />

                    {allAvailableTags.length === 0 ? (
                      <Text
                        text="Brak przypisanych tagów do folderów i notatek."
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

            {(subFolders.length > 0 || notes.length > 0) && !isTrashView && (
              <SortSelectContainer>
                <SortSelect
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="recent">↓ Sortuj: Ostatnio edytowane</option>
                  <option value="newest">↓ Sortuj: Od najnowszych</option>
                  <option value="oldest">↑ Sortuj: Od najstarszych</option>
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
              <HelpInfoIcon  tooltipAlign="right" tooltip="Pliki w koszu są przechowywane przez 30 dni, po czym ulegają automatycznemu usunięciu." />
            )}
          </ToolbarActions>
        </StyledToolbar>
        <div
          style={{
            minHeight: "35px",
            marginBottom: "5px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {(currentFolder || (isTrashView && breadcrumbs.length > 0)) && (
            <StyledBreadcrumbPath>
              <p
                className="crumb-item clickable"
                onClick={() => handleBreadcrumbClick(-1)}
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  style={{ transform: "translateY(-1px)" }}
                >
                  <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
                </svg>
              </p>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <p className="crumb-item separator">/</p>
                  {index === breadcrumbs.length - 1 ? (
                    <p className="crumb-item current">{crumb}</p>
                  ) : (
                    <p
                      className="crumb-item clickable"
                      onClick={() => handleBreadcrumbClick(index)}
                    >
                      {crumb}
                    </p>
                  )}
                </React.Fragment>
              ))}
            </StyledBreadcrumbPath>
          )}
        </div>
        <ContentContainer>
          {!isLoading && subFolders.length === 0 && notes.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                width: "100%",
                padding: "60px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "12px",
                color: "inherit",
                opacity: 0.4,
              }}
            >
              {isTrashView && breadcrumbs.length === 0 ? (
                <>
                  <svg
                    width="48"
                    height="48"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                  </svg>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                    Kosz jest pusty
                  </p>
                </>
              ) : (
                <>
                  <svg
                    width="48"
                    height="48"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                  </svg>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                    Ten folder jest pusty
                  </p>
                </>
              )}
            </div>
          )}
          {getVisualSortedItems(
            filterByTags(
              subFolders.filter((f) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            )
          ).map((folder) => {
            const totalItems = folderCounts[folder.id];

            return (
              <StyledItem
                key={`folder-${folder.id}`}
                $isActive={activeFolderOptionsId === folder.id}
              >
                <StyledFolderImage onClick={() => handleOpenFolder(folder)}>
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                  </svg>
                </StyledFolderImage>
                <StyledItemHeaderWrapper>
                  <div
                    onClick={() => handleOpenFolder(folder)}
                    style={{ cursor: "pointer" }}
                  >
                    <Text
                      as="h4"
                      bold="true"
                      text={folder.name}
                      style={{ marginBottom: "4px", fontSize: "1.05rem" }}
                    />

                    {totalItems !== undefined && (
                      <Text
                        text={`${totalItems} ${getElementsCountWord(
                          totalItems
                        )}`}
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          margin: 0,
                          padding: 0,
                        }}
                      />
                    )}
                  </div>

                  <StyledItemHeader
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNoteOptionsId(null);
                      if (!isTrashView && activeFolderOptionsId !== folder.id) {
                        setEditingName(folder.name);
                        handleFetchItemTags(folder.id, "folder");
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const fitsRight =
                        rect.right + 10 + 350 <= window.innerWidth;
                      const fitsLeft = rect.left - 10 - 350 >= 0;
                      setCenterBelow(!fitsRight && !fitsLeft);
                      setFlipLeft(!fitsRight && fitsLeft);
                      setIsAddingItemTag(false);
                      setNewItemTag("");
                      setActiveFolderOptionsId(
                        activeFolderOptionsId === folder.id ? null : folder.id
                      );
                    }}
                  >
                    <EllipsisIcon />
                    <StyledItemOptions
                      $active={activeFolderOptionsId === folder.id}
                      $flipLeft={flipLeft}
                      $centerBelow={centerBelow}
                      $narrow={isTrashView}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isTrashView ? (
                        <StyledItemOption
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreFolder(folder.id);
                            setActiveFolderOptionsId(null);
                          }}
                        >
                          Przywróć folder
                        </StyledItemOption>
                      ) : (
                        <>
                          <DropdownSectionLabel>Nazwa</DropdownSectionLabel>
                          <input
                            value={editingName}
                            maxLength={55}
                            onChange={(e) =>
                              setEditingName(stripEmoji(e.target.value))
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                editingName.trim() &&
                                editingName !== folder.name
                              ) {
                                handleRenameFolder(
                                  folder.id,
                                  editingName.trim()
                                );
                                setActiveFolderOptionsId(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <DropdownSectionLabel>Tagi</DropdownSectionLabel>
                          <TagsContainer
                            style={{
                              justifyContent: "flex-start",
                              margin: "0 10px 10px 10px",
                            }}
                          >
                            {itemTags.map((tag, index) => (
                              <StyledTag key={`ft-${index}`}>
                                {tag}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItemTag(
                                      folder.id,
                                      tag,
                                      "folder"
                                    );
                                  }}
                                >
                                  ×
                                </div>
                              </StyledTag>
                            ))}
                            {itemSuggestedTags
                              .filter((t) => !itemTags.includes(t))
                              .map((tag, index) => (
                                <StyledTag
                                  $inactive
                                  key={`fst-${index}`}
                                  onClick={() =>
                                    handleAddItemTag(folder.id, tag, "folder")
                                  }
                                >
                                  {tag}
                                </StyledTag>
                              ))}
                            {isAddingItemTag ? (
                              <StyledTagInput
                                autoFocus
                                maxLength={55}
                                value={newItemTag}
                                onChange={(e) => setNewItemTag(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && newItemTag.trim()) {
                                    handleAddItemTag(
                                      folder.id,
                                      newItemTag.trim(),
                                      "folder"
                                    );
                                    setNewItemTag("");
                                    setIsAddingItemTag(false);
                                  }
                                  if (e.key === "Escape") {
                                    setIsAddingItemTag(false);
                                    setNewItemTag("");
                                  }
                                }}
                                onBlur={() => setIsAddingItemTag(false)}
                              />
                            ) : (
                              <StyledAddTagButton
                                onClick={() => setIsAddingItemTag(true)}
                              >
                                + Dodaj
                              </StyledAddTagButton>
                            )}
                          </TagsContainer>

                          <div
                            style={{
                              height: "1px",
                              background: theme.colors.borderLight,
                              margin: "5px 0",
                            }}
                          ></div>

                          <StyledItemOption
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMovePopup(
                                folder.id,
                                "folder",
                                folder.name
                              );
                            }}
                          >
                            <svg fill="currentColor" viewBox="0 0 16 16">
                              <path
                                fillRule="evenodd"
                                d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                              />
                            </svg>
                            Przenieś
                          </StyledItemOption>
                          <StyledItemOption
                            className="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete({
                                id: folder.id,
                                type: "folder",
                                name: folder.name,
                              });
                              setActiveFolderOptionsId(null);
                            }}
                          >
                            <svg fill="currentColor" viewBox="0 0 16 16">
                              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                            </svg>
                            Usuń folder
                          </StyledItemOption>
                        </>
                      )}
                    </StyledItemOptions>
                  </StyledItemHeader>
                </StyledItemHeaderWrapper>
              </StyledItem>
            );
          })}
          {getVisualSortedItems(
            filterByTags(
              notes.filter((d) =>
                d.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            )
          ).map((d) => {
            const dateObj = new Date(d.editTime ?? d.lastEdited);
            const formattedDate = dateObj.toLocaleString("pl-PL", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return (
              <StyledItem key={d.id} $isActive={activeNoteOptionsId === d.id}>
                <StyledNoteImage
                  onClick={() => {
                    if (
                      activeFolderOptionsId !== null ||
                      activeNoteOptionsId !== null
                    )
                      return;
                    if (!isTrashView) navigate(`/note/${d.id}`);
                  }}
                >
                  {/* <svg fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5m0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                    </svg> */}
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                  </svg>
                </StyledNoteImage>
                <StyledItemHeaderWrapper>
                  <div
                    onClick={() => {
                      if (
                        activeFolderOptionsId !== null ||
                        activeNoteOptionsId !== null
                      )
                        return;
                      if (!isTrashView) navigate(`/note/${d.id}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Text
                      as="h4"
                      bold="true"
                      text={d.name}
                      style={{ marginBottom: "4px", fontSize: "1.05rem" }}
                    />
                  </div>

                  <StyledItemHeader
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFolderOptionsId(null);
                      if (!isTrashView && activeNoteOptionsId !== d.id) {
                        setEditingName(d.name);
                        handleFetchItemTags(d.id, "note");
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const fitsRight =
                        rect.right + 10 + 350 <= window.innerWidth;
                      const fitsLeft = rect.left - 10 - 350 >= 0;
                      setCenterBelow(!fitsRight && !fitsLeft);
                      setFlipLeft(!fitsRight && fitsLeft);
                      setIsAddingItemTag(false);
                      setNewItemTag("");
                      setActiveNoteOptionsId(
                        activeNoteOptionsId === d.id ? null : d.id
                      );
                    }}
                  >
                    <EllipsisIcon />
                    <StyledItemOptions
                      $active={activeNoteOptionsId === d.id}
                      $flipLeft={flipLeft}
                      $centerBelow={centerBelow}
                      $narrow={isTrashView}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isTrashView ? (
                        <StyledItemOption
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreNote(d.id);
                            setActiveNoteOptionsId(null);
                          }}
                        >
                          Przywróć dokument
                        </StyledItemOption>
                      ) : (
                        <>
                          <DropdownSectionLabel>Nazwa</DropdownSectionLabel>
                          <input
                            value={editingName}
                            maxLength={55}
                            onChange={(e) =>
                              setEditingName(stripEmoji(e.target.value))
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                editingName.trim() &&
                                editingName !== d.name
                              ) {
                                handleRenameNote(d.id, editingName.trim());
                                setActiveNoteOptionsId(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <DropdownSectionLabel>Tagi</DropdownSectionLabel>
                          <TagsContainer
                            style={{
                              justifyContent: "flex-start",
                              margin: "0 10px 10px 10px",
                            }}
                          >
                            {itemTags.map((tag, index) => (
                              <StyledTag key={`nt-${index}`}>
                                {tag}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItemTag(d.id, tag, "note");
                                  }}
                                >
                                  ×
                                </div>
                              </StyledTag>
                            ))}
                            {itemSuggestedTags
                              .filter((t) => !itemTags.includes(t))
                              .map((tag, index) => (
                                <StyledTag
                                  $inactive
                                  key={`nst-${index}`}
                                  onClick={() =>
                                    handleAddItemTag(d.id, tag, "note")
                                  }
                                >
                                  {tag}
                                </StyledTag>
                              ))}
                            {isAddingItemTag ? (
                              <StyledTagInput
                                autoFocus
                                maxLength={55}
                                value={newItemTag}
                                onChange={(e) => setNewItemTag(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && newItemTag.trim()) {
                                    handleAddItemTag(
                                      d.id,
                                      newItemTag.trim(),
                                      "note"
                                    );
                                    setNewItemTag("");
                                    setIsAddingItemTag(false);
                                  }
                                }}
                                onBlur={() => setIsAddingItemTag(false)}
                              />
                            ) : (
                              <StyledAddTagButton
                                onClick={() => setIsAddingItemTag(true)}
                              >
                                + Dodaj
                              </StyledAddTagButton>
                            )}
                          </TagsContainer>

                          <div
                            style={{
                              height: "1px",
                              background: theme.colors.borderLight,
                              margin: "5px 0",
                            }}
                          ></div>

                          <StyledItemOption
                            onClick={(e) => {
                              e.stopPropagation();
                              setAiModalNoteId(d.id);
                              setActiveNoteOptionsId(null);
                            }}
                          >
                            <svg fill="currentColor" viewBox="0 0 16 16">
                              <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
                            </svg>
                            Stwórz fiszki AI
                          </StyledItemOption>

                          <StyledItemOption
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMovePopup(d.id, "note", d.name);
                            }}
                          >
                            <svg fill="currentColor" viewBox="0 0 16 16">
                              <path
                                fillRule="evenodd"
                                d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                              />
                            </svg>
                            Przenieś
                          </StyledItemOption>
                          <StyledItemOption
                            className="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete({
                                id: d.id,
                                type: "note",
                                name: d.name,
                              });
                              setActiveNoteOptionsId(null);
                            }}
                          >
                            <svg fill="currentColor" viewBox="0 0 16 16">
                              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                            </svg>
                            Usuń dokument
                          </StyledItemOption>
                        </>
                      )}
                    </StyledItemOptions>
                  </StyledItemHeader>
                </StyledItemHeaderWrapper>
                <Text
                  text={formattedDate}
                  style={{
                    marginTop: "auto",
                    marginBottom: 0,
                    color: theme.colors.textMuted,
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    padding: 0,
                  }}
                />
              </StyledItem>
            );
          })}
        </ContentContainer>

        {isAddingNote && (
          <Modal onClose={() => setIsAddingNote(false)}>
              <Text
                bold="true"
                as="h2"
                text="Nowy dokument"
                style={{ textAlign: "center", marginBottom: "20px" }}
              />
              {addNoteErrorMessage && (
                <Text color="danger" text={addNoteErrorMessage} />
              )}
              {noteNameErrorMessage && (
                <Text color="danger" text={noteNameErrorMessage} />
              )}

              <div style={{ marginBottom: "30px" }}>
                <Input
                  autoFocus
                  type="text"
                  name="name"
                  placeholder="Nazwa dokumentu"
                  value={noteName}
                  maxLength={55}
                  mode={noteNameErrorMessage ? "error" : "normal"}
                  onChange={(e) => {
                    setNoteName(stripEmoji(e.target.value));
                    setNoteNameErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const trimmed = noteName.trim();
                      if (!trimmed) {
                        setNoteNameErrorMessage("Wypełnij pole");
                        return;
                      }
                      if (!noteNameRegex.test(trimmed)) {
                        setNoteNameErrorMessage(
                          "Nazwa może zawierać tylko litery, cyfry, spacje, _ i -"
                        );
                        return;
                      }
                      handleAddNote();
                    }
                  }}
                />
              </div>

              <TagSelector
                suggestedTags={suggestedTags}
                chosenTags={chosenTags}
                isAddingTag={isAddingTag}
                newTag={newTag}
                onToggleTag={(tag) => {
                  setChosenTags((prev) => [...prev, tag]);
                }}
                onAddNewTag={(tag) => {
                  if (!chosenTags.includes(tag)) {
                    setChosenTags((prev) => [...prev, tag]);
                  }
                }}
                onRemoveTag={(tag) => {
                  setChosenTags((prev) => prev.filter((t) => t !== tag));
                }}
                onSetIsAddingTag={setIsAddingTag}
                onSetNewTag={setNewTag}
              />

              <div style={{ display: "flex", justifyContent: "center" }}>
                <SubmitButton
                  text={isSuccess ? "✔ Utworzono!" : "Stwórz dokument"}
                  color={isSuccess ? "secondary" : "dark"}
                  onClick={(e) => {
                    e.preventDefault();
                    const trimmed = noteName.trim();
                    if (!trimmed) {
                      setNoteNameErrorMessage("Wypełnij pole");
                      return;
                    }
                    if (!noteNameRegex.test(trimmed)) {
                      setNoteNameErrorMessage(
                        "Nazwa może zawierać tylko litery, cyfry, spacje, _ i -"
                      );
                      return;
                    }
                    handleAddNote();
                  }}
                />
              </div>
          </Modal>
        )}

        {isAddingFolder && (
          <Modal onClose={() => setIsAddingFolder(false)}>
              <Text
                bold="true"
                as="h2"
                text="Nowy folder"
                style={{ textAlign: "center", marginBottom: "20px" }}
              />
              {addFolderErrorMessage && (
                <Text color="danger" text={addFolderErrorMessage} />
              )}
              {folderNameErrorMessage && (
                <Text color="danger" text={folderNameErrorMessage} />
              )}

              <div style={{ marginBottom: "20px" }}>
                <Input
                  autoFocus
                  type="text"
                  name="name"
                  placeholder="Nazwa folderu"
                  value={folderName}
                  maxLength={55}
                  mode={folderNameErrorMessage ? "error" : "normal"}
                  onChange={(e) => {
                    setFolderName(stripEmoji(e.target.value));
                    setFolderNameErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const trimmed = folderName.trim();
                      if (!trimmed) {
                        setFolderNameErrorMessage("Wypełnij pole");
                        return;
                      }
                      if (!folderNameRegex.test(trimmed)) {
                        setFolderNameErrorMessage(
                          "Nazwa może zawierać tylko litery, cyfry, spacje, _ i -"
                        );
                        return;
                      }
                      handleAddFolder();
                    }
                  }}
                />
              </div>
              <TagSelector
                suggestedTags={suggestedTags}
                chosenTags={chosenTags}
                isAddingTag={isAddingTag}
                newTag={newTag}
                onToggleTag={(tag) => {
                  setChosenTags((prev) => [...prev, tag]);
                }}
                onAddNewTag={(tag) => {
                  if (!chosenTags.includes(tag)) {
                    setChosenTags((prev) => [...prev, tag]);
                  }
                }}
                onRemoveTag={(tag) => {
                  setChosenTags((prev) => prev.filter((t) => t !== tag));
                }}
                onSetIsAddingTag={setIsAddingTag}
                onSetNewTag={setNewTag}
              />

              <div style={{ display: "flex", justifyContent: "center" }}>
                <SubmitButton
                  text={isSuccess ? "✔ Utworzono!" : "Stwórz folder"}
                  color={isSuccess ? "secondary" : "dark"}
                  onClick={(e) => {
                    e.preventDefault();
                    const trimmed = folderName.trim();
                    if (!trimmed) {
                      setFolderNameErrorMessage("Wypełnij pole");
                      return;
                    }
                    if (!folderNameRegex.test(trimmed)) {
                      setFolderNameErrorMessage(
                        "Nazwa może zawierać tylko litery, cyfry, spacje, _ i -"
                      );
                      return;
                    }
                    handleAddFolder();
                  }}
                />
              </div>
          </Modal>
        )}

        {isConfirmingTrashClear && (
          <Modal centered onClose={() => setIsConfirmingTrashClear(false)}>
              <Text bold="true" as="h2" text="Wyczyścić kosz?" />
              <Text
                text="Czy na pewno chcesz usunąć wszystkie pliki z kosza? Tej operacji nie można cofnąć."
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
                <ModalButton
                  type="button"
                  onClick={() => setIsConfirmingTrashClear(false)}
                >
                  Anuluj
                </ModalButton>
                <ModalButton
                  type="button"
                  $danger
                  onClick={async () => {
                    await handleClearTrash();
                    await handleClearFolderTrash();
                    setIsConfirmingTrashClear(false);
                    if (urlPath === "trash") {
                      await refreshCurrentView();
                    } else {
                      navigate("/notes/trash", { replace: true });
                    }
                  }}
                >
                  Wyczyść kosz
                </ModalButton>
              </div>
          </Modal>
        )}

        {itemToDelete && (
          <Modal centered onClose={() => setItemToDelete(null)}>
              <Text
                bold="true"
                as="h2"
                text={
                  itemToDelete.type === "folder"
                    ? "Usuń folder"
                    : "Usuń dokument"
                }
              />
              <Text
                text={`Czy na pewno chcesz usunąć "${itemToDelete.name}"?`}
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
                  onClick={() => setItemToDelete(null)}
                >
                  Anuluj
                </ModalButton>
                <ModalButton type="button" $danger onClick={executeDelete}>
                  Usuń
                </ModalButton>
              </div>
          </Modal>
        )}

        {isMoving && (
          <Modal
            onClose={() => {
              setIsMoving(false);
              setMovingItem(null);
              setMoveErrorMessage("");
            }}
          >
              <Text
                bold="true"
                as="h2"
                text={`Przenieś: ${movingItem?.name || ""}`}
               
              />
              {moveErrorMessage && (
                <Text color="danger" text={moveErrorMessage} />
              )}
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  margin: "20px 0",
                  border: `1px solid ${theme.colors.borderLight}`,
                  borderRadius: "12px",
                  padding: "15px",
                }}
              >
                <StyledTreeItem $depth={0}>
                  <StyledTreeItemLabel
                    $selected={selectedMovePath === "/"}
                    $disabled={!currentFolder}
                    onClick={() => {
                      if (currentFolder) setSelectedMovePath("/");
                    }}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      style={{ width: 16, marginRight: 6, flexShrink: 0 }}
                    >
                      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
                    </svg>
                    <span style={{ marginLeft: 4 }}>/</span>
                  </StyledTreeItemLabel>
                </StyledTreeItem>
                {renderMoveTree(moveTree)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <SubmitButton
                  text="Anuluj"
                  color="dark"
                  light
                  onClick={() => {
                    setIsMoving(false);
                    setMovingItem(null);
                    setMoveErrorMessage("");
                  }}
                />
                <SubmitButton
                  text={isSuccess ? "✔ Przeniesiono!" : "Zatwierdź"}
                  color={isSuccess ? "secondary" : "dark"}
                  onClick={handleMove}
                  style={{
                    opacity: selectedMovePath === null ? 0.5 : 1,
                    pointerEvents: selectedMovePath === null ? "none" : "auto",
                  }}
                />
              </div>
          </Modal>
        )}
        {!isTrashView && (
          <>
            {isActiveAddOptions && (
              <FabMenu>
                <FabMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentFolder) handleFetchFolderSuggestedTags();
                    setIsAddingFolder(true);
                    setIsActiveAddOptions(false);
                  }}
                >
                  Nowy folder
                </FabMenuItem>
                <FabMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentFolder) handleFetchFolderSuggestedTags();
                    setIsAddingNote(true);
                    setIsActiveAddOptions(false);
                    setChosenTags([]);
                    setNewTag("");
                  }}
                >
                  Nowy dokument
                </FabMenuItem>
              </FabMenu>
            )}
            <FloatingActionButton
              onClick={(e) => {
                e.stopPropagation();
                setIsActiveAddOptions(!isActiveAddOptions);
                setIsActivePathOptions(false);
                setActiveFolderOptionsId(null);
                setActiveNoteOptionsId(null);
              }}
            >
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
            </FloatingActionButton>
          </>
        )}

        {isTrashView && trashHasItems && (
          <FloatingActionButton
            $danger
            title="Wyczyść kosz permanentnie"
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirmingTrashClear(true);
            }}
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
            </svg>
          </FloatingActionButton>
        )}
      </StyledContainer>
      <AIFlashcardModal
        isOpen={aiModalNoteId !== null}
        onClose={() => setAiModalNoteId(null)}
        noteId={aiModalNoteId}
      />
    </Layout>
  );
};

export default Notes;
