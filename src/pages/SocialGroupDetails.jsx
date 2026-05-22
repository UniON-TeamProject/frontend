import React, { useState, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/organisms/Layout";
import { getToken, parseJwt } from "../token";
import {
  getSocialGroup,
  editSocialGroup,
  deleteSocialGroup,
  createInvitationLink,
  addNote,
  addFlashcardSet,
  getAllNotes,
  getAllFlashcardSets,
  copyNoteToGroup,
  copyFlashcardSetToGroup,
  deleteNote,
  deleteFlashcardSet,
  renameNote,
  editFlashcardSet,
  getSocialGroupUsers,
  changeSocialGroupRole,
  removeUserFromSocialGroup,
  leaveSocialGroup,
  inviteFriendToSocialGroup,
} from "../api";

const PageContainer = styled.div`
  padding: 20px 40px 100px;
  min-height: 100vh;
  max-width: 1500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 0.2s ease;

  @media (max-width: 768px) {
    padding: 12px 12px 100px;
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

  @media (max-width: 768px) {
    margin-bottom: 10px;
    min-height: auto;
  }
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    gap: 15px;
    margin-bottom: 20px;
  }
`;

const TitleArea = styled.div`
  max-width: 800px;
  flex: 1;
  min-width: 0;
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 10px 0;
  line-height: 1.2;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 1.7rem;
  }
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.darkGrey};
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

const SettingsBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  background-color: transparent !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.darkGrey};
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TopCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 25px;
  margin-bottom: 40px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    margin-bottom: 25px;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  padding: 25px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CardTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.lightGrey};
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CardSubtitle = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.darkGrey};
  font-weight: 500;
`;

const InviteText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.darkGrey};
  line-height: 1.5;
  margin: 0 0 20px 0;
`;

const InviteBox = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px 10px;
  margin-top: auto;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InviteInput = styled.input`
  min-width: 110px;
  width: 100%;
  flex: 1;
  height: 44px;
  padding: 10px 15px;
  border-radius: 10px;
  border: 3px solid ${({ theme }) => theme.colors.lightGrey};
  background: #fdfdfc;
  color: ${({ theme }) => theme.colors.dark};
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const InviteRoleSelect = styled.select`
  height: 44px;
  padding: 0 15px;
  border-radius: 10px;
  border: 3px solid ${({ theme }) => theme.colors.lightGrey};
  background: #fdfdfc;
  color: ${({ theme }) => theme.colors.dark};
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
`;

const ActionBtn = styled.button`
  background-color: ${({ $primary, $success, theme }) =>
    $success
      ? theme.colors.secondary
      : $primary
      ? theme.colors.text
      : "transparent"};
  color: ${({ $primary, $success, theme }) =>
    $primary || $success ? "#fff" : theme.colors.text};
  border: ${({ $primary, $success, theme }) =>
    $primary || $success ? "none" : `1px solid ${theme.colors.darkGrey}`};
  border-radius: 10px;
  padding: 0 18px;
  height: 44px;
  width: 100%;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.7;
    cursor: ${({ $isLoading }) => ($isLoading ? "wait" : "not-allowed")};
  }
`;

const ManageLink = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 10px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $bg, theme }) => $bg || theme.colors.lightGrey};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.span`
  font-size: 0.9rem;
  color: ${({ theme, $isMe }) =>
    $isMe ? theme.colors.secondary : theme.colors.text};
  font-weight: 600;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MemberRole = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.darkGrey};
  text-transform: uppercase;
  font-weight: 700;
`;

const MaterialsSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  padding: 25px 60px;
  flex: 1;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const StyledToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightGrey};
  padding-bottom: 0px;
  flex-wrap: wrap;
  gap: 15px;
`;

const StyledTabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const StyledTab = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  padding: 15px 0;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.darkGrey};
  border-bottom: 3px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.secondary : "transparent"};
  transition: color 0.15s;
  margin-bottom: -2px;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  > svg {
    width: 20px;
    height: 20px;
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StyledSearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f4f5f7;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 8px 16px;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;
  max-width: 400px;

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
    width: 100%;

    &::placeholder {
      color: #a0a0a0;
    }
  }

  > svg {
    color: #a0a0a0;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    > input {
      font-size: 16px;
    }
  }
`;

const AddMaterialBtn = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const MaterialList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MaterialItem = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 20px 20px 20px 0;
  width: 95%;
  max-width: 1100px;
  border-radius: 16px;
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.lightGrey : "transparent"};
  border: 2px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.secondary : "transparent"};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 15px 15px 15px 0;
    gap: 12px;
  }
`;

const MaterialIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${({ theme }) =>
    theme.colors.secondary ? theme.colors.secondary + "20" : "#e8f0fe"};
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 50px;
    height: 50px;
    ${({ $isNote }) => !$isNote && "transform: scale(1.25);"}
  }
`;

const MaterialInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
`;

const MaterialTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MaterialMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.darkGrey};
  display: flex;
  align-items: center;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OptionsMenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.darkGrey};
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 10px;
  z-index: 20;
  width: 220px;
  display: flex;
  flex-direction: column;
  cursor: default;
`;

const DropdownItem = styled.button`
  padding: 10px 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;

  &.danger {
    color: #e74c3c;
  }
  &:hover {
    background-color: #f9f9f9;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
`;

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 40px 50px;
  border-radius: 25px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    width: 92%;
    padding: 24px 20px;
  }
`;

const ModalTitle = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 0;
  margin-bottom: 25px;
  font-weight: 800;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid
    ${({ $error, theme }) =>
      $error ? theme.colors.danger : theme.colors.lightGrey};
  background: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  background: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 5px;
  display: block;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
`;

const ModalButton = styled.button`
  background-color: ${({ $primary, $danger, theme }) =>
    $danger
      ? theme.colors.danger
      : $primary
      ? theme.colors.text
      : "transparent"};
  color: ${({ $primary, $danger, theme }) =>
    $primary || $danger ? "#fff" : theme.colors.text};
  border: ${({ $primary, $danger, theme }) =>
    $primary || $danger ? "none" : `1px solid ${theme.colors.darkGrey}`};
  padding: 12px 25px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  flex: 1;

  &:hover {
    opacity: 0.8;
  }
`;

const BigSelectButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 30px;
  background: ${({ theme }) => theme.colors.mediumGrey};
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-bottom: 15px;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
    border-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }

  span {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 40px;
    height: 40px;
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ManageMembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 10px;
  margin-top: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.lightGrey};
    border-radius: 4px;
  }
`;

const ManageMemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid transparent;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
`;

const MemberActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TrashButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.danger}20;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const RoleHelpIconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.8rem;
  font-weight: bold;
  cursor: default;

  &:hover > div {
    display: block;
  }
`;

const RoleHelpTooltip = styled.div`
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.takiSmiesznyZielonyAleJasny};
  color: ${({ theme }) => theme.colors.white};
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
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: ${({ theme }) =>
      theme.colors.veryDarkPrimary} transparent transparent transparent;
  }

  @media (max-width: 768px) {
    bottom: auto;
    top: calc(100% + 8px);
    left: -30px;
    transform: none;
    width: 250px;

    &::after {
      top: auto;
      bottom: 100%;
      left: 35px;
      transform: none;
      border-color: transparent transparent ${({ theme }) =>
        theme.colors.veryDarkPrimary} transparent;
    }
`;

const CardsIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="20 30 220 200"
    fill="none"
    stroke="currentColor"
    strokeWidth="8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Kółko trzymające fiszki (otwarta ścieżka chowająca się za kartami) */}
    <path d="M 89 64 A 32 32 0 1 0 62 100" />

    {/* Tylna karta (z zachowaną perspektywą, ten sam rozmiar co przednia, ukryte lewe/dolne krawędzie) */}
    <path d="M 68 80 A 16 16 0 0 1 84 64 L 216 64 A 16 16 0 0 1 232 80 L 232 180 A 16 16 0 0 1 216 196" />

    {/* Przednia karta */}
    <rect x="52" y="80" width="164" height="132" rx="16" />

    {/* Dziurka w przedniej karcie */}
    <circle cx="74" cy="100" r="7" />

    {/* Litera "A" */}
    <path d="M 100 132 L 114 92 L 128 132 M 105 120 L 123 120" />

    {/* Litera "a" */}
    <circle cx="150" cy="120" r="12" />
    <path d="M 162 108 L 162 128 A 4 4 0 0 0 166 132" />

    {/* Trzy poziome linie */}
    <path d="M 86 156 L 182 156 M 86 176 L 158 176 M 86 196 L 122 196" />
  </svg>
);

const SocialGroupDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  // kopiowanie linku
  const [inviteLink, setInviteLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteRole, setInviteRole] = useState("EDITOR");

  // modal ustawien (edycja/usuwanie grupy)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // MODAL MATERIAŁÓW
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialMode, setMaterialMode] = useState(null); // null (wybor) lub CREATE lub IMPORT
  const [newMaterialName, setNewMaterialName] = useState("");
  const [userPrivateMaterials, setUserPrivateMaterials] = useState([]);
  const [selectedPrivateMaterialId, setSelectedPrivateMaterialId] =
    useState(null);
  const [isMaterialSaving, setIsMaterialSaving] = useState(false);
  const [materialError, setMaterialError] = useState("");

  const [activeMenuId, setActiveMenuId] = useState(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [materialToRename, setMaterialToRename] = useState(null);
  const [newRenameValue, setNewRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");

  const [groupMembers, setGroupMembers] = useState([]);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
    type: "",
  });
  const [confirmGroupDeleteModal, setConfirmGroupDeleteModal] = useState(false);

  // ZARZADZANIE CZLONKAMI
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] =
    useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // admin nie bedzie mogl zmienic sobie roli / usunac siebie samego
  const jwt = getToken();
  const currentUser = jwt ? parseJwt(jwt).sub : "";

  const [roleChangeError, setRoleChangeError] = useState("");

  const [confirmRemoveUserModal, setConfirmRemoveUserModal] = useState({
    isOpen: false,
    userId: null,
  });
  const [removeUserError, setRemoveUserError] = useState("");

  const [confirmLeaveGroupModal, setConfirmLeaveGroupModal] = useState(false);
  const [leaveGroupError, setLeaveGroupError] = useState("");

  const [friendUsername, setFriendUsername] = useState("");
  const [isInvitingFriend, setIsInvitingFriend] = useState(false);
  const [inviteFriendMessage, setInviteFriendMessage] = useState({
    text: "",
    isError: false,
  });

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupMembers();

    const closeMenu = () => setActiveMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [id, navigate]);

  const fetchGroupDetails = async () => {
    setIsReady(false);
    setIsLoading(true);
    setError("");

    const res = await getSocialGroup(id);

    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setError(res.message || "Nie udało się pobrać szczegółów grupy.");
    } else {
      setGroup({
        id: res.id,
        name: res.name,
        description: res.description,
        userRole: res.userRole,
        notes: res.noteResponseList || [],
        flashcards: res.cardSetResponseList || [],
      });
    }
    setIsLoading(false);
    setIsReady(true);
  };

  const fetchGroupMembers = async () => {
    const res = await getSocialGroupUsers(id);
    if (!res.errorCode) {
      // wagi ról (im mniejsza waga tym wyżej na liście)
      const roleWeight = {
        ADMIN: 1,
        EDITOR: 2,
        VIEWER: 3,
      };

      const sortedMembers = res.sort((a, b) => {
        // najpierw ja
        if (a.username === currentUser) return -1;
        if (b.username === currentUser) return 1;

        // potem po rolach
        const weightA = roleWeight[a.role] || 4;
        const weightB = roleWeight[b.role] || 4;

        if (weightA !== weightB) {
          return weightA - weightB;
        }

        // jeśli mają taką samą rolę to alfabetycznie
        return a.username.localeCompare(b.username);
      });

      setGroupMembers(sortedMembers);
    } else {
      console.error("Błąd pobierania członków:", res.message);
    }
  };

  const translateRole = (role) => {
    if (role === "ADMIN") return "Admin";
    if (role === "EDITOR") return "Edytor";
    if (role === "VIEWER") return "Obserwator";
    return "Członek";
  };

  const handleOpenSettings = () => {
    setEditName(group.name);
    setEditDesc(group.description || "");
    setSettingsError("");
    setIsSettingsModalOpen(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSettingsError("");
    if (!editName.trim()) {
      setSettingsError("Nazwa grupy nie może być pusta.");
      return;
    }

    setIsSaving(true);
    const res = await editSocialGroup(
      group.id,
      editName.trim(),
      editDesc.trim()
    );

    if (res.errorCode) {
      setSettingsError(res.message || "Wystąpił błąd.");
    } else {
      setGroup((prev) => ({
        ...prev,
        name: res.name,
        description: res.description,
      }));
      setIsSettingsModalOpen(false);
    }
    setIsSaving(false);
  };

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    const res = await deleteSocialGroup(group.id);

    if (!res.errorCode) {
      navigate("/social", { replace: true });
    } else {
      setSettingsError(res.message);
      setIsDeleting(false);
    }
  };

  const handleGenerateOrCopyLink = async () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      setIsGenerating(true);
      const res = await createInvitationLink(group.id, inviteRole);
      if (!res.errorCode) {
        setInviteLink(res.link);
      } else {
        alert(res.message || "Błąd generowania linku.");
      }
      setIsGenerating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleChangeError("");
    setUpdatingUserId(userId);
    const res = await changeSocialGroupRole(group.id, userId, newRole);
    if (!res.errorCode) {
      fetchGroupMembers();
    } else {
      setRoleChangeError(res.message || "Błąd podczas zmiany roli.");
    }
    setUpdatingUserId(null);
  };

  const handleRemoveUserClick = (userId) => {
    setIsManageMembersModalOpen(false);
    setConfirmRemoveUserModal({ isOpen: true, userId });
    setRemoveUserError("");
  };

  const executeRemoveUser = async () => {
    const userId = confirmRemoveUserModal.userId;
    setUpdatingUserId(userId);
    setRemoveUserError("");
    const res = await removeUserFromSocialGroup(group.id, userId);

    if (!res.errorCode) {
      fetchGroupMembers();
      setConfirmRemoveUserModal({ isOpen: false, userId: null });
      setIsManageMembersModalOpen(true);
    } else {
      setRemoveUserError(res.message || "Błąd podczas usuwania członka.");
    }
    setUpdatingUserId(null);
  };

  const handleLeaveGroupClick = () => {
    setConfirmLeaveGroupModal(true);
    setLeaveGroupError("");
  };

  const executeLeaveGroup = async () => {
    setIsDeleting(true);
    setLeaveGroupError("");
    const res = await leaveSocialGroup(group.id);

    if (!res.errorCode) {
      navigate("/social", { replace: true });
    } else {
      setLeaveGroupError(res.message || "Błąd opuszczania grupy.");
      setIsDeleting(false);
    }
  };

  const handleInviteFriend = async () => {
    setIsInvitingFriend(true);
    setInviteFriendMessage({ text: "", isError: false });

    const res = await inviteFriendToSocialGroup(
      group.id,
      friendUsername.trim(),
      inviteRole
    );

    if (!res.errorCode) {
      setInviteFriendMessage({ text: "Wysłano zaproszenie!", isError: false });
      setFriendUsername("");
    } else {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else
        setInviteFriendMessage({
          text: res.message || "Błąd zapraszania.",
          isError: true,
        });
    }

    setIsInvitingFriend(false);
    setTimeout(
      () => setInviteFriendMessage({ text: "", isError: false }),
      4000
    );
  };

  // OBSLUGA MATERIAŁÓW
  const handleOpenMaterialModal = () => {
    setMaterialMode(null);
    setNewMaterialName("");
    setMaterialError("");
    setSelectedPrivateMaterialId(null);
    setIsMaterialModalOpen(true);
  };

  const handleSelectMode = async (mode) => {
    setMaterialMode(mode);
    setMaterialError("");

    if (mode === "IMPORT") {
      setIsMaterialSaving(true);
      if (activeTab === "notes") {
        const res = await getAllNotes();
        setUserPrivateMaterials(res.notes || []);
      } else {
        const res = await getAllFlashcardSets();
        setUserPrivateMaterials(res.sets || []);
      }
      setIsMaterialSaving(false);
    }
  };

  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    setMaterialError("");

    if (materialMode === "CREATE" && !newMaterialName.trim()) {
      setMaterialError("Podaj nazwę materiału.");
      return;
    }
    if (materialMode === "IMPORT" && !selectedPrivateMaterialId) {
      setMaterialError("Wybierz plik do zaimportowania.");
      return;
    }
    if (materialMode === "IMPORT" && !newMaterialName.trim()) {
      setMaterialError("Podaj nową nazwę (lub zostaw domyślną).");
      return;
    }

    setIsMaterialSaving(true);
    let res;

    // tworzenie pustego
    if (materialMode === "CREATE") {
      if (activeTab === "notes") {
        res = await addNote(newMaterialName.trim(), "/", [], group.id);
      } else {
        res = await addFlashcardSet(newMaterialName.trim(), [], group.id);
      }
    }
    // kopowianie (udostepnianie)
    else if (materialMode === "IMPORT") {
      if (activeTab === "notes") {
        res = await copyNoteToGroup(
          selectedPrivateMaterialId,
          group.id,
          newMaterialName.trim()
        );
      } else {
        res = await copyFlashcardSetToGroup(
          selectedPrivateMaterialId,
          group.id,
          newMaterialName.trim()
        );
      }
    }

    if (res && res.errorCode) {
      setMaterialError(res.message || "Wystąpił błąd podczas zapisywania.");
      setIsMaterialSaving(false);
    } else {
      setIsMaterialModalOpen(false);
      setIsMaterialSaving(false);
      fetchGroupDetails();
    }
  };

  // MENU MATERIALY
  const handleRemoveMaterial = async (matId) => {
    let res;
    if (activeTab === "notes") {
      res = await deleteNote(matId, group.id);
    } else {
      res = await deleteFlashcardSet(matId, group.id);
    }

    if (res && res.errorCode) {
      alert(res.message || "Błąd podczas usuwania.");
    } else {
      fetchGroupDetails();
    }
  };

  const handleOpenRename = (mat) => {
    setMaterialToRename(mat);
    setNewRenameValue(mat.name || mat.title || "");
    setRenameError("");
    setIsRenameModalOpen(true);
  };

  const handleSubmitRename = async (e) => {
    e.preventDefault();
    if (!newRenameValue.trim()) {
      setRenameError("Nazwa nie może być pusta.");
      return;
    }

    let res;
    if (activeTab === "notes") {
      res = await renameNote(
        materialToRename.id,
        newRenameValue.trim(),
        group.id
      );
    } else {
      res = await editFlashcardSet(
        materialToRename.id,
        newRenameValue.trim(),
        materialToRename.tags || [],
        group.id
      );
    }

    if (res && res.errorCode) {
      setRenameError(res.message || "Błąd zmiany nazwy.");
    } else {
      setIsRenameModalOpen(false);
      fetchGroupDetails();
    }
  };

  if (isLoading || error || !group) {
    return (
      <Layout>
        <PageContainer $ready={true}>
          <div
            style={{
              textAlign: "center",
              marginTop: "50px",
              color: error ? "#e74c3c" : "#a0a69b",
            }}
          >
            {isLoading
              ? "Ładowanie szczegółów grupy..."
              : error || "Nie znaleziono grupy."}
          </div>
        </PageContainer>
      </Layout>
    );
  }

  const displayedMaterials =
    activeTab === "notes" ? group.notes : group.flashcards;
  const filteredMaterials = displayedMaterials.filter((m) =>
    (m.name || m.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <PageContainer $ready={isReady}>
        <StyledUserHeader>
          <BackButton onClick={() => navigate("/social")}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Powrót
          </BackButton>
        </StyledUserHeader>

        <HeaderRow>
          <TitleArea>
            <PageTitle>{group.name}</PageTitle>
            <PageSubtitle>{group.description || "Brak opisu"}</PageSubtitle>
          </TitleArea>

          <div style={{ display: "flex", gap: "10px" }}>
            <SettingsBtn
              title="Opuść społeczność"
              onClick={handleLeaveGroupClick}
              disabled={isDeleting}
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ width: 22, height: 22, marginLeft: "4px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </SettingsBtn>

            {group.userRole === "ADMIN" && (
              <SettingsBtn
                title="Ustawienia grupy"
                onClick={handleOpenSettings}
                disabled={isDeleting}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: 24, height: 24 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </SettingsBtn>
            )}
          </div>
        </HeaderRow>

        <TopCardsGrid>
          {/* KARTA SPOŁECZNOŚĆ */}
          <Card>
            <CardHeader>
              <CardTitleWrap>
                <IconBox>
                  <svg
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    style={{ width: 20, height: 20 }}
                  >
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                  </svg>
                </IconBox>
                <div>
                  <CardTitle>Społeczność</CardTitle>
                  <CardSubtitle>{groupMembers.length} członków</CardSubtitle>
                </div>
              </CardTitleWrap>
            </CardHeader>
            <InviteText>
              Zaproś znajomych ze swojego roku, aby wspólnie wymieniać się
              notatkami i przygotowywać do egzaminów. Im nas więcej, tym
              łatwiej!
            </InviteText>
            {group.userRole === "ADMIN" ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "18px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: theme.colors.darkGrey,
                    }}
                  >
                    Wybierz rolę zapraszanego:
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <InviteRoleSelect
                      value={inviteRole}
                      onChange={(e) => {
                        setInviteRole(e.target.value);
                        setInviteLink("");
                      }}
                      style={{
                        height: "34px",
                        padding: "0 10px",
                        width: "auto",
                        border: `2px solid ${theme.colors.lightGrey}`,
                      }}
                    >
                      <option value="EDITOR">Edytor</option>
                      <option value="VIEWER">Obserwator</option>
                    </InviteRoleSelect>

                    <RoleHelpIconWrapper style={{ marginLeft: 0 }}>
                      ?
                      <RoleHelpTooltip>
                        <b style={{ color: theme.colors.secondary }}>Edytor</b>{" "}
                        może przeglądać i edytować materiały oraz dodawać nowe.
                        <br />
                        <br />
                        <b style={{ color: theme.colors.secondary }}>
                          Obserwator
                        </b>{" "}
                        może wyłącznie przeglądać materiały w grupie.
                      </RoleHelpTooltip>
                    </RoleHelpIconWrapper>
                  </div>
                </div>

                <InviteBox>
                  {/* wiersz 1 */}
                  <InviteInput
                    type="text"
                    readOnly
                    value={inviteLink || "Kliknij 'Generuj', aby stworzyć link"}
                  />
                  <ActionBtn
                    onClick={handleGenerateOrCopyLink}
                    disabled={isGenerating}
                    $isCopied={isCopied}
                  >
                    {isCopied ? (
                      <>
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          style={{ width: 18, height: 18 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Skopiowano!
                      </>
                    ) : isGenerating ? (
                      "Czekaj..."
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="currentColor"
                          className="bi bi-link-45deg"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                        </svg>
                        {inviteLink ? "Kopiuj" : "Generuj"}
                      </>
                    )}
                  </ActionBtn>

                  {/* wiersz 2 */}
                  <InviteInput
                    type="text"
                    placeholder="Nazwa znajomego"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && friendUsername.trim()) {
                        handleInviteFriend();
                      }
                    }}
                  />
                  <ActionBtn
                    $success
                    $isLoading={isInvitingFriend}
                    disabled={isInvitingFriend || !friendUsername.trim()}
                    onClick={handleInviteFriend}
                  >
                    {isInvitingFriend ? "..." : "Zaproś"}
                  </ActionBtn>
                </InviteBox>

                {inviteFriendMessage.text && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      color: inviteFriendMessage.isError
                        ? theme.colors.danger
                        : theme.colors.secondary,
                    }}
                  >
                    {inviteFriendMessage.text}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  padding: "10px",
                  background: "#f8f9fa",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  color: "#666",
                }}
              >
                Tylko administratorzy grupy mogą generować nowe linki
                zaproszeniowe.
              </div>
            )}
          </Card>

          {/* KARTA CZŁONKOWIE */}
          <Card>
            <CardHeader>
              <CardTitle>Członkowie grupy</CardTitle>
              <ManageLink onClick={() => setIsManageMembersModalOpen(true)}>
                {group.userRole === "ADMIN" ? "Zarządzaj" : "Więcej"}
              </ManageLink>
            </CardHeader>
            <MembersGrid>
              {groupMembers.length > 0 ? (
                <>
                  {groupMembers.slice(0, 3).map((member) => (
                    <MemberItem
                      key={member.id}
                      style={{
                        justifyContent: "flex-start",
                        gap: "15px",
                        padding: "10px 5px",
                      }}
                    >
                      <Avatar>
                        {member.avatarId && member.avatarId > 0 ? (
                          <img
                            src={`/icons/avatar${member.avatarId}.png`}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          member.username.charAt(0).toUpperCase()
                        )}
                      </Avatar>
                      <MemberInfo>
                        <MemberName
                          style={{ fontSize: "1rem" }}
                          $isMe={member.username === currentUser}
                        >
                          {member.username}{" "}
                          {member.username === currentUser && "(JA)"}
                        </MemberName>
                        <MemberRole
                          style={{ fontSize: "0.75rem", marginTop: "2px" }}
                        >
                          {translateRole(member.role)}
                        </MemberRole>
                      </MemberInfo>
                    </MemberItem>
                  ))}

                  {groupMembers.length === 4 && (
                    <MemberItem
                      key={groupMembers[3].id}
                      style={{
                        justifyContent: "flex-start",
                        gap: "15px",
                        padding: "10px 5px",
                      }}
                    >
                      <Avatar>
                        {groupMembers[3].avatarId &&
                        groupMembers[3].avatarId > 0 ? (
                          <img
                            src={`/icons/avatar${groupMembers[3].avatarId}.png`}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          groupMembers[3].username.charAt(0).toUpperCase()
                        )}
                      </Avatar>
                      <MemberInfo>
                        <MemberName
                          style={{ fontSize: "1rem" }}
                          $isMe={groupMembers[3].username === currentUser}
                        >
                          {groupMembers[3].username}{" "}
                          {groupMembers[3].username === currentUser && "(JA)"}
                        </MemberName>
                        <MemberRole
                          style={{ fontSize: "0.75rem", marginTop: "2px" }}
                        >
                          {translateRole(groupMembers[3].role)}
                        </MemberRole>
                      </MemberInfo>
                    </MemberItem>
                  )}

                  {groupMembers.length > 4 && (
                    <MemberItem
                      style={{
                        justifyContent: "flex-start",
                        gap: "15px",
                        padding: "10px 5px",
                      }}
                    >
                      <Avatar
                        style={{
                          backgroundColor: "#e9ece1",
                          color: "#122818",
                          fontSize: "1.2rem",
                        }}
                      >
                        +
                      </Avatar>
                      <MemberInfo style={{ justifyContent: "center" }}>
                        <MemberRole style={{ fontSize: "0.85rem", margin: 0 }}>
                          {groupMembers.length - 3} innych członków
                        </MemberRole>
                      </MemberInfo>
                    </MemberItem>
                  )}
                </>
              ) : (
                <div
                  style={{
                    color: "#a0a69b",
                    fontSize: "0.9rem",
                    padding: "10px 5px",
                  }}
                >
                  Ładowanie członków...
                </div>
              )}
            </MembersGrid>
          </Card>
        </TopCardsGrid>

        {/* SEKCJA UDOSTĘPNIONCYH MATERIAŁÓW */}
        <MaterialsSection>
          <StyledToolbar>
            <StyledTabsContainer>
              <StyledTab
                $active={activeTab === "notes"}
                onClick={() => {
                  setActiveTab("notes");
                  setSearchQuery("");
                }}
              >
                <svg fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
                </svg>
                Notatki ({group.notes.length})
              </StyledTab>
              <StyledTab
                $active={activeTab === "flashcards"}
                onClick={() => {
                  setActiveTab("flashcards");
                  setSearchQuery("");
                }}
              >
                <svg fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
                </svg>
                Zestawy fiszek ({group.flashcards.length})
              </StyledTab>
            </StyledTabsContainer>
          </StyledToolbar>

          <ActionRow>
            <StyledSearchInput>
              <svg
                width="15"
                height="15"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
              <input
                placeholder={`Szukaj w ${
                  activeTab === "notes" ? "notatkach" : "zestawach"
                }...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </StyledSearchInput>

            {/* TYLKO ADMIN I EDYTOR MOGA DODAWAC PLIKI */}
            {(group.userRole === "ADMIN" || group.userRole === "EDITOR") && (
              <AddMaterialBtn onClick={handleOpenMaterialModal}>
                + Dodaj materiał
              </AddMaterialBtn>
            )}
          </ActionRow>

          <MaterialList>
            {filteredMaterials.length > 0
              ? filteredMaterials.map((mat) => (
                  <MaterialItem
                    key={mat.id}
                    onClick={() => {
                      if (activeTab === "notes") {
                        navigate(`/note/${mat.id}?socialId=${group.id}`);
                      } else {
                        navigate(
                          `/learning/set/${mat.id}?socialId=${group.id}`
                        );
                      }
                    }}
                  >
                    {group.userRole === "ADMIN" ||
                    group.userRole === "EDITOR" ? (
                      <div style={{ position: "relative" }}>
                        <OptionsMenuButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === mat.id ? null : mat.id
                            );
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                          </svg>
                        </OptionsMenuButton>

                        {activeMenuId === mat.id && (
                          <DropdownMenu onClick={(e) => e.stopPropagation()}>
                            <DropdownItem
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenRename(mat);
                              }}
                            >
                              <svg
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              Zmień nazwę
                            </DropdownItem>
                            <DropdownItem
                              className="danger"
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteModal({
                                  isOpen: true,
                                  id: mat.id,
                                  name: mat.name || mat.title,
                                  type:
                                    activeTab === "notes"
                                      ? "notatkę"
                                      : "zestaw fiszek",
                                });
                              }}
                            >
                              <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                              </svg>
                              Usuń ze społeczności
                            </DropdownItem>
                          </DropdownMenu>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: "40px" }}></div>
                    )}

                    <MaterialIcon $isNote={activeTab === "notes"}>
                      {activeTab === "notes" ? (
                        <svg fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                          <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                        </svg>
                      ) : (
                        <CardsIcon />
                      )}
                    </MaterialIcon>

                    <MaterialInfo>
                      <MaterialTitle>
                        {mat.name || mat.title || "Bez nazwy"}
                      </MaterialTitle>
                      <MaterialMeta>
                        Dodane przez:{" "}
                        <strong style={{ color: "#333", margin: "0 4px" }}>
                          {mat.creatorUsername ||
                            mat.authorUsername ||
                            "Autora"}
                        </strong>
                      </MaterialMeta>
                    </MaterialInfo>
                  </MaterialItem>
                ))
              : isReady && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#a0a69b",
                    }}
                  >
                    Brak materiałów.
                  </div>
                )}
          </MaterialList>
        </MaterialsSection>

        {/* MODAL USTAWIEŃ GRUPY */}
        {isSettingsModalOpen && (
          <>
            <ModalOverlay
              onClick={() =>
                !isSaving && !isDeleting && setIsSettingsModalOpen(false)
              }
            />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Ustawienia grupy</ModalTitle>

              <form onSubmit={handleSaveChanges}>
                <FormGroup>
                  <InputLabel>Nazwa grupy</InputLabel>
                  <ModalInput
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (settingsError) setSettingsError("");
                    }}
                    maxLength={55}
                    $error={!!settingsError && !editName.trim()}
                    disabled={isSaving || isDeleting}
                  />
                </FormGroup>

                <FormGroup>
                  <InputLabel>Krótki opis</InputLabel>
                  <ModalTextarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    maxLength={255}
                    disabled={isSaving || isDeleting}
                  />
                </FormGroup>

                {settingsError && <ErrorText>{settingsError}</ErrorText>}

                <ButtonGroup
                  style={{
                    marginTop: "25px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "25px",
                  }}
                >
                  <ModalButton
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    disabled={isSaving || isDeleting}
                  >
                    Anuluj
                  </ModalButton>
                  <ModalButton
                    type="submit"
                    $primary
                    disabled={isSaving || isDeleting}
                  >
                    {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
                  </ModalButton>
                </ButtonGroup>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <ModalButton
                    type="button"
                    $danger
                    onClick={() => {
                      setIsSettingsModalOpen(false);
                      setConfirmGroupDeleteModal(true);
                    }}
                    disabled={isSaving || isDeleting}
                  >
                    {isDeleting ? "Usuwanie..." : "Usuń bezpowrotnie grupę"}
                  </ModalButton>
                </div>
              </form>
            </StyledPopup>
          </>
        )}

        {/* MODAL DODAWANIA MATERIAŁÓW */}
        {isMaterialModalOpen && (
          <>
            <ModalOverlay
              onClick={() => !isMaterialSaving && setIsMaterialModalOpen(false)}
            />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              {materialMode === null && (
                <>
                  <ModalTitle>
                    Dodaj {activeTab === "notes" ? "notatkę" : "zestaw fiszek"}
                  </ModalTitle>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#a0a69b",
                      marginBottom: "25px",
                    }}
                  >
                    Wybierz, w jaki sposób chcesz dodać materiał do tej grupy.
                  </p>
                  <BigSelectButton onClick={() => handleSelectMode("CREATE")}>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Stwórz całkowicie nowy</span>
                  </BigSelectButton>

                  <BigSelectButton onClick={() => handleSelectMode("IMPORT")}>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                    <span>Sklonuj ze swoich prywatnych</span>
                  </BigSelectButton>
                </>
              )}

              {materialMode !== null && (
                <form onSubmit={handleSubmitMaterial}>
                  <ModalTitle>
                    {materialMode === "CREATE"
                      ? "Tworzenie nowego pliku"
                      : "Import prywatnego pliku"}
                  </ModalTitle>

                  {materialMode === "IMPORT" && (
                    <FormGroup>
                      <InputLabel>Wybierz plik z Twojej biblioteki</InputLabel>
                      {isMaterialSaving ? (
                        <div style={{ padding: "10px", color: "#a0a69b" }}>
                          Wczytywanie Twoich plików...
                        </div>
                      ) : userPrivateMaterials.length === 0 ? (
                        <div style={{ padding: "10px", color: "#e74c3c" }}>
                          Nie masz żadnych prywatnych materiałów tego typu.
                        </div>
                      ) : (
                        <MaterialList
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            marginBottom: "15px",
                            border: "1px solid #e9ece1",
                            borderRadius: "12px",
                            padding: "5px",
                          }}
                        >
                          {userPrivateMaterials.map((mat) => (
                            <MaterialItem
                              key={mat.id}
                              $selected={selectedPrivateMaterialId === mat.id}
                              onClick={() => {
                                setSelectedPrivateMaterialId(mat.id);
                                setNewMaterialName(mat.name || mat.title || "");
                                setMaterialError("");
                              }}
                              style={{ padding: "10px" }}
                            >
                              <MaterialTitle style={{ fontSize: "0.95rem" }}>
                                {mat.name || mat.title}
                              </MaterialTitle>
                            </MaterialItem>
                          ))}
                        </MaterialList>
                      )}
                    </FormGroup>
                  )}

                  {(materialMode === "CREATE" ||
                    (materialMode === "IMPORT" &&
                      selectedPrivateMaterialId)) && (
                    <FormGroup>
                      <InputLabel>Nazwa materiału w grupie</InputLabel>
                      <ModalInput
                        type="text"
                        value={newMaterialName}
                        onChange={(e) => {
                          setNewMaterialName(e.target.value);
                          setMaterialError("");
                        }}
                        placeholder="Wpisz nazwę..."
                        disabled={isMaterialSaving}
                        autoFocus={materialMode === "CREATE"}
                      />
                    </FormGroup>
                  )}

                  {materialError && <ErrorText>{materialError}</ErrorText>}

                  <ButtonGroup style={{ marginTop: "25px" }}>
                    <ModalButton
                      type="button"
                      onClick={() => setMaterialMode(null)}
                      disabled={isMaterialSaving}
                    >
                      Wróć
                    </ModalButton>
                    <ModalButton
                      type="submit"
                      $primary
                      disabled={
                        isMaterialSaving ||
                        (materialMode === "IMPORT" &&
                          !selectedPrivateMaterialId)
                      }
                    >
                      {isMaterialSaving ? "Zapisywanie..." : "Dodaj do grupy"}
                    </ModalButton>
                  </ButtonGroup>
                </form>
              )}
            </StyledPopup>
          </>
        )}

        {/* MODAL ZMIANY NAZWY MATERIALU */}
        {isRenameModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsRenameModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Zmień nazwę</ModalTitle>
              <form onSubmit={handleSubmitRename}>
                <FormGroup>
                  <InputLabel>
                    Nowa nazwa dla:{" "}
                    {materialToRename?.name || materialToRename?.title}
                  </InputLabel>
                  <ModalInput
                    autoFocus
                    type="text"
                    value={newRenameValue}
                    onChange={(e) => {
                      setNewRenameValue(e.target.value);
                      setRenameError("");
                    }}
                    $error={!!renameError}
                  />
                  {renameError && <ErrorText>{renameError}</ErrorText>}
                </FormGroup>
                <ButtonGroup>
                  <ModalButton
                    type="button"
                    onClick={() => setIsRenameModalOpen(false)}
                  >
                    Anuluj
                  </ModalButton>
                  <ModalButton type="submit" $primary>
                    Zapisz nazwę
                  </ModalButton>
                </ButtonGroup>
              </form>
            </StyledPopup>
          </>
        )}

        {deleteModal.isOpen && (
          <>
            <ModalOverlay
              onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <ModalTitle>Potwierdź usunięcie</ModalTitle>
              <p style={{ color: "#666", marginBottom: "30px" }}>
                Czy na pewno chcesz bezpowrotnie usunąć {deleteModal.type}{" "}
                <b>{deleteModal.name}</b> ze społeczności?
              </p>
              <ButtonGroup>
                <ModalButton
                  type="button"
                  onClick={() =>
                    setDeleteModal({ ...deleteModal, isOpen: false })
                  }
                >
                  Anuluj
                </ModalButton>
                <ModalButton
                  $danger
                  onClick={async () => {
                    await handleRemoveMaterial(deleteModal.id);
                    setDeleteModal({ ...deleteModal, isOpen: false });
                  }}
                >
                  Usuń plik
                </ModalButton>
              </ButtonGroup>
            </StyledPopup>
          </>
        )}

        {confirmGroupDeleteModal && (
          <>
            <ModalOverlay
              onClick={() => !isDeleting && setConfirmGroupDeleteModal(false)}
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <ModalTitle>Usuń społeczność</ModalTitle>
              <p
                style={{
                  color: "#666",
                  marginBottom: "30px",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Czy na pewno chcesz bezpowrotnie usunąć społeczność{" "}
                <b style={{ color: "#122818" }}>{group.name}</b>? Ta operacja
                jest nieodwracalna, a wszyscy członkowie stracą do niej dostęp.
              </p>
              <ButtonGroup>
                <ModalButton
                  type="button"
                  onClick={() => {
                    setConfirmGroupDeleteModal(false);
                    setIsSettingsModalOpen(true);
                  }}
                  disabled={isDeleting}
                >
                  Anuluj
                </ModalButton>
                <ModalButton
                  type="button"
                  $danger
                  onClick={handleDeleteGroup}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Usuwanie..." : "Tak, usuń"}
                </ModalButton>
              </ButtonGroup>
            </StyledPopup>
          </>
        )}

        {/* MODAL ZARZĄDZANIA CZŁONKAMI */}
        {isManageMembersModalOpen && (
          <>
            <ModalOverlay onClick={() => setIsManageMembersModalOpen(false)} />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ width: "92%", maxWidth: "600px" }}
            >
              <ModalTitle>Zarządzaj członkami</ModalTitle>

              <ManageMembersList>
                {groupMembers.map((member) => (
                  <ManageMemberItem key={member.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Avatar>
                        {member.avatarId && member.avatarId > 0 ? (
                          <img
                            src={`/icons/avatar${member.avatarId}.png`}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          member.username.charAt(0).toUpperCase()
                        )}
                      </Avatar>
                      <MemberInfo>
                        <MemberName $isMe={member.username === currentUser}>
                          {member.username}{" "}
                          {member.username === currentUser && "(JA)"}
                        </MemberName>
                        <MemberRole>{translateRole(member.role)}</MemberRole>
                      </MemberInfo>
                    </div>

                    <MemberActions>
                      <InviteRoleSelect
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        value={member.role}
                        disabled={
                          group.userRole !== "ADMIN" ||
                          updatingUserId === member.id ||
                          member.username === currentUser
                        }
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value)
                        }
                        title={
                          group.userRole !== "ADMIN"
                            ? "Tylko administrator może zmieniać role"
                            : ""
                        }
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="EDITOR">Edytor</option>
                        <option value="VIEWER">Obserwator</option>
                      </InviteRoleSelect>

                      <TrashButton
                        disabled={
                          group.userRole !== "ADMIN" ||
                          updatingUserId === member.id ||
                          member.username === currentUser
                        }
                        onClick={() => handleRemoveUserClick(member.id)}
                        title={
                          group.userRole !== "ADMIN"
                            ? "Tylko administrator może usuwać członków"
                            : member.username === currentUser
                            ? "Aby opuścić grupę, użyj ikony wyjścia w prawym górnym rogu."
                            : "Wyrzuć ze społeczności"
                        }
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                        </svg>
                      </TrashButton>
                    </MemberActions>
                  </ManageMemberItem>
                ))}
              </ManageMembersList>

              {roleChangeError && (
                <ErrorText style={{ marginTop: "15px" }}>
                  {roleChangeError}
                </ErrorText>
              )}

              <ButtonGroup style={{ marginTop: "25px" }}>
                <ModalButton
                  type="button"
                  onClick={() => setIsManageMembersModalOpen(false)}
                >
                  Zamknij
                </ModalButton>
              </ButtonGroup>
            </StyledPopup>
          </>
        )}

        {/* MODAL OPUSZCZANIA GRUPY */}
        {confirmLeaveGroupModal && (
          <>
            <ModalOverlay
              onClick={() => !isDeleting && setConfirmLeaveGroupModal(false)}
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <ModalTitle>Opuść społeczność</ModalTitle>
              <p
                style={{
                  color: "#666",
                  marginBottom: "15px",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Czy na pewno chcesz opuścić tę społeczność? Utracisz dostęp do
                wszystkich materiałów grupowych.
              </p>
              {leaveGroupError && (
                <ErrorText style={{ marginBottom: "15px" }}>
                  {leaveGroupError}
                </ErrorText>
              )}
              <ButtonGroup>
                <ModalButton
                  type="button"
                  onClick={() => {
                    setConfirmLeaveGroupModal(false);
                    setLeaveGroupError("");
                  }}
                  disabled={isDeleting}
                >
                  Anuluj
                </ModalButton>
                <ModalButton
                  type="button"
                  $danger
                  onClick={executeLeaveGroup}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Opuszczanie..." : "Tak, opuść"}
                </ModalButton>
              </ButtonGroup>
            </StyledPopup>
          </>
        )}

        {/* MODAL WYRZUCANIA UŻYTKOWNIKA Z GRUPY */}
        {confirmRemoveUserModal.isOpen && (
          <>
            <ModalOverlay
              onClick={() => {
                setConfirmRemoveUserModal({ isOpen: false, userId: null });
                setRemoveUserError("");
                setIsManageMembersModalOpen(true);
              }}
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <ModalTitle>Wyrzuć użytkownika</ModalTitle>
              <p
                style={{
                  color: "#666",
                  marginBottom: "15px",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Czy na pewno chcesz wyrzucić tego użytkownika ze społeczności?
              </p>
              {removeUserError && (
                <ErrorText style={{ marginBottom: "15px" }}>
                  {removeUserError}
                </ErrorText>
              )}
              <ButtonGroup>
                <ModalButton
                  type="button"
                  onClick={() => {
                    setConfirmRemoveUserModal({ isOpen: false, userId: null });
                    setRemoveUserError("");
                    setIsManageMembersModalOpen(true);
                  }}
                >
                  Anuluj
                </ModalButton>
                <ModalButton type="button" $danger onClick={executeRemoveUser}>
                  Tak, wyrzuć
                </ModalButton>
              </ButtonGroup>
            </StyledPopup>
          </>
        )}
      </PageContainer>
    </Layout>
  );
};

export default SocialGroupDetails;
