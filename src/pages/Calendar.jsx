import { useState, useEffect, useRef } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import Layout from "../components/organisms/Layout";
import {
  getUsosAuthUrl,
  addRegularTagToEvent,
  removeRegularTagFromEvent,
  addEvent,
  editEventApi,
  deleteEventApi,
  editThisAndFollowingApi,
  editAllInSeriesApi,
  deleteAllInSeriesApi,
  getEventsBetween,
  getContentByTag,
} from "../api";
import CalendarGrid, {
  TAG_CONFIG,
  EVENT_COLORS,
  DAYS_PL,
  getEventsForDay,
  getWeekStart,
  isMultiDay,
  getEventStyle,
  mapBackendEvent,
} from "../components/organisms/CalendarGrid";

const MONTHS_PL = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}`;
const scaleIn = keyframes`from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}`;
const fadeInOverlay = keyframes`from{opacity:0}to{opacity:1}`;

const Wrapper = styled.div`
  display: flex;
  height: calc(100vh);
  background: ${({ theme }) => theme.colors.pageBg};
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  @media (max-width: 768px) {
    height: auto;
    overflow: visible;
  }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  @media (max-width: 768px) {
    flex: none;
    width: 100%;
  }
`;

const PageHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 14px 24px;
  background: ${({ theme }) => theme.colors.pageBg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGrey};
  flex-shrink: 0;
  @media (max-width: 768px) {
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
  }
`;

const PageHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const PageHeaderCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PageHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  display: none;
  @media (max-width: 1000px) {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid
      ${({ $open, theme }) =>
        $open ? theme.colors.secondary : theme.colors.darkGrey};
    background: ${({ theme }) => theme.colors.pageBg};
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
    transition: border-color 0.15s;
  }
`;

const FilterBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 10px;
  font-weight: 700;
  padding: 0 4px;
`;

const MultiselectInput = styled.div`
  width: 260px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid
    ${({ $open, theme }) =>
      $open ? theme.colors.secondary : theme.colors.darkGrey};
  background: ${({ theme }) => theme.colors.pageBg};
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
  @media (max-width: 1000px) {
    display: none;
  }
`;

const ChipsScroll = styled.div`
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

const SelectedChip = styled.span`
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

const SelectedChipRemove = styled.button`
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

const MultiselectTextInput = styled.input`
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

const MultiselectArrow = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

const SearchDropdown = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: calc(100% + 4px);
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 50;
  padding: 10px;
  animation: ${scaleIn} 0.15s ease;
  @media (max-width: 1000px) {
    left: auto;
    right: 0;
    width: 280px;
  }
`;

const DropdownMobileSearch = styled.div`
  display: none;
  @media (max-width: 1000px) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border: 1px solid ${({ theme }) => theme.colors.darkGrey};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.pageBg};
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
`;

const DropdownSection = styled.div`
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const DropdownSectionLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 5px;
`;

const DropdownItem = styled.div`
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

const DropdownCheck = styled.span`
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

const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borderMuted};
  margin: 6px 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  background: ${({ theme }) => theme.colors.pageBg};
  border-bottom: none;
  flex-shrink: 0;
`;

const NavBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MonthTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  min-width: 130px;
  text-align: center;
  margin: 0 8px;
`;

const ViewDropdownWrap = styled.div`
  position: relative;
`;

const ViewDropdownBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ViewDropdownList = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 4px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 100%;
`;

const ViewDropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: ${({ $active, theme }) => ($active ? 600 : 400)};
  font-family: inherit;
  border: none;
  border-radius: 6px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.text};
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const AddBtn = styled.button`
  padding: 7px 16px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const UsosBtn = styled(AddBtn)`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.borderMuted};
  padding: 9px 15px;
  font-size: 14px;
  font-weight: 600;
`;

const UsosLabel = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

// SIDEBAR
const DetailSidebar = styled.div`
  width: ${({ $open }) => ($open ? "350px" : "0")};
  overflow: hidden;
  transition: width 0.3s ease;
  background: ${({ theme }) => theme.colors.white};
  border-left: ${({ $open, theme }) =>
    $open ? `1px solid ${theme.colors.darkGrey}` : "none"};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  @media (max-width: 1200px) {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: ${({ $open }) => ($open ? "350px" : "0")};
    z-index: 50;
    border-left: none;
    box-shadow: ${({ $open }) =>
      $open ? "-4px 0 16px rgba(0,0,0,0.1)" : "none"};
  }
  @media (max-width: 768px) {
    bottom: 60px;
    width: ${({ $open }) => ($open ? "100%" : "0")};
    box-shadow: none;
  }
`;

const SidebarInner = styled.div`
  width: 350px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease;
  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
    padding: 0 0 16px;
  }
`;

const SidebarStickyTop = styled.div`
  @media (max-width: 768px) {
    position: sticky;
    top: 0;
    z-index: 2;
    background: ${({ theme }) => theme.colors.white};
    padding: 16px 16px 10px;
    margin-bottom: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderMuted};
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseBtn = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const SidebarDateLabel = styled.div`
  font-size: 22px;
  font-weight: 600;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.secondary};
`;

const SidebarEventCard = styled.div`
  background: ${({ $bg, theme }) => $bg};
  border-left: 3px solid ${({ $border, theme }) => $border};
  border-radius: 8px;
  padding: 10px 12px;
  animation: ${fadeIn} 0.25s ease;
  @media (max-width: 768px) {
    margin-left: 16px;
    margin-right: 16px;
  }
`;

const SidebarEventName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $dark, theme }) => $dark};
  margin-bottom: 4px;
  overflow-wrap: break-word;
  word-break: break-word;
`;

const SidebarEventMeta = styled.div`
  font-size: 11px;
  color: ${({ $dark, theme }) => `${$dark}99`};
  font-family: monospace;
`;

const SidebarTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
`;

const SidebarTag = styled.span`
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 20px;
  background: ${({ $bg, theme }) => $bg};
  color: ${({ $dark, theme }) => $dark};
`;

const RegularTagChip = styled.span`
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RegularTagRemove = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.6;
  &:hover {
    opacity: 1;
  }
`;

const DocTagChip = styled.button`
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.lightPrimary};
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const DocTagPopupOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInOverlay} 0.2s ease;
`;

const DocTagPopupBox = styled.div`
  background: ${({ theme }) => theme.colors.pageBg};
  border-radius: 12px;
  padding: 20px;
  min-width: 340px;
  max-width: 480px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: ${scaleIn} 0.2s ease;
`;

const DocTagPopupTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px;
`;

const DocTagPopupSection = styled.div`
  margin-bottom: 12px;
`;

const DocTagPopupSectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 6px;
`;

const DocTagPopupItem = styled.a`
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: background 0.1s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const DocTagPopupEmpty = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textLight};
  padding: 8px 0;
`;

const SidebarSection = styled.div`
  margin-top: 8px;
`;

const SidebarSectionLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 4px;
`;

// FORM SIDEBAR
const FormSidebar = styled.div`
  width: ${({ $open }) => ($open ? "350px" : "0")};
  overflow: hidden;
  transition: width 0.3s ease;
  background: ${({ theme }) => theme.colors.white};
  border-left: ${({ $open, theme }) =>
    $open ? `1px solid ${theme.colors.darkGrey}` : "none"};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  @media (max-width: 1200px) {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: ${({ $open }) => ($open ? "350px" : "0")};
    z-index: 50;
    border-left: none;
    box-shadow: ${({ $open }) =>
      $open ? "-4px 0 16px rgba(0,0,0,0.1)" : "none"};
  }
  @media (max-width: 768px) {
    bottom: 60px;
    width: ${({ $open }) => ($open ? "100%" : "0")};
    box-shadow: none;
  }
`;

const FormSidebarInner = styled.div`
  width: 350px;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease;
  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
  }
`;

const FormSidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PopupTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 12px;
  border: 1px solid
    ${({ $error, theme }) =>
      $error ? theme.colors.danger : theme.colors.darkGrey};
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.pageBg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border 0.15s;
  &:focus {
    border-color: ${({ $error, theme }) =>
      $error ? theme.colors.danger : theme.colors.secondary};
  }
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagToggle = styled.button`
  padding: 5px 10px;
  border-radius: 20px;
  border: 1.5px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.secondary : theme.colors.darkGrey};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : "transparent"};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.secondary : theme.colors.textMuted};
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: ${({ $selected, theme }) => ($selected ? 600 : 400)};
`;

const RecurRow = styled.div`
  display: flex;
  gap: 8px;
`;

const RecurBtn = styled.button`
  flex: 1;
  padding: 8px;
  border: 1.5px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.secondary : theme.colors.darkGrey};
  border-radius: 8px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.textMuted};
  font-size: 12px;
  font-weight: ${({ $active, theme }) => ($active ? 600 : 400)};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
`;

const RecurrenceSelect = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 10px;
`;

const RecurrenceOption = styled.button`
  padding: 8px 6px;
  border: 1.5px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.secondary : theme.colors.darkGrey};
  border-radius: 8px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.textMuted};
  font-size: 11px;
  font-weight: ${({ $active, theme }) => ($active ? 600 : 400)};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const CustomRecurrenceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const SmallInput = styled.input`
  width: 60px;
  padding: 7px 10px;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.pageBg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  text-align: center;
  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SmallSelect = styled.select`
  padding: 7px 10px;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.pageBg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  cursor: pointer;
  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const DayOfWeekGrid = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 10px;
`;

const DayOfWeekBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.secondary : theme.colors.darkGrey};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.textMuted};
  font-size: 11px;
  font-weight: ${({ $active, theme }) => ($active ? 700 : 500)};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const RecurrenceEndSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.darkGrey};
`;

const RecurrenceEndOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

const RecurrenceEndOption = styled.button`
  padding: 7px 6px;
  border: 1.5px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.secondary : theme.colors.darkGrey};
  border-radius: 8px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.textMuted};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const ColorSwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ColorSwatch = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2.5px solid
    ${({ $selected, $dark }) => ($selected ? $dark : "transparent")};
  background: ${({ $bg, theme }) => $bg};
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s, border-color 0.15s;
  &:hover {
    transform: scale(1.15);
  }
`;

const FieldError = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
  margin-top: 2px;
`;

const PopupActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const CancelBtn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const SaveBtn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const DeleteBtn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-right: auto;
  &:hover {
    background: ${({ theme }) => theme.colors.danger};
  }
`;

const SidebarEditBtn = styled.button`
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const TagLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const TagHelpIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.65rem;
  font-weight: bold;
  cursor: default;
  flex-shrink: 0;
  position: relative;

  &:hover > span {
    display: block;
  }
`;

const TagHelpTooltip = styled.span`
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  transform: none;
  background: ${({ theme }) => theme.colors.veryDarkPrimary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
  padding: 10px 14px;
  width: 150px;
  white-space: normal;
  line-height: 1.5;
  z-index: 100;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 8px;
    transform: none;
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
`;

const CustomTagChip = styled.div`
  padding: 2px 10px;
  min-height: 26px;
  margin: 2px;
  background: ${({ theme }) => theme.colors.lightPrimary};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CustomTagRemove = styled.div`
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  line-height: 1;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const AddTagBtn = styled.div`
  padding: 2px 8px;
  margin: 2px;
  min-height: 26px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const CustomTagInput = styled.input`
  padding: 2px 10px;
  margin: 2px;
  min-height: 26px;
  border-radius: 12px;
  border: none;
  width: 100px;
  font-size: 12px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.lightPrimary};
  color: ${({ theme }) => theme.colors.secondary};
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ScopeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInOverlay} 0.2s ease;
`;

const ScopeBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  width: 340px;
  animation: ${scaleIn} 0.2s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
`;

const ScopeTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ScopeBtn = styled.button`
  display: block;
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 8px;
  border: 1.5px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const SidebarCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

// RECURRENCE HELPERS
const RECURRENCE_PRESETS = [
  { value: "daily", label: "Codziennie" },
  { value: "weekly", label: "Co tydzień" },
  { value: "biweekly", label: "Co 2 tygodnie" },
  { value: "monthly", label: "Co miesiąc" },
  { value: "yearly", label: "Co rok" },
  { value: "custom", label: "Niestandardowe..." },
];

const CUSTOM_UNITS = [
  { value: "days", label: "dni" },
  { value: "weeks", label: "tygodni" },
  { value: "months", label: "miesięcy" },
  { value: "years", label: "lat" },
];

const DOW_LABELS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const DOW_JS = [1, 2, 3, 4, 5, 6, 0];

function describeRecurrence(ev) {
  if (!ev.recurrent) return null;
  const type = ev.recurrenceType || "weekly";
  if (type === "daily") return "codziennie";
  if (type === "weekly") return "co tydzień";
  if (type === "biweekly") return "co 2 tygodnie";
  if (type === "monthly") return "co miesiąc";
  if (type === "yearly") return "co rok";
  if (type === "custom") {
    const interval = ev.customInterval || 1;
    const unit = ev.customUnit || "weeks";
    const unitLabel = CUSTOM_UNITS.find((u) => u.value === unit)?.label || unit;
    let desc = `co ${interval} ${unitLabel}`;
    if (unit === "weeks" && ev.customDays?.length > 0) {
      const dayNames = ev.customDays
        .map((jsDay) => DOW_LABELS[DOW_JS.indexOf(jsDay)])
        .filter(Boolean)
        .join(", ");
      if (dayNames) desc += `, ${dayNames}`;
    }
    return desc;
  }
  return "cyklicznie";
}

function buildRecurrenceRule(form) {
  if (!form.recurrent) return null;
  const type = form.recurrenceType || "weekly";

  const UNIT_TO_FREQUENCY = {
    days: "DAILY",
    weeks: "WEEKLY",
    months: "MONTHLY",
    years: "YEARLY",
  };
  const PRESET_MAP = {
    daily: { frequency: "DAILY", interval: 1, daysOfWeek: null },
    weekly: { frequency: "WEEKLY", interval: 1, daysOfWeek: null },
    biweekly: { frequency: "WEEKLY", interval: 2, daysOfWeek: null },
    monthly: { frequency: "MONTHLY", interval: 1, daysOfWeek: null },
    yearly: { frequency: "YEARLY", interval: 1, daysOfWeek: null },
  };

  const recurrenceEnd =
    form.recurrenceEndType === "date" && form.recurrenceEndDate
      ? form.recurrenceEndDate
      : null;
  const occurrences =
    form.recurrenceEndType === "after" && form.recurrenceOccurrences > 0
      ? form.recurrenceOccurrences
      : 0;

  if (type === "custom") {
    const frequency = UNIT_TO_FREQUENCY[form.customUnit] || "WEEKLY";
    const interval = form.customInterval || 1;
    const daysOfWeek =
      form.customUnit === "weeks" && form.customDays?.length > 0
        ? form.customDays.map((jsDay) => (jsDay === 0 ? 7 : jsDay)).join(",")
        : null;
    return { frequency, interval, daysOfWeek, recurrenceEnd, occurrences };
  }

  const preset = PRESET_MAP[type];
  if (!preset) return null;
  return { ...preset, recurrenceEnd, occurrences };
}

const defaultFormState = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  startTime: "",
  endTime: "",
  allDay: false,
  tags: [],
  isDeadline: false,
  multiDay: false,
  recurrent: false,
  recurrenceType: "weekly",
  customInterval: 1,
  customUnit: "weeks",
  customDays: [],
  recurrenceEndType: "never",
  recurrenceEndDate: "",
  recurrenceOccurrences: 10,
  colorId: "blue",
  customTags: [],
  docTags: [],
  newTagLabel: "",
  showNewTag: false,
  showNewDocTag: false,
  newDocTagLabel: "",
};

function toLocalDateTimeISO(date, hour, min) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(min).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:00`;
}

const Calendar = () => {
  const theme = useTheme();
  const routerNavigate = useNavigate();
  const [view, setView] = useState(
    () => localStorage.getItem("calendarView") || "week"
  );
  const [viewOpen, setViewOpen] = useState(false);
  const viewDropRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [sidebar, setSidebar] = useState(null);
  const [popup, setPopup] = useState(false);

  const [form, setForm] = useState({ ...defaultFormState });
  const [formErrors, setFormErrors] = useState({});
  const [editEvent, setEditEvent] = useState(null); // { event, occurrenceDate }
  const [scopeAction, setScopeAction] = useState(null); // { type: "edit"|"delete", event, occurrenceDate }
  const [pendingSave, setPendingSave] = useState(null); // { startISO, endISO } - saved form data waiting for scope choice
  const [confirmDelete, setConfirmDelete] = useState(null); // { event, occurrenceDate, scope? }
  const [confirmUsosImport, setConfirmUsosImport] = useState(false);
  const [addingRegularTag, setAddingRegularTag] = useState(null); // eventId for which we're adding a tag
  const [newRegularTag, setNewRegularTag] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customTagSearch, setCustomTagSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const [docTagPopup, setDocTagPopup] = useState(null); // { tag, notes, sets }
  const [docTagLoading, setDocTagLoading] = useState(false);
  const [tagScopePopup, setTagScopePopup] = useState(null); // { allTags, saveRegularTags, recurrenceRule, startISO, endISO, parsedDate, parsedEndDate, sh, sm, eh, em }

  const refreshEvents = async () => {
    let startDate, endDate;
    if (view === "week") {
      const ws = getWeekStart(currentDate);
      const margin = new Date(ws);
      margin.setDate(margin.getDate() - 7);
      const we = new Date(ws);
      we.setDate(we.getDate() + 13);
      startDate = toLocalDateTimeISO(margin, 0, 0);
      endDate = toLocalDateTimeISO(we, 23, 59);
    } else {
      const first = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const margin = new Date(first);
      margin.setDate(margin.getDate() - 7);
      const last = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const marginEnd = new Date(last);
      marginEnd.setDate(marginEnd.getDate() + 7);
      startDate = toLocalDateTimeISO(margin, 0, 0);
      endDate = toLocalDateTimeISO(marginEnd, 23, 59);
    }
    const res = await getEventsBetween(startDate, endDate);
    if (res.errorCode === "" && res.events) {
      setEvents(res.events.map(mapBackendEvent));
    }
  };

  useEffect(() => {
    refreshEvents();
  }, [currentDate, view]);

  const handleDocTagClick = async (tagName) => {
    setDocTagLoading(true);
    const res = await getContentByTag(tagName);
    const notes = res.notes || [];
    const sets = res.cardSets || [];
    setDocTagPopup({ tag: tagName, notes, sets });
    setDocTagLoading(false);
  };

  const handleUsosImport = () => {
    setConfirmUsosImport(true);
  };

  const doUsosImport = async () => {
    setConfirmUsosImport(false);
    const res = await getUsosAuthUrl();
    if (res.errorCode === "TOKEN_UNDEFINED") {
      routerNavigate("/", { replace: true });
      return;
    }
    if (res.errorCode) {
      routerNavigate("/user", {
        state: { tab: "preferences", highlightUniversity: true },
      });
      return;
    }
    if (res.authUrl) {
      window.open(res.authUrl, "_blank");
      routerNavigate("/usos-callback");
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (viewDropRef.current && !viewDropRef.current.contains(e.target))
        setViewOpen(false);
    };
    if (viewOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [viewOpen]);

  // Collect available tags from events
  const getAvailableTags = () => {
    const predefined = new Set();
    const custom = new Set();
    const regular = new Set();
    events.forEach((ev) => {
      (ev.tags || []).forEach((t) => {
        if (TAG_CONFIG[t]) predefined.add(t);
      });
      (ev.customTags || []).forEach((ct) => custom.add(ct));
      (ev.regularTags || []).forEach((rt) => regular.add(rt));
    });
    const result = [];
    predefined.forEach((key) => {
      result.push({
        type: "category",
        key,
        label: TAG_CONFIG[key].label,
        icon: TAG_CONFIG[key].icon,
      });
    });
    custom.forEach((ct) => {
      result.push({ type: "category", key: `custom:${ct}`, label: ct });
    });
    regular.forEach((rt) => {
      result.push({ type: "tag", key: `regular:${rt}`, label: rt });
    });
    return result;
  };

  const toggleFilterTag = (tagKey) => {
    setFilterTags((prev) =>
      prev.includes(tagKey)
        ? prev.filter((t) => t !== tagKey)
        : [...prev, tagKey]
    );
  };

  // Filter events based on selected tags and custom search
  const filteredEvents = (() => {
    if (filterTags.length === 0 && !customTagSearch.trim()) return events;
    return events.filter((ev) => {
      // Check category/tag filters
      if (filterTags.length > 0) {
        const evPredefined = ev.tags || [];
        const evCustomKeys = (ev.customTags || []).map((ct) => `custom:${ct}`);
        const evRegularKeys = (ev.regularTags || []).map(
          (rt) => `regular:${rt}`
        );
        const matchesTag = filterTags.some(
          (ft) =>
            evPredefined.includes(ft) ||
            evCustomKeys.includes(ft) ||
            evRegularKeys.includes(ft)
        );
        if (matchesTag) return true;
      }
      // Check custom text search against regularTags
      if (customTagSearch.trim()) {
        const search = customTagSearch.trim().toLowerCase();
        const matchesRegular = (ev.regularTags || []).some((t) =>
          t.toLowerCase().includes(search)
        );
        if (matchesRegular) return true;
      }
      // If both filters are active but neither matched
      if (filterTags.length > 0) return false;
      return false;
    });
  })();

  const navigate = (dir) => {
    const dd = new Date(currentDate);
    if (view === "week") dd.setDate(dd.getDate() + dir * 7);
    else {
      dd.setDate(1);
      dd.setMonth(dd.getMonth() + dir);
    }
    setCurrentDate(dd);
  };

  const goToday = () => setCurrentDate(new Date());

  const formatDateForInput = (date) => {
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  const openEditPopup = (ev, occurrenceDate) => {
    setForm({
      title: ev.title,
      description: ev.description || "",
      date: formatDateForInput(occurrenceDate),
      endDate: ev.endDate ? formatDateForInput(ev.endDate) : "",
      allDay: !!ev.allDay,
      isDeadline: !!ev.isDeadline,
      multiDay: !!ev.endDate,
      startTime: `${String(ev.startHour).padStart(2, "0")}:${String(
        ev.startMin
      ).padStart(2, "0")}`,
      endTime: `${String(ev.endHour).padStart(2, "0")}:${String(
        ev.endMin
      ).padStart(2, "0")}`,
      tags: [...ev.tags],
      recurrent: ev.recurrent || ev.isPartOfSeries,
      recurrenceType: ev.recurrenceType || "weekly",
      customInterval: ev.customInterval || 1,
      customUnit: ev.customUnit || "weeks",
      customDays: ev.customDays ? [...ev.customDays] : [],
      recurrenceEndType: ev.recurrenceEndType || "never",
      recurrenceEndDate: ev.recurrenceEndDate || "",
      recurrenceOccurrences: ev.recurrenceOccurrences || 10,
      colorId: ev.colorId || "blue",
      customTags: ev.customTags ? [...ev.customTags] : [],
      docTags: ev.regularTags
        ? [...ev.regularTags]
        : ev.docTags
        ? [...ev.docTags]
        : [],
      newTagLabel: "",
      showNewDocTag: false,
      newDocTagLabel: "",
    });
    setEditEvent({ event: ev, occurrenceDate });
    setPopup(true);
  };

  const handleDeleteClick = async (ev, occurrenceDate) => {
    if (ev.recurrent || ev.isPartOfSeries) {
      setScopeAction({ type: "delete", event: ev, occurrenceDate });
    } else {
      if (ev.backendId) {
        const res = await deleteEventApi(ev.backendId);
        if (res.errorCode && res.errorCode !== "") return;
        await refreshEvents();
      }
      setSidebar(null);
    }
  };

  const executeEditSave = async (scope) => {
    if (!editEvent || !editEvent.event.backendId || !pendingSave) return;
    const { startISO, endISO } = pendingSave;
    const allTags = [...form.tags, ...(form.customTags || [])].filter(
      (t) => t !== "deadline"
    );
    const saveRegularTags = form.docTags || [];

    if (scope === "all") {
      const res = await editAllInSeriesApi(
        editEvent.event.backendId,
        form.title,
        form.description,
        allTags,
        saveRegularTags,
        startISO,
        endISO,
        form.colorId,
        form.isDeadline
      );
      if (res.errorCode && res.errorCode !== "") return;
    } else if (scope === "thisAndFollowing") {
      const recurrenceRule = buildRecurrenceRule(form);
      const res = await editThisAndFollowingApi(
        editEvent.event.backendId,
        form.title,
        form.description,
        allTags,
        saveRegularTags,
        startISO,
        endISO,
        form.colorId,
        form.isDeadline,
        recurrenceRule
      );
      if (res.errorCode && res.errorCode !== "") return;
    } else {
      const res = await editEventApi(
        editEvent.event.backendId,
        form.title,
        form.description,
        allTags,
        saveRegularTags,
        startISO,
        endISO,
        form.colorId,
        form.isDeadline
      );
      if (res.errorCode && res.errorCode !== "") return;
    }
    await refreshEvents();
    setSidebar(null);
    setEditEvent(null);
    setPendingSave(null);
    setForm({ ...defaultFormState });
    setPopup(false);
  };

  const handleScopeChoice = async (scope) => {
    if (!scopeAction) return;
    const { type, event: ev, occurrenceDate } = scopeAction;

    if (type === "edit") {
      setScopeAction(null);
      await executeEditSave(scope);
      return;
    }

    if (type === "delete") {
      setScopeAction(null);
      setConfirmDelete({ event: ev, occurrenceDate, scope });
      return;
    }

    setScopeAction(null);
  };

  const handleTagScopeChoice = async (scope) => {
    if (!tagScopePopup) return;
    const {
      allTags,
      saveRegularTags,
      recurrenceRule,
      startISO,
      endISO,
      deleteBeforeId,
    } = tagScopePopup;

    let eventTags, recurringEventTags;
    if (scope === "all") {
      // Tags assigned to all events in the series
      eventTags = allTags;
      recurringEventTags = allTags;
    } else {
      // Tags assigned only to the first event
      eventTags = allTags;
      recurringEventTags = null;
    }

    // konwersja single → cyclic: najpierw usun oryginalny event
    if (deleteBeforeId) {
      const delRes = await deleteEventApi(deleteBeforeId);
      if (delRes.errorCode && delRes.errorCode !== "") {
        setTagScopePopup(null);
        return;
      }
    }

    const res = await addEvent(
      form.title,
      form.description,
      eventTags,
      saveRegularTags,
      startISO,
      endISO,
      form.colorId,
      form.isDeadline,
      recurrenceRule,
      recurringEventTags
    );
    setTagScopePopup(null);
    if (res.errorCode && res.errorCode !== "") return;

    await refreshEvents();
    setEditEvent(null);
    setForm({ ...defaultFormState });
    setPopup(false);
  };

  //  REGULAR TAG HANDLERS
  const handleAddRegularTag = async (ev) => {
    const value = newRegularTag.trim();
    setNewRegularTag("");
    setAddingRegularTag(null);
    if (!value || !ev.backendId) return;
    if (ev.regularTags && ev.regularTags.includes(value)) return;

    const res = await addRegularTagToEvent(ev.backendId, value);
    if (res.errorCode === "") {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === ev.id
            ? { ...e, regularTags: [...(e.regularTags || []), value] }
            : e
        )
      );
      setSidebar((s) => {
        if (!s) return null;
        return {
          ...s,
          events: s.events.map((e) =>
            e.id === ev.id
              ? { ...e, regularTags: [...(e.regularTags || []), value] }
              : e
          ),
        };
      });
    }
  };

  const handleRemoveRegularTag = async (ev, tagName) => {
    if (!ev.backendId) return;
    const res = await removeRegularTagFromEvent(ev.backendId, tagName);
    if (res.errorCode === "") {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === ev.id
            ? {
                ...e,
                regularTags: (e.regularTags || []).filter((t) => t !== tagName),
              }
            : e
        )
      );
      setSidebar((s) => {
        if (!s) return null;
        return {
          ...s,
          events: s.events.map((e) =>
            e.id === ev.id
              ? {
                  ...e,
                  regularTags: (e.regularTags || []).filter(
                    (t) => t !== tagName
                  ),
                }
              : e
          ),
        };
      });
    }
  };

  // SIDEBAR
  const renderSidebar = () => {
    if (!sidebar) return null;
    const { date, events: evs } = sidebar;
    const sorted = [...evs].sort(
      (a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin)
    );

    return (
      <SidebarInner>
        <SidebarStickyTop>
          <SidebarHeader>
            <SidebarTitle>Szczegóły</SidebarTitle>
            <CloseBtn onClick={() => setSidebar(null)}>×</CloseBtn>
          </SidebarHeader>
          <SidebarDateLabel>
            {date.getDate()} {MONTHS_PL[date.getMonth()]}
          </SidebarDateLabel>
          <div
            style={{
              fontSize: 11,
              color: theme.colors.textMuted,
              fontWeight: 500,
            }}
          >
            {DAYS_PL[date.getDay()]}, {evs.length}{" "}
            {evs.length === 1 ? "wydarzenie" : "wydarzenia"}
          </div>
        </SidebarStickyTop>
        {sorted.map((ev) => {
          const style = getEventStyle(ev, theme);
          const predefinedTags = (ev.tags || []).filter((t) => TAG_CONFIG[t]);
          const otherTags = (ev.tags || []).filter((t) => !TAG_CONFIG[t]);

          return (
            <SidebarEventCard key={ev.id} $bg={style.bg} $border={style.dark}>
              <SidebarCardHeader>
                <SidebarEventName
                  $dark={style.dark}
                  style={{ marginBottom: 0 }}
                >
                  {ev.title}
                </SidebarEventName>
                <SidebarEditBtn onClick={() => openEditPopup(ev, date)}>
                  Edytuj
                </SidebarEditBtn>
              </SidebarCardHeader>
              <SidebarEventMeta $dark={style.dark}>
                {isMultiDay(ev) && ev.allDay
                  ? `${ev.date.getDate()} ${MONTHS_PL[ev.date.getMonth()].slice(
                      0,
                      3
                    )} – ${ev.endDate.getDate()} ${MONTHS_PL[
                      ev.endDate.getMonth()
                    ].slice(0, 3)} · Całodniowy`
                  : isMultiDay(ev)
                  ? `${ev.date.getDate()} ${MONTHS_PL[ev.date.getMonth()].slice(
                      0,
                      3
                    )} ${String(ev.startHour).padStart(2, "0")}:${String(
                      ev.startMin
                    ).padStart(2, "0")} – ${ev.endDate.getDate()} ${MONTHS_PL[
                      ev.endDate.getMonth()
                    ].slice(0, 3)} ${String(ev.endHour).padStart(
                      2,
                      "0"
                    )}:${String(ev.endMin).padStart(2, "0")}`
                  : ev.startHour === 0 &&
                    ev.startMin === 0 &&
                    ev.endHour === 23 &&
                    ev.endMin === 59
                  ? "Całodniowy"
                  : `${String(ev.startHour).padStart(2, "0")}:${String(
                      ev.startMin
                    ).padStart(2, "0")} – ${String(ev.endHour).padStart(
                      2,
                      "0"
                    )}:${String(ev.endMin).padStart(2, "0")}`}
                {(ev.recurrent || ev.isPartOfSeries) &&
                  ` · 🔁 ${
                    ev.recurrent ? describeRecurrence(ev) : "cyklicznie"
                  }`}
              </SidebarEventMeta>

              {ev.description && (
                <div
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                    lineHeight: 1.4,
                    marginTop: 2,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {ev.description}
                </div>
              )}

              {(predefinedTags.length > 0 ||
                (ev.customTags || []).length > 0 ||
                otherTags.length > 0) && (
                <SidebarTagRow>
                  {predefinedTags.map((t) => (
                    <SidebarTag key={t} $bg={style.bg} $dark={style.dark}>
                      {TAG_CONFIG[t].icon} {TAG_CONFIG[t].label}
                    </SidebarTag>
                  ))}
                  {(ev.customTags || []).map((ct) => (
                    <SidebarTag
                      key={`ct-${ct}`}
                      $bg={style.bg}
                      $dark={style.dark}
                    >
                      {ct}
                    </SidebarTag>
                  ))}
                  {otherTags.map((t) => (
                    <SidebarTag key={t} $bg={style.bg} $dark={style.dark}>
                      {t}
                    </SidebarTag>
                  ))}
                </SidebarTagRow>
              )}

              {(ev.regularTags || []).length > 0 && (
                <SidebarSection>
                  <SidebarSectionLabel>Tagi</SidebarSectionLabel>
                  <SidebarTagRow>
                    {(ev.regularTags || []).map((t) => (
                      <DocTagChip key={t} onClick={() => handleDocTagClick(t)}>
                        {t}
                      </DocTagChip>
                    ))}
                  </SidebarTagRow>
                </SidebarSection>
              )}
            </SidebarEventCard>
          );
        })}
      </SidebarInner>
    );
  };

  // ADD POPUP
  const renderPopup = () => {
    const toggleTag = (tag) => {
      setForm((f) => ({
        ...f,
        tags: f.tags.includes(tag)
          ? f.tags.filter((t) => t !== tag)
          : [...f.tags, tag],
      }));
    };

    const handleSave = async () => {
      const errors = {};
      if (!form.title.trim()) errors.title = "Tytuł jest wymagany";
      if (!form.date) errors.date = "Data rozpoczęcia jest wymagana";
      if (!form.allDay && !form.startTime)
        errors.startTime = "Godzina rozpoczęcia jest wymagana";
      if (!form.allDay && !form.endTime)
        errors.endTime = "Godzina zakończenia jest wymagana";
      if (form.multiDay && !form.endDate)
        errors.endDate = "Data zakończenia jest wymagana";

      // Validate time format (HH:MM, 00-23:00-59)
      const validTime = (t) => {
        if (!t) return false;
        const m = t.match(/^(\d{2}):(\d{2})$/);
        if (!m) return false;
        const h = parseInt(m[1]),
          min = parseInt(m[2]);
        return h >= 0 && h <= 23 && min >= 0 && min <= 59;
      };
      if (!form.allDay && form.startTime && !validTime(form.startTime)) {
        errors.startTime = "Niepoprawna godzina (HH:MM, 00:00–23:59)";
      }
      if (!form.allDay && form.endTime && !validTime(form.endTime)) {
        errors.endTime = "Niepoprawna godzina (HH:MM, 00:00–23:59)";
      }

      // Validate date/time logic
      if (form.date && form.endDate && form.multiDay) {
        if (form.endDate < form.date) {
          errors.endDate =
            "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia";
        }
      }
      if (
        !form.allDay &&
        form.startTime &&
        form.endTime &&
        !errors.startTime &&
        !errors.endTime
      ) {
        const sameDay = !form.multiDay || form.date === form.endDate;
        if (sameDay && form.endTime <= form.startTime) {
          errors.endTime =
            "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia";
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      const [sh, sm] = form.allDay
        ? [0, 0]
        : form.startTime.split(":").map(Number);
      const [eh, em] = form.allDay
        ? [23, 59]
        : form.endTime.split(":").map(Number);
      const [fy, fm, fd] = form.date.split("-").map(Number);
      const parsedDate = new Date(fy, fm - 1, fd);
      const parsedEndDate = form.endDate
        ? (() => {
            const [ey, em2, ed] = form.endDate.split("-").map(Number);
            return new Date(ey, em2 - 1, ed);
          })()
        : null;
      const startISO = toLocalDateTimeISO(parsedDate, sh, sm);
      const endISO = toLocalDateTimeISO(parsedEndDate || parsedDate, eh, em);

      if (editEvent) {
        if (editEvent.event.backendId) {
          // If part of series, ask user about scope before saving
          if (editEvent.event.isPartOfSeries) {
            setPendingSave({ startISO, endISO });
            setScopeAction({
              type: "edit",
              event: editEvent.event,
              occurrenceDate: editEvent.occurrenceDate,
            });
            return;
          }

          const allTags = [...form.tags, ...(form.customTags || [])].filter(
            (t) => t !== "deadline"
          );
          const saveRegularTags = form.docTags || [];
          const recurrenceRule = buildRecurrenceRule(form);

          if (recurrenceRule && !editEvent.event.isPartOfSeries) {
            // Converting single event to recurring: delete old, create new series
            // If tags present, ask about tag scope first (tags on first only vs all)
            if (allTags.length > 0) {
              setTagScopePopup({
                allTags,
                saveRegularTags,
                recurrenceRule,
                startISO,
                endISO,
                parsedDate,
                parsedEndDate,
                sh,
                sm,
                eh,
                em,
                deleteBeforeId: editEvent.event.backendId,
              });
              return;
            }
            const delRes = await deleteEventApi(editEvent.event.backendId);
            if (delRes.errorCode && delRes.errorCode !== "") return;
            const addRes = await addEvent(
              form.title,
              form.description,
              allTags,
              saveRegularTags,
              startISO,
              endISO,
              form.colorId,
              form.isDeadline,
              recurrenceRule
            );
            if (addRes.errorCode && addRes.errorCode !== "") return;
          } else {
            const res = await editEventApi(
              editEvent.event.backendId,
              form.title,
              form.description,
              allTags,
              saveRegularTags,
              startISO,
              endISO,
              form.colorId,
              form.isDeadline
            );
            if (res.errorCode && res.errorCode !== "") return;
          }
          await refreshEvents();
        }
        setSidebar(null);
        setEditEvent(null);
      } else {
        // Add new event
        const allTags = [...form.tags, ...(form.customTags || [])].filter(
          (t) => t !== "deadline"
        );
        const saveRegularTags = form.docTags || [];
        const recurrenceRule = buildRecurrenceRule(form);

        // If recurring event has tags, ask user about tag scope
        if (recurrenceRule && allTags.length > 0) {
          setTagScopePopup({
            allTags,
            saveRegularTags,
            recurrenceRule,
            startISO,
            endISO,
            parsedDate,
            parsedEndDate,
            sh,
            sm,
            eh,
            em,
          });
          return;
        }

        const res = await addEvent(
          form.title,
          form.description,
          allTags,
          saveRegularTags,
          startISO,
          endISO,
          form.colorId,
          form.isDeadline,
          recurrenceRule
        );
        if (res.errorCode && res.errorCode !== "") return;
        await refreshEvents();
      }

      setForm({ ...defaultFormState });
      setPopup(false);
    };

    const handleDelete = () => {
      if (!editEvent) return;
      handleDeleteClick(editEvent.event, editEvent.occurrenceDate);
      setEditEvent(null);
      setForm({ ...defaultFormState });
      setPopup(false);
    };

    const handleClose = () => {
      setPopup(false);
      setEditEvent(null);
      setConfirmDelete(null);
      setForm({ ...defaultFormState });
      setFormErrors({});
    };

    return (
      <FormSidebarInner>
        <FormSidebarHeader>
          <PopupTitle>{editEvent ? "Edytuj event" : "Nowy event"}</PopupTitle>
          <CloseBtn onClick={handleClose}>×</CloseBtn>
        </FormSidebarHeader>

        <FormGroup>
          <Label>Nazwa</Label>
          <Input
            $error={formErrors.title}
            placeholder="Np. Wykład z matematyki"
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              setFormErrors((e) => ({ ...e, title: false }));
            }}
          />
          {formErrors.title && <FieldError>{formErrors.title}</FieldError>}
        </FormGroup>

        <FormGroup>
          <Label>Opis</Label>
          <Input
            as="textarea"
            placeholder="Opis wydarzenia (opcjonalny)"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            style={{ minHeight: 60, resize: "vertical" }}
          />
        </FormGroup>

        <FormGroup>
          <Label>Data rozpoczęcia</Label>
          <Input
            $error={formErrors.date}
            type="date"
            value={form.date}
            onChange={(e) => {
              setForm((f) => ({ ...f, date: e.target.value }));
              setFormErrors((e) => ({ ...e, date: false }));
            }}
          />
          {formErrors.date && <FieldError>{formErrors.date}</FieldError>}
        </FormGroup>

        <FormGroup>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.multiDay}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  multiDay: e.target.checked,
                  endDate: e.target.checked ? f.endDate : "",
                }))
              }
              style={{
                width: 16,
                height: 16,
                accentColor: theme.colors.secondary,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: theme.colors.text,
              }}
            >
              Wielodniowy
            </span>
          </label>
          {form.multiDay && (
            <>
              <Label style={{ marginTop: 6 }}>Data zakończenia</Label>
              <Input
                $error={formErrors.endDate}
                type="date"
                value={form.endDate}
                onChange={(e) => {
                  setForm((f) => ({ ...f, endDate: e.target.value }));
                  setFormErrors((e) => ({ ...e, endDate: false }));
                }}
              />
              {formErrors.endDate && (
                <FieldError>{formErrors.endDate}</FieldError>
              )}
            </>
          )}
        </FormGroup>

        <FormGroup>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) =>
                setForm((f) => ({ ...f, allDay: e.target.checked }))
              }
              style={{
                width: 16,
                height: 16,
                accentColor: theme.colors.secondary,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: theme.colors.text,
              }}
            >
              Całodniowy
            </span>
          </label>
        </FormGroup>

        {!form.allDay && (
          <FormGroup>
            <Label>Godzina</Label>
            <Row2>
              <Input
                $error={formErrors.startTime}
                type="text"
                placeholder="HH:MM"
                value={form.startTime}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9:]/g, "");
                  if (
                    v.length === 2 &&
                    !v.includes(":") &&
                    form.startTime.length < 2
                  )
                    v += ":";
                  if (v.length > 5) v = v.slice(0, 5);
                  setForm((f) => ({ ...f, startTime: v }));
                  setFormErrors((e2) => ({ ...e2, startTime: false }));
                }}
              />
              <Input
                $error={formErrors.endTime}
                type="text"
                placeholder="HH:MM"
                value={form.endTime}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9:]/g, "");
                  if (
                    v.length === 2 &&
                    !v.includes(":") &&
                    form.endTime.length < 2
                  )
                    v += ":";
                  if (v.length > 5) v = v.slice(0, 5);
                  setForm((f) => ({ ...f, endTime: v }));
                  setFormErrors((e2) => ({ ...e2, endTime: false }));
                }}
              />
            </Row2>
            {(formErrors.startTime || formErrors.endTime) && (
              <FieldError>
                {formErrors.startTime || formErrors.endTime}
              </FieldError>
            )}
          </FormGroup>
        )}

        <FormGroup>
          <Label>Kategorie</Label>
          <TagGrid>
            {Object.entries(TAG_CONFIG)
              .filter(([key]) => key !== "deadline")
              .map(([key, val]) => (
                <TagToggle
                  key={key}
                  $selected={form.tags.includes(key)}
                  $bg={val.color}
                  $dark={val.dark}
                  onClick={() => toggleTag(key)}
                >
                  {val.icon} {val.label}
                </TagToggle>
              ))}
            {form.customTags.map((ct) => (
              <CustomTagChip key={ct}>
                {ct}
                <CustomTagRemove
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      customTags: f.customTags.filter((t) => t !== ct),
                    }))
                  }
                >
                  x
                </CustomTagRemove>
              </CustomTagChip>
            ))}
            {form.showNewTag ? (
              <CustomTagInput
                autoFocus
                placeholder="tag..."
                value={form.newTagLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, newTagLabel: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const label = form.newTagLabel.trim();
                    if (!label) return;
                    setForm((f) => ({
                      ...f,
                      customTags: [...f.customTags, label],
                      newTagLabel: "",
                      showNewTag: false,
                    }));
                  }
                  if (e.key === "Escape")
                    setForm((f) => ({
                      ...f,
                      showNewTag: false,
                      newTagLabel: "",
                    }));
                }}
                onBlur={() =>
                  setForm((f) => ({ ...f, showNewTag: false, newTagLabel: "" }))
                }
              />
            ) : (
              <AddTagBtn
                onClick={() => setForm((f) => ({ ...f, showNewTag: true }))}
              >
                +
              </AddTagBtn>
            )}
          </TagGrid>
        </FormGroup>

        <FormGroup>
          <TagLabelRow>
            <Label style={{ margin: 0 }}>Tagi</Label>
            <TagHelpIcon>
              ?
              <TagHelpTooltip>
                Tagi pozwalają powiązać event z zestawami fiszek. Dzięki temu
                możesz szybko odnaleźć materiały do nauki przypisane do tego
                wydarzenia.
              </TagHelpTooltip>
            </TagHelpIcon>
          </TagLabelRow>
          <TagGrid>
            {form.docTags.map((dt) => (
              <DocTagChip key={dt} as="span" style={{ cursor: "default" }}>
                {dt}
                <CustomTagRemove
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      docTags: f.docTags.filter((t) => t !== dt),
                    }))
                  }
                >
                  x
                </CustomTagRemove>
              </DocTagChip>
            ))}
            {form.showNewDocTag ? (
              <CustomTagInput
                autoFocus
                placeholder="nazwa..."
                value={form.newDocTagLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, newDocTagLabel: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const label = form.newDocTagLabel.trim();
                    if (!label) return;
                    setForm((f) => ({
                      ...f,
                      docTags: [...f.docTags, label],
                      newDocTagLabel: "",
                      showNewDocTag: false,
                    }));
                  }
                  if (e.key === "Escape")
                    setForm((f) => ({
                      ...f,
                      showNewDocTag: false,
                      newDocTagLabel: "",
                    }));
                }}
                onBlur={() =>
                  setForm((f) => ({
                    ...f,
                    showNewDocTag: false,
                    newDocTagLabel: "",
                  }))
                }
              />
            ) : (
              <AddTagBtn
                onClick={() => setForm((f) => ({ ...f, showNewDocTag: true }))}
              >
                +
              </AddTagBtn>
            )}
          </TagGrid>
        </FormGroup>

        <FormGroup>
          <Label>Kolor</Label>
          <ColorSwatchRow>
            {EVENT_COLORS.map((c) => (
              <ColorSwatch
                key={c.id}
                type="button"
                $bg={c.bg}
                $dark={c.dark}
                $selected={form.colorId === c.id}
                onClick={() => setForm((f) => ({ ...f, colorId: c.id }))}
              />
            ))}
          </ColorSwatchRow>
        </FormGroup>

        <FormGroup>
          <Label>Powtarzanie</Label>
          <RecurRow>
            <RecurBtn
              $active={!form.recurrent}
              onClick={() => setForm((f) => ({ ...f, recurrent: false }))}
            >
              Jednorazowo
            </RecurBtn>
            <RecurBtn
              $active={form.recurrent}
              onClick={() => setForm((f) => ({ ...f, recurrent: true }))}
            >
              Cyklicznie
            </RecurBtn>
          </RecurRow>
          {form.recurrent && (
            <>
              <RecurrenceSelect>
                {RECURRENCE_PRESETS.map((opt) => (
                  <RecurrenceOption
                    key={opt.value}
                    $active={form.recurrenceType === opt.value}
                    onClick={() =>
                      setForm((f) => ({ ...f, recurrenceType: opt.value }))
                    }
                  >
                    {opt.label}
                  </RecurrenceOption>
                ))}
              </RecurrenceSelect>
              {form.recurrenceType === "custom" && (
                <>
                  <CustomRecurrenceRow>
                    <span
                      style={{ fontSize: 12, color: theme.colors.textMuted }}
                    >
                      Co
                    </span>
                    <SmallInput
                      type="number"
                      min={1}
                      value={form.customInterval}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          customInterval: Math.max(
                            1,
                            parseInt(e.target.value) || 1
                          ),
                        }))
                      }
                    />
                    <SmallSelect
                      value={form.customUnit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          customUnit: e.target.value,
                          customDays: [],
                        }))
                      }
                    >
                      {CUSTOM_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </SmallSelect>
                  </CustomRecurrenceRow>
                  {form.customUnit === "weeks" && (
                    <DayOfWeekGrid>
                      {DOW_LABELS.map((label, idx) => {
                        const jsDay = DOW_JS[idx];
                        const active = form.customDays.includes(jsDay);
                        return (
                          <DayOfWeekBtn
                            key={jsDay}
                            $active={active}
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                customDays: active
                                  ? f.customDays.filter((d) => d !== jsDay)
                                  : [...f.customDays, jsDay],
                              }))
                            }
                          >
                            {label}
                          </DayOfWeekBtn>
                        );
                      })}
                    </DayOfWeekGrid>
                  )}
                </>
              )}
              <RecurrenceEndSection>
                <span
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                    marginBottom: 4,
                  }}
                >
                  Kończy się
                </span>
                <RecurrenceEndOptions>
                  <RecurrenceEndOption
                    $active={form.recurrenceEndType === "never"}
                    onClick={() =>
                      setForm((f) => ({ ...f, recurrenceEndType: "never" }))
                    }
                  >
                    Nigdy
                  </RecurrenceEndOption>
                  <RecurrenceEndOption
                    $active={form.recurrenceEndType === "date"}
                    onClick={() =>
                      setForm((f) => ({ ...f, recurrenceEndType: "date" }))
                    }
                  >
                    W dniu
                  </RecurrenceEndOption>
                  <RecurrenceEndOption
                    $active={form.recurrenceEndType === "after"}
                    onClick={() =>
                      setForm((f) => ({ ...f, recurrenceEndType: "after" }))
                    }
                  >
                    Po
                  </RecurrenceEndOption>
                </RecurrenceEndOptions>
                {form.recurrenceEndType === "date" && (
                  <SmallInput
                    as="input"
                    type="date"
                    value={form.recurrenceEndDate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        recurrenceEndDate: e.target.value,
                      }))
                    }
                    style={{ width: "100%", marginTop: 6, textAlign: "left" }}
                  />
                )}
                {form.recurrenceEndType === "after" && (
                  <CustomRecurrenceRow style={{ marginTop: 6 }}>
                    <SmallInput
                      type="number"
                      min={1}
                      value={form.recurrenceOccurrences}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          recurrenceOccurrences: Math.max(
                            1,
                            parseInt(e.target.value) || 1
                          ),
                        }))
                      }
                    />
                    <span
                      style={{ fontSize: 12, color: theme.colors.textMuted }}
                    >
                      wystąpień
                    </span>
                  </CustomRecurrenceRow>
                )}
              </RecurrenceEndSection>
            </>
          )}
        </FormGroup>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          <input
            type="checkbox"
            checked={form.isDeadline}
            onChange={(e) =>
              setForm((f) => ({ ...f, isDeadline: e.target.checked }))
            }
            style={{ width: 16, height: 16, accentColor: theme.colors.danger }}
          />
          <span
            style={{ fontSize: 13, fontWeight: 500, color: theme.colors.text }}
          >
            Deadline
          </span>
        </label>

        <PopupActions>
          {editEvent && (
            <DeleteBtn
              onClick={() => {
                if (editEvent.event.isPartOfSeries) {
                  setScopeAction({
                    type: "delete",
                    event: editEvent.event,
                    occurrenceDate: editEvent.occurrenceDate,
                  });
                } else {
                  setConfirmDelete({
                    event: editEvent.event,
                    occurrenceDate: editEvent.occurrenceDate,
                  });
                }
              }}
            >
              Usuń
            </DeleteBtn>
          )}
          <CancelBtn onClick={handleClose}>Anuluj</CancelBtn>
          <SaveBtn onClick={handleSave}>
            {editEvent ? "Zapisz" : "Dodaj event"}
          </SaveBtn>
        </PopupActions>
      </FormSidebarInner>
    );
  };

  const headerTitle = () => {
    if (view === "week") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${MONTHS_PL[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      }
      return `${MONTHS_PL[weekStart.getMonth()]} – ${
        MONTHS_PL[weekEnd.getMonth()]
      } ${weekEnd.getFullYear()}`;
    }
    return `${MONTHS_PL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <Layout>
      <Wrapper>
        <Main>
          <PageHeader>
            <PageHeaderLeft />
            <PageHeaderCenter>
              <NavBtn onClick={() => navigate(-1)}>‹</NavBtn>
              <MonthTitle>{headerTitle()}</MonthTitle>
              <NavBtn onClick={() => navigate(1)}>›</NavBtn>
            </PageHeaderCenter>
            <PageHeaderRight>
              <SearchContainer ref={searchRef}>
                <FilterButton
                  $open={searchOpen}
                  onClick={() => setSearchOpen((v) => !v)}
                >
                  🔍 Filtruj
                  {filterTags.length + (customTagSearch.trim() ? 1 : 0) > 0 && (
                    <FilterBadge>
                      {filterTags.length + (customTagSearch.trim() ? 1 : 0)}
                    </FilterBadge>
                  )}
                </FilterButton>
                <MultiselectInput
                  $open={searchOpen}
                  onClick={() => {
                    setSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 0);
                  }}
                >
                  {(() => {
                    const available = getAvailableTags();
                    const allSelected = [
                      ...filterTags.map((ft) => {
                        const tag = available.find((t) => t.key === ft);
                        return {
                          key: ft,
                          label: tag
                            ? tag.icon
                              ? `${tag.icon} ${tag.label}`
                              : tag.label
                            : ft,
                          type: "tag",
                        };
                      }),
                      ...(customTagSearch.trim()
                        ? [
                            {
                              key: "__custom__",
                              label: `"${customTagSearch.trim()}"`,
                              type: "custom",
                            },
                          ]
                        : []),
                    ];
                    return (
                      <ChipsScroll>
                        {[...allSelected].reverse().map((s) => (
                          <SelectedChip key={s.key}>
                            {s.label}
                            <SelectedChipRemove
                              onClick={(e) => {
                                e.stopPropagation();
                                if (s.type === "custom") setCustomTagSearch("");
                                else toggleFilterTag(s.key);
                              }}
                            >
                              ×
                            </SelectedChipRemove>
                          </SelectedChip>
                        ))}
                      </ChipsScroll>
                    );
                  })()}
                  <MultiselectTextInput
                    ref={searchInputRef}
                    placeholder={
                      filterTags.length === 0 && !customTagSearch.trim()
                        ? "Filtruj wyniki..."
                        : ""
                    }
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (!searchOpen) setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchText.trim()) {
                        setCustomTagSearch(searchText.trim());
                        setSearchText("");
                        setSearchOpen(false);
                      }
                      if (e.key === "Backspace" && !searchText) {
                        if (customTagSearch.trim()) {
                          setCustomTagSearch("");
                        } else if (filterTags.length > 0) {
                          setFilterTags((prev) => prev.slice(0, -1));
                        }
                      }
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setSearchText("");
                        searchInputRef.current?.blur();
                      }
                    }}
                  />
                  <MultiselectArrow>{searchOpen ? "▲" : "▼"}</MultiselectArrow>
                </MultiselectInput>
                {searchOpen &&
                  (() => {
                    const available = getAvailableTags();
                    const query = searchText.toLowerCase();
                    const categoryTags = available.filter(
                      (t) =>
                        t.type === "category" &&
                        (!query || t.label.toLowerCase().includes(query))
                    );
                    const regularTags = available.filter(
                      (t) =>
                        t.type === "tag" &&
                        (!query || t.label.toLowerCase().includes(query))
                    );
                    const hasResults =
                      categoryTags.length > 0 || regularTags.length > 0;
                    return (
                      <SearchDropdown onMouseDown={(e) => e.preventDefault()}>
                        <DropdownMobileSearch>
                          {filterTags.map((ft) => {
                            const tag = available.find((t) => t.key === ft);
                            const label = tag
                              ? tag.icon
                                ? `${tag.icon} ${tag.label}`
                                : tag.label
                              : ft;
                            return (
                              <SelectedChip key={ft}>
                                {label}
                                <SelectedChipRemove
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFilterTag(ft);
                                  }}
                                >
                                  ×
                                </SelectedChipRemove>
                              </SelectedChip>
                            );
                          })}
                          {customTagSearch.trim() && (
                            <SelectedChip>
                              "{customTagSearch.trim()}"
                              <SelectedChipRemove
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomTagSearch("");
                                }}
                              >
                                ×
                              </SelectedChipRemove>
                            </SelectedChip>
                          )}
                          <MultiselectTextInput
                            placeholder={
                              filterTags.length === 0 && !customTagSearch.trim()
                                ? "Szukaj..."
                                : ""
                            }
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && searchText.trim()) {
                                setCustomTagSearch(searchText.trim());
                                setSearchText("");
                              }
                              if (e.key === "Backspace" && !searchText) {
                                if (customTagSearch.trim()) {
                                  setCustomTagSearch("");
                                } else if (filterTags.length > 0) {
                                  setFilterTags((prev) => prev.slice(0, -1));
                                }
                              }
                            }}
                            autoFocus
                          />
                        </DropdownMobileSearch>
                        {categoryTags.length > 0 && (
                          <DropdownSection>
                            <DropdownSectionLabel>
                              Kategorie
                            </DropdownSectionLabel>
                            {categoryTags.map((t) => (
                              <DropdownItem
                                key={t.key}
                                onClick={() => {
                                  toggleFilterTag(t.key);
                                  setSearchText("");
                                  setTimeout(
                                    () => searchInputRef.current?.focus(),
                                    0
                                  );
                                }}
                              >
                                <DropdownCheck
                                  $checked={filterTags.includes(t.key)}
                                >
                                  {filterTags.includes(t.key) && "✓"}
                                </DropdownCheck>
                                {t.icon ? `${t.icon} ` : ""}
                                {t.label}
                              </DropdownItem>
                            ))}
                          </DropdownSection>
                        )}
                        {regularTags.length > 0 && (
                          <DropdownSection>
                            <DropdownSectionLabel>Tagi</DropdownSectionLabel>
                            {regularTags.map((t) => (
                              <DropdownItem
                                key={t.key}
                                onClick={() => {
                                  toggleFilterTag(t.key);
                                  setSearchText("");
                                  setTimeout(
                                    () => searchInputRef.current?.focus(),
                                    0
                                  );
                                }}
                              >
                                <DropdownCheck
                                  $checked={filterTags.includes(t.key)}
                                >
                                  {filterTags.includes(t.key) && "✓"}
                                </DropdownCheck>
                                {t.label}
                              </DropdownItem>
                            ))}
                          </DropdownSection>
                        )}
                        {!hasResults && searchText.trim() && (
                          <DropdownSection>
                            <DropdownItem
                              onClick={() => {
                                setCustomTagSearch(searchText.trim());
                                setSearchText("");
                                setSearchOpen(false);
                              }}
                              style={{ color: theme.colors.secondary }}
                            >
                              Szukaj „{searchText.trim()}" w tagach ↵
                            </DropdownItem>
                          </DropdownSection>
                        )}
                      </SearchDropdown>
                    );
                  })()}
              </SearchContainer>
            </PageHeaderRight>
          </PageHeader>

          <Header>
            <UsosBtn onClick={handleUsosImport}>
              <img
                src="/icons/usos2.png"
                alt="USOS"
                style={{ width: 20, height: 20, borderRadius: 4 }}
              />
              <UsosLabel>Importuj z USOS</UsosLabel>
            </UsosBtn>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <AddBtn
                onClick={() => {
                  const selectedDay = sidebar
                    ? new Date(sidebar.date)
                    : new Date(currentDate);
                  const yyyy = selectedDay.getFullYear();
                  const mm = String(selectedDay.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const dd = String(selectedDay.getDate()).padStart(2, "0");
                  setForm((f) => ({
                    ...defaultFormState,
                    date: `${yyyy}-${mm}-${dd}`,
                  }));
                  setEditEvent(null);
                  setPopup(true);
                }}
              >
                + Dodaj
              </AddBtn>
              <AddBtn
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSidebar({
                    date: today,
                    events: getEventsForDay(filteredEvents, today),
                  });
                }}
                style={{
                  background: theme.colors.white,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.borderMuted}`,
                }}
              >
                Dziś
              </AddBtn>
              <ViewDropdownWrap ref={viewDropRef}>
                <ViewDropdownBtn
                  type="button"
                  onClick={() => setViewOpen((o) => !o)}
                >
                  {view === "week" ? "Tydzień" : "Miesiąc"}
                  <span style={{ fontSize: 9, color: theme.colors.textLight }}>
                    {viewOpen ? "▲" : "▼"}
                  </span>
                </ViewDropdownBtn>
                {viewOpen && (
                  <ViewDropdownList>
                    <ViewDropdownItem
                      $active={view === "week"}
                      onClick={() => {
                        setView("week");
                        localStorage.setItem("calendarView", "week");
                        setViewOpen(false);
                      }}
                    >
                      Tydzień
                    </ViewDropdownItem>
                    <ViewDropdownItem
                      $active={view === "month"}
                      onClick={() => {
                        setView("month");
                        localStorage.setItem("calendarView", "month");
                        setViewOpen(false);
                      }}
                    >
                      Miesiąc
                    </ViewDropdownItem>
                  </ViewDropdownList>
                )}
              </ViewDropdownWrap>
            </div>
          </Header>

          <CalendarGrid
            view={view}
            currentDate={currentDate}
            events={filteredEvents}
            selectedDate={sidebar ? sidebar.date : null}
            onDayClick={(day, dayEvents) =>
              setSidebar({ date: day, events: dayEvents })
            }
          />
        </Main>

        <DetailSidebar $open={!!sidebar && !popup}>
          {renderSidebar()}
        </DetailSidebar>

        <FormSidebar $open={popup}>{popup && renderPopup()}</FormSidebar>

        {confirmUsosImport && (
          <ScopeOverlay
            onClick={(e) =>
              e.target === e.currentTarget && setConfirmUsosImport(false)
            }
          >
            <ScopeBox>
              <ScopeTitle>Import planu z USOS</ScopeTitle>
              <div
                style={{
                  padding: "0 16px 12px",
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Jeśli masz już zaimportowany plan z USOS, zostanie on nadpisany
                nowym- wszystkie dotychczasowe wydarzenia USOS zostaną usunięte.
              </div>
              <ScopeBtn
                onClick={doUsosImport}
                style={{
                  color: theme.colors.danger,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Znam ryzyko, kontynuuj
              </ScopeBtn>
              <CancelBtn
                onClick={() => setConfirmUsosImport(false)}
                style={{ width: "100%", marginTop: 4 }}
              >
                Anuluj
              </CancelBtn>
            </ScopeBox>
          </ScopeOverlay>
        )}

        {confirmDelete && (
          <ScopeOverlay
            onClick={(e) =>
              e.target === e.currentTarget && setConfirmDelete(null)
            }
          >
            <ScopeBox>
              <ScopeTitle>
                {confirmDelete.scope === "all"
                  ? "Czy na pewno chcesz usunąć wszystkie wystąpienia?"
                  : "Czy na pewno chcesz usunąć to wydarzenie?"}
              </ScopeTitle>
              <ScopeBtn
                onClick={async () => {
                  const { event: ev, scope } = confirmDelete;
                  if (ev.backendId) {
                    const res =
                      scope === "all"
                        ? await deleteAllInSeriesApi(ev.backendId)
                        : await deleteEventApi(ev.backendId);
                    if (res.errorCode && res.errorCode !== "") {
                      setConfirmDelete(null);
                      return;
                    }
                  }
                  await refreshEvents();
                  setConfirmDelete(null);
                  setEditEvent(null);
                  setForm({ ...defaultFormState });
                  setPopup(false);
                  setSidebar(null);
                }}
                style={{
                  color: theme.colors.danger,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Usuń
              </ScopeBtn>
              <CancelBtn
                onClick={() => setConfirmDelete(null)}
                style={{ width: "100%", marginTop: 4 }}
              >
                Anuluj
              </CancelBtn>
            </ScopeBox>
          </ScopeOverlay>
        )}

        {scopeAction && (
          <ScopeOverlay
            onClick={(e) =>
              e.target === e.currentTarget && setScopeAction(null)
            }
          >
            <ScopeBox>
              <ScopeTitle>
                {scopeAction.type === "edit"
                  ? "Edytuj wydarzenie cykliczne"
                  : "Usuń wydarzenie cykliczne"}
              </ScopeTitle>
              <ScopeBtn onClick={() => handleScopeChoice("this")}>
                Tylko to wystąpienie
              </ScopeBtn>
              {scopeAction.type === "edit" && (
                <ScopeBtn onClick={() => handleScopeChoice("thisAndFollowing")}>
                  To i przyszłe wydarzenia
                </ScopeBtn>
              )}
              <ScopeBtn onClick={() => handleScopeChoice("all")}>
                Wszystkie wystąpienia
              </ScopeBtn>
              <CancelBtn
                onClick={() => {
                  setScopeAction(null);
                  setPendingSave(null);
                }}
                style={{ width: "100%", marginTop: 4 }}
              >
                Anuluj
              </CancelBtn>
            </ScopeBox>
          </ScopeOverlay>
        )}
        {tagScopePopup && (
          <ScopeOverlay
            onClick={(e) =>
              e.target === e.currentTarget && setTagScopePopup(null)
            }
          >
            <ScopeBox>
              <ScopeTitle>Przypisanie tagów</ScopeTitle>
              <p
                style={{
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  margin: "0 0 12px",
                  textAlign: "center",
                }}
              >
                Czy tagi mają być przypisane do wszystkich wystąpień w serii,
                czy tylko do tego wydarzenia?
              </p>
              <ScopeBtn onClick={() => handleTagScopeChoice("all")}>
                Wszystkie wystąpienia
              </ScopeBtn>
              <ScopeBtn onClick={() => handleTagScopeChoice("this")}>
                Tylko to wydarzenie
              </ScopeBtn>
              <CancelBtn
                onClick={() => setTagScopePopup(null)}
                style={{ width: "100%", marginTop: 4 }}
              >
                Anuluj
              </CancelBtn>
            </ScopeBox>
          </ScopeOverlay>
        )}
        {docTagPopup && (
          <DocTagPopupOverlay onClick={() => setDocTagPopup(null)}>
            <DocTagPopupBox onClick={(e) => e.stopPropagation()}>
              <DocTagPopupTitle>„{docTagPopup.tag}"</DocTagPopupTitle>

              <DocTagPopupSection>
                <DocTagPopupSectionLabel>Dokumenty</DocTagPopupSectionLabel>
                {docTagPopup.notes.length > 0 ? (
                  docTagPopup.notes.map((n) => (
                    <DocTagPopupItem
                      key={n.id}
                      href={`/note/${n.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {n.name}
                    </DocTagPopupItem>
                  ))
                ) : (
                  <DocTagPopupEmpty>
                    Brak pasujących dokumentów
                  </DocTagPopupEmpty>
                )}
              </DocTagPopupSection>

              <DocTagPopupSection>
                <DocTagPopupSectionLabel>
                  Zestawy fiszek
                </DocTagPopupSectionLabel>
                {docTagPopup.sets.length > 0 ? (
                  docTagPopup.sets.map((s) => (
                    <DocTagPopupItem
                      key={s.id}
                      href={`/learning/set/${s.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.name || s.title}
                    </DocTagPopupItem>
                  ))
                ) : (
                  <DocTagPopupEmpty>
                    Brak pasujących zestawów fiszek
                  </DocTagPopupEmpty>
                )}
              </DocTagPopupSection>
            </DocTagPopupBox>
          </DocTagPopupOverlay>
        )}
      </Wrapper>
    </Layout>
  );
};

export default Calendar;
