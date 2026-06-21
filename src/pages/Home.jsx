import styled, { useTheme } from "styled-components";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, parseJwt, removeToken } from "../token";
import Layout from "../components/organisms/Layout";
import {
  getAllNotes,
  getAllFolders,
  getRecentFlashcardSets,
  getFlashcardSetStats,
  getEventsBetween,
  getNotifications,
  getUserSocialGroups,
} from "../api";
import CalendarGrid, {
  getWeekStart,
  mapBackendEvent,
  TAG_CONFIG,
} from "../components/organisms/CalendarGrid";
import NotificationsDropdown from "../components/organisms/NotificationsDropdown";
import Box from "../components/atoms/Box";
import HelpIcon from "../components/atoms/HelpIcon";
import Logo from "../components/atoms/Logo";

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

function toLocalDateTimeISO(date, hour, min) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(min).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:00`;
}

const StyledContainer = styled.div`
  padding: 30px 40px 27px;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 0.2s ease;

  @media (max-width: 768px) {
    padding: 16px 12px 20px;
    gap: 15px;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
  min-height: 42px;
`;

const StyledName = styled.h2`
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 2rem;
  cursor: default;
  margin: 0;
  line-height: 1;
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const MobileProfileButton = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.veryDarkPrimary};
    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 3.8fr 6.2fr;
  gap: 20px;
  align-items: stretch;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 768px) {
    display: contents;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  justify-content: space-between;
  min-width: 0;
  @media (max-width: 768px) {
    display: contents;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  min-width: 0;
  @media (max-width: 768px) {
    display: contents;
  }
`;

const CardBox = styled(Box)`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  @media (max-width: 768px) {
    padding: 18px 14px;
  }
`;

const FiszkiBox = styled(CardBox)`
  min-height: 250px;
  @media (max-width: 768px) {
    min-height: unset;
    order: 1;
  }
`;
const NotatkiBox = styled(CardBox)`
  min-height: 250px;
  @media (max-width: 768px) {
    min-height: unset;
    order: 2;
  }
`;
const DeadlinesBox = styled(CardBox)`
  flex: 1;
  min-height: 250px;
  @media (max-width: 768px) {
    min-height: unset;
    order: 5;
  }
`;
const CalendarBox = styled(CardBox)`
  flex: 2 0 550px;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex: none;
    height: auto;
    overflow: visible;
  }
  @media (max-width: 768px) {
    order: 4;
  }
`;
const SocialBox = styled(CardBox)`
  flex: 1;
  min-height: 250px;
  @media (max-width: 768px) {
    min-height: unset;
    order: 3;
  }
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 768px) {
    display: contents;
  }
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 1.4rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;
const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  position: relative;
`;

const ListItem = styled.div`
  background-color: ${({ $isEmpty, theme }) =>
    $isEmpty ? theme.colors.lightPrimary : theme.colors.darkPageBg};
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0.6 : 1)};
  border-radius: 12px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ $isEmpty }) => ($isEmpty ? "default" : "pointer")};
  transition: transform 0.2s;
  min-height: 40px;

  &:hover {
    transform: ${({ $isEmpty }) => ($isEmpty ? "none" : "translateX(5px)")};
  }
`;

const SimpleListItem = styled.div`
  background-color: ${({ $isEmpty, theme }) =>
    $isEmpty ? theme.colors.lightPrimary : theme.colors.darkPageBg};
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0.6 : 1)};
  border-radius: 12px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  min-height: 40px;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding-right: 15px;
`;

const ItemTitle = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const ItemSub = styled.span`
  font-size: 0.75rem;
  color: #555;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const ItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
`;

const DeadlineIcon = styled.span`
  ${({ $extra }) =>
    $extra &&
    `
    @media (max-width: 768px) {
      display: none;
    }
  `}
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 8px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.borderMuted};
`;
const ProgressGreen = styled.div`
  width: 50%;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const ProgressBlue = styled.div`
  width: 50%;
  background-color: #e4fafd;
`;

const TagPill = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
`;

const DesktopViewToggle = styled.div`
  display: flex;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileViewDropdownWrap = styled.div`
  display: none;
  position: relative;
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileViewDropdownBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey || "#ccc"};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white || "#fff"};
  color: ${({ theme }) => theme.colors.text || "#333"};
  cursor: pointer;
`;

const MobileViewDropdownList = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: ${({ theme }) => theme.colors.white || "#fff"};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey || "#ccc"};
  border-radius: 8px;
  padding: 4px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 100%;
`;

const MobileViewDropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  font-family: inherit;
  border: none;
  border-radius: 6px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary || "#c5d89a" : "transparent"};
  color: ${({ $active, theme }) =>
    $active
      ? theme.colors.secondary || "#4a7c3f"
      : theme.colors.text || "#333"};
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
`;

const EmptyPlaceholder = styled.div`
  opacity: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MoreButton = styled.div`
  text-align: right;
  margin-top: auto;
  color: #707a73;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding-top: 15px;
  &:hover {
    color: #122818;
  }
`;

const FoldersRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 24px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const FolderBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 90px;
`;

const FolderIcon = styled.div`
  width: 45px;
  height: 40px;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 140%;
    height: 140%;
  }
`;

const FolderName = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  width: 100%;
  text-align: center;

  /* zamiast jednej linijki pozwalamy na max 2 linijki tekstu */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
`;

const BellIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};

  svg {
    width: 28px;
    height: 28px;
    transition: transform 0.2s, color 0.2s;
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const EmptyDataMessage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;

  @media (max-width: 768px) {
    position: static;
    padding: 12px 0;
  }
`;


const GreetingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    gap: 5px;
  }
`;


const Home = () => {
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [recentSets, setRecentSets] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentFolders, setRecentFolders] = useState([]);

  const [allFoldersList, setAllFoldersList] = useState([]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [allGroups, setAllGroups] = useState([]);
  const [pinnedGroupIds, setPinnedGroupIds] = useState(() =>
    JSON.parse(localStorage.getItem("pinnedSocialGroups") || "[]")
  );

  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(
    () => localStorage.getItem("calendarView") || "week"
  );
  const [events, setEvents] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const viewDropRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (viewDropRef.current && !viewDropRef.current.contains(e.target)) {
        setViewOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();

    return events
      .filter((ev) => {
        if (!ev.isDeadline) return false;

        const eventEnd = new Date(ev.endDate || ev.date);

        if (ev.allDay) {
          eventEnd.setHours(23, 59, 59, 999);
        } else {
          eventEnd.setHours(
            ev.endHour !== undefined ? ev.endHour : 23,
            ev.endMin !== undefined ? ev.endMin : 59,
            59,
            999
          );
        }

        return eventEnd >= now;
      })
      .sort((a, b) => {
        const startA = new Date(a.date);
        startA.setHours(
          a.allDay ? 0 : a.startHour || 0,
          a.allDay ? 0 : a.startMin || 0,
          0,
          0
        );

        const startB = new Date(b.date);
        startB.setHours(
          b.allDay ? 0 : b.startHour || 0,
          b.allDay ? 0 : b.startMin || 0,
          0,
          0
        );

        return startA - startB;
      })
      .slice(0, 3);
  }, [events]);

  useEffect(() => {
    const fetchEvents = async () => {
      let startDate, endDate;
      if (calendarView === "week") {
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
    fetchEvents();
  }, [currentDate, calendarView]);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "week") d.setDate(d.getDate() - 7);
    else {
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "week") d.setDate(d.getDate() + 7);
    else {
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const headerTitle = () => {
    if (calendarView === "week") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekStart.getMonth() === weekEnd.getMonth())
        return `${MONTHS_PL[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      return `${MONTHS_PL[weekStart.getMonth()]} – ${
        MONTHS_PL[weekEnd.getMonth()]
      } ${weekEnd.getFullYear()}`;
    }
    return `${MONTHS_PL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  useEffect(() => {
    const jwt = getToken();
    if (!jwt) {
      navigate("/", { replace: true });
      return;
    }
    const tokenContent = parseJwt(jwt);
    setUsername(tokenContent?.sub);

    const fetchData = async () => {
      setIsReady(false);
      try {
        const [notesData, foldersData, recentSetsData, groupsData] =
          await Promise.all([
            getAllNotes(),
            getAllFolders(),
            getRecentFlashcardSets(),
            getUserSocialGroups(),
          ]);

        if (
          [notesData, foldersData, recentSetsData, groupsData].some(
            (d) => d?.errorCode === "TOKEN_UNDEFINED"
          )
        ) {
          removeToken();
          navigate("/", { replace: true });
          return;
        }

        const notesArray = Array.isArray(notesData)
          ? notesData
          : notesData.notes || [];
        const foldersArray = Array.isArray(foldersData)
          ? foldersData
          : foldersData.folders || [];
        const setsArray = recentSetsData.errorCode
          ? []
          : recentSetsData.sets || [];

        const setsWithStats = await Promise.all(
          setsArray.map(async (set) => {
            const statsRes = await getFlashcardSetStats(set.id);

            let rawStats = parseFloat(statsRes.stats);
            if (isNaN(rawStats)) rawStats = 0;
            let progressPercent =
              rawStats <= 1 && rawStats > 0 ? rawStats * 100 : rawStats;

            const activityVal =
              set.lastActivity ??
              set.last_activity ??
              set.lastActivityTime ??
              set.updatedAt ??
              set.createTime;
            const timestamp = parseDateFromBackend(activityVal);

            return {
              ...set,
              progress: progressPercent || 0,
              _sortTime: timestamp,
            };
          })
        );

        const unfinishedFastSessions = setsWithStats
          .filter((set) => {
            const progress = Number(set.progress);
            return Number.isFinite(progress) && progress > 0 && progress < 100;
          })
          .sort((a, b) => b._sortTime - a._sortTime);

        const sortedFolders = [...foldersArray]
          .filter((f) => f.name !== "/")
          .sort((a, b) => (b.id || 0) - (a.id || 0));

        const sortedNotes = [...notesArray].sort((a, b) => {
          const dateA = new Date(
            a.editTime ?? a.lastEdited ?? a.createTime ?? 0
          ).getTime();
          const dateB = new Date(
            b.editTime ?? b.lastEdited ?? b.createTime ?? 0
          ).getTime();
          if (!dateA || isNaN(dateA) || dateA === 0)
            return (b.id || 0) - (a.id || 0);
          return dateB - dateA;
        });

        setRecentSets(unfinishedFastSessions.slice(0, 3));
        setRecentNotes(sortedNotes.slice(0, 3));
        setRecentFolders(sortedFolders.slice(0, 3));
        setAllFoldersList(foldersArray);

        const groupsArray = groupsData.errorCode ? [] : groupsData;
        setAllGroups(groupsArray);
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
      } finally {
        setIsReady(true);
      }
    };

    fetchData();
  }, [navigate]);

  const refreshUnreadCount = async () => {
    const res = await getNotifications();
    if (!res.errorCode) {
      const count = res.notifications.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  const recentGroups = useMemo(() => {
    const sorted = [...allGroups].sort((a, b) => {
      const aPinned = pinnedGroupIds.includes(a.id);
      const bPinned = pinnedGroupIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return b.id - a.id;
    });
    return sorted.slice(0, 3);
  }, [allGroups, pinnedGroupIds]);

  const togglePinGroup = (e, groupId) => {
    e.stopPropagation();
    setPinnedGroupIds((prev) => {
      const newPinned = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];
      localStorage.setItem("pinnedSocialGroups", JSON.stringify(newPinned));
      return newPinned;
    });
  };

  const formatActivityDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return "Brak aktywności";
    const date = new Date(timestamp);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFolderFullPath = (folder) => {
    if (!folder || folder.name === "/") return "";
    return folder.path === "/"
      ? "/" + folder.name
      : folder.path + "/" + folder.name;
  };

  const getNotePath = (note) => {
    if (note.folderId !== undefined && note.folderId !== null) {
      const parentFolder = allFoldersList.find((f) => f.id === note.folderId);
      if (parentFolder && parentFolder.name !== "/") {
        const fullPath = getFolderFullPath(parentFolder);
        const formatted = fullPath.split("/").filter(Boolean).join(" > ");
        if (formatted) return formatted;
      }
    }
    return "Katalog główny";
  };

  const handleFolderClick = (folder) => {
    const fullPath = getFolderFullPath(folder);
    const segments = fullPath
      .split("/")
      .filter(Boolean)
      .map((s) => encodeURIComponent(s));
    navigate(`/notes/${segments.join("/")}`);
  };

  const renderEmptyNotes = (currentLength, maxSlots) => {
    const emptySlots = [];
    for (let i = currentLength; i < maxSlots; i++) {
      emptySlots.push(
        <ListItem key={`empty-note-${i}`} $isEmpty={true}>
          <ItemInfo>
            <ItemTitle>&nbsp;</ItemTitle>
          </ItemInfo>
        </ListItem>
      );
    }
    return emptySlots;
  };

  const renderEmptySets = (currentLength, maxSlots) => {
    const emptySlots = [];
    for (let i = currentLength; i < maxSlots; i++) {
      emptySlots.push(
        <ListItem key={`empty-set-${i}`} $isEmpty={true}>
          <ItemInfo>
            <ItemTitle>&nbsp;</ItemTitle>
            <ItemSub>&nbsp;</ItemSub>
          </ItemInfo>
        </ListItem>
      );
    }
    return emptySlots;
  };

  const renderEmptyDeadlines = (currentLength, maxSlots) => {
    const emptySlots = [];
    for (let i = currentLength; i < maxSlots; i++) {
      emptySlots.push(
        <ListItem key={`empty-dl-${i}`} $isEmpty={true}>
          <ItemInfo>
            <ItemTitle>&nbsp;</ItemTitle>
            <ItemSub>&nbsp;</ItemSub>
          </ItemInfo>
        </ListItem>
      );
    }
    return emptySlots;
  };

  const renderEmptyGroups = (currentLength, maxSlots) => {
    const emptySlots = [];
    for (let i = currentLength; i < maxSlots; i++) {
      emptySlots.push(
        <ListItem key={`empty-grp-${i}`} $isEmpty={true}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div style={{ width: "38px", height: "38px", flexShrink: 0 }}></div>
            <ItemInfo>
              <ItemTitle>&nbsp;</ItemTitle>
              <ItemSub>&nbsp;</ItemSub>
            </ItemInfo>
          </div>
        </ListItem>
      );
    }
    return emptySlots;
  };

  const parseDateFromBackend = (dateVal) => {
    if (!dateVal) return 0;
    if (Array.isArray(dateVal) && dateVal.length >= 3) {
      return new Date(
        dateVal[0],
        dateVal[1] - 1,
        dateVal[2],
        dateVal[3] || 0,
        dateVal[4] || 0,
        dateVal[5] || 0
      ).getTime();
    }
    const parsed = new Date(dateVal).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <Layout>
      <StyledContainer $ready={isReady}>
        <StyledHeader>
          <GreetingWrapper>
            <Logo size="mini" />
            <StyledName>Witaj, {username || "użytkowniku"}!</StyledName>
          </GreetingWrapper>
          <HeaderRight>
            <MobileProfileButton onClick={() => navigate("/user")}>
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
            </MobileProfileButton>
            <BellIconWrapper onMouseDown={(e) => e.stopPropagation()}>
              <svg
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "12px",
                    height: "12px",
                    backgroundColor: theme.colors.danger || "#e74c3c",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}

              {isNotificationsOpen && (
                <NotificationsDropdown
                  onClose={() => setIsNotificationsOpen(false)}
                  onRefresh={refreshUnreadCount}
                />
              )}
            </BellIconWrapper>
          </HeaderRight>
        </StyledHeader>

        {/* GÓRNY RZĄD */}
        <DashboardLayout>
          <LeftColumn>
            <FiszkiBox>
              <CardTitle>
                <div style={{ display: "flex", alignItems: "center" }}>
                  Wróć do nauki
                  <HelpIcon style={{ marginLeft: '10px' }} tooltip={<>Tu wyświetlają się Twoje aktywne sesje{" "}<b style={{ color: theme.colors.secondary }}>Szybkiej nauki</b>, które nie zostały ukończone w 100%.</>} />
                </div>
              </CardTitle>
              <ItemList>
                {recentSets.length > 0 ? (
                  <>
                    {recentSets.map((set) => {
                      const validProgress = isNaN(set.progress)
                        ? 0
                        : set.progress;
                      const greenWidth = Math.min(
                        Math.max(validProgress, 0),
                        100
                      );
                      const blueWidth = 100 - greenWidth;

                      return (
                        <ListItem
                          key={set.id}
                          onClick={() => navigate(`/learning/fast/${set.id}`)}
                        >
                          <ItemInfo>
                            <ItemTitle>{set.name}</ItemTitle>
                            <ItemSub>
                              Ostatnia aktywność:{" "}
                              {formatActivityDate(set._sortTime)}
                            </ItemSub>
                          </ItemInfo>

                          <ItemMeta>
                            <ProgressBar>
                              <ProgressGreen
                                style={{ width: `${greenWidth}%` }}
                              />
                              <ProgressBlue
                                style={{ width: `${blueWidth}%` }}
                              />
                            </ProgressBar>
                          </ItemMeta>
                        </ListItem>
                      );
                    })}
                    {recentSets.length < 3 &&
                      renderEmptySets(recentSets.length, 3)}
                  </>
                ) : (
                  <>
                    <EmptyPlaceholder>{renderEmptySets(0, 3)}</EmptyPlaceholder>
                    <EmptyDataMessage>
                      Brak ostatnich zestawów.
                    </EmptyDataMessage>
                  </>
                )}
              </ItemList>
              <MoreButton onClick={() => navigate("/learning")}>
                Więcej...
              </MoreButton>
            </FiszkiBox>

            <NotatkiBox>
              <CardTitle>Ostatnie notatki</CardTitle>
              <FoldersRow>
                {recentFolders.length > 0 ? (
                  recentFolders.map((folder) => (
                    <FolderBox
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                    >
                      <FolderIcon>
                        <svg fill="currentColor" viewBox="0 0 16 16">
                          <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                        </svg>
                      </FolderIcon>
                      <FolderName>{folder.name}</FolderName>
                    </FolderBox>
                  ))
                ) : (
                  <FolderBox onClick={() => navigate("/notes")}>
                    <FolderIcon>
                      <svg fill="currentColor" viewBox="0 0 16 16">
                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                      </svg>
                    </FolderIcon>
                    <FolderName>Folder główny</FolderName>
                  </FolderBox>
                )}
              </FoldersRow>

              <ItemList>
                {recentNotes.length > 0 ? (
                  <>
                    {recentNotes.map((note) => (
                      <ListItem
                        key={note.id}
                        onClick={() => navigate(`/note/${note.id}`)}
                      >
                        <ItemInfo>
                          <ItemTitle>{note.name || "Brak nazwy"}</ItemTitle>
                        </ItemInfo>
                        <ItemMeta>
                          <TagPill>
                            <i>{getNotePath(note)}</i>
                          </TagPill>
                        </ItemMeta>
                      </ListItem>
                    ))}
                    {recentNotes.length < 3 &&
                      renderEmptyNotes(recentNotes.length, 3)}
                  </>
                ) : (
                  <>
                    <EmptyPlaceholder>
                      {renderEmptyNotes(0, 3)}
                    </EmptyPlaceholder>
                    <EmptyDataMessage>Brak ostatnich notatek.</EmptyDataMessage>
                  </>
                )}
              </ItemList>
              <MoreButton onClick={() => navigate("/notes")}>
                Więcej...
              </MoreButton>
            </NotatkiBox>
          </LeftColumn>

          <RightColumn>
            <CalendarBox
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardTitle style={{ marginBottom: "15px" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    onClick={handlePrev}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "1.4rem",
                      color: theme.colors.veryDarkPrimary || "#122818",
                      padding: "0 5px",
                    }}
                  >
                    ‹
                  </button>
                  <span
                    style={{
                      fontSize: "1rem",
                      textAlign: "center",
                    }}
                  >
                    {headerTitle()}
                  </span>
                  <button
                    onClick={handleNext}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "1.4rem",
                      color: theme.colors.veryDarkPrimary || "#122818",
                      padding: "0 5px",
                    }}
                  >
                    ›
                  </button>
                </div>

                <DesktopViewToggle>
                  <button
                    onClick={() => {
                      setCalendarView("week");
                      localStorage.setItem("calendarView", "week");
                    }}
                    style={{
                      border: "none",
                      background:
                        calendarView === "week"
                          ? theme.colors.lightPrimary || "#e6eadb"
                          : "transparent",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: theme.colors.veryDarkPrimary || "#122818",
                      transition: "all 0.2s",
                    }}
                  >
                    Tydzień
                  </button>
                  <button
                    onClick={() => {
                      setCalendarView("month");
                      localStorage.setItem("calendarView", "month");
                    }}
                    style={{
                      border: "none",
                      background:
                        calendarView === "month"
                          ? theme.colors.lightPrimary || "#e6eadb"
                          : "transparent",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: theme.colors.veryDarkPrimary || "#122818",
                      transition: "all 0.2s",
                    }}
                  >
                    Miesiąc
                  </button>
                </DesktopViewToggle>
                <MobileViewDropdownWrap ref={viewDropRef}>
                  <MobileViewDropdownBtn
                    type="button"
                    onClick={() => setViewOpen((o) => !o)}
                  >
                    {calendarView === "week" ? "Tydzień" : "Miesiąc"}
                    <span
                      style={{ fontSize: 9, color: theme.colors.textLight }}
                    >
                      {viewOpen ? "▲" : "▼"}
                    </span>
                  </MobileViewDropdownBtn>
                  {viewOpen && (
                    <MobileViewDropdownList>
                      <MobileViewDropdownItem
                        $active={calendarView === "week"}
                        onClick={() => {
                          setCalendarView("week");
                          localStorage.setItem("calendarView", "week");
                          setViewOpen(false);
                        }}
                      >
                        Tydzień
                      </MobileViewDropdownItem>
                      <MobileViewDropdownItem
                        $active={calendarView === "month"}
                        onClick={() => {
                          setCalendarView("month");
                          localStorage.setItem("calendarView", "month");
                          setViewOpen(false);
                        }}
                      >
                        Miesiąc
                      </MobileViewDropdownItem>
                    </MobileViewDropdownList>
                  )}
                </MobileViewDropdownWrap>
              </CardTitle>

              <div
                style={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderTop: `1px solid ${theme.colors.borderLight || "#eee"}`,
                  paddingTop: "10px",
                }}
              >
                <CalendarGrid
                  view={calendarView}
                  currentDate={currentDate}
                  events={events}
                  onDayClick={(day) =>
                    navigate("/calendar", { state: { selectedDate: day } })
                  }
                  startHour={8}
                  endHour={21}
                  dashboardMode={true}
                />
              </div>
            </CalendarBox>
          </RightColumn>
        </DashboardLayout>

        {/* DOLNY RZĄD */}
        <BottomRow>
          <SocialBox>
            <CardTitle>Społeczności</CardTitle>
            <ItemList>
              {recentGroups.length > 0 ? (
                <>
                  {recentGroups.map((group) => {
                    const isPinned = pinnedGroupIds.includes(group.id);

                    return (
                      <ListItem
                        key={group.id}
                        onClick={() => navigate(`/social/${group.id}`)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flex: 1,
                            minWidth: 0,
                            paddingRight: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              backgroundColor: theme.colors.lightGrey,
                              color: theme.colors.veryDarkPrimary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 16 16"
                              style={{ width: "20px", height: "20px" }}
                            >
                              <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                            </svg>
                          </div>

                          <ItemInfo>
                            <ItemTitle>{group.name}</ItemTitle>
                            <ItemSub>
                              {group.description || "Brak opisu"}
                            </ItemSub>
                          </ItemInfo>
                        </div>

                        <ItemMeta
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <TagPill
                            style={{
                              backgroundColor: theme.colors.lightGrey,
                              padding: "3px 8px",
                              borderRadius: "8px",
                            }}
                          >
                            {group.userRole === "ADMIN"
                              ? "Administrator"
                              : group.userRole === "EDITOR"
                              ? "Edytor"
                              : group.userRole === "VIEWER"
                              ? "Obserwator"
                              : "Członek"}
                          </TagPill>

                          <div
                            onClick={(e) => togglePinGroup(e, group.id)}
                            title={isPinned ? "Odepnij" : "Przypnij na górze"}
                            style={{
                              cursor: "pointer",
                              color: isPinned
                                ? "#ffdf60"
                                : theme.colors.borderMuted,
                              display: "flex",
                              alignItems: "center",
                              transition: "color 0.2s, transform 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 16 16"
                              style={{ width: "18px", height: "18px" }}
                              stroke={isPinned ? "#d9a400" : "currentColor"}
                              strokeWidth="0.5"
                            >
                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                          </div>
                        </ItemMeta>
                      </ListItem>
                    );
                  })}
                  {recentGroups.length < 3 &&
                    renderEmptyGroups(recentGroups.length, 3)}
                </>
              ) : (
                <>
                  <EmptyPlaceholder>{renderEmptyGroups(0, 3)}</EmptyPlaceholder>
                  <EmptyDataMessage>
                    Nie należysz do żadnej społeczności.
                  </EmptyDataMessage>
                </>
              )}
            </ItemList>
            <MoreButton onClick={() => navigate("/social")}>
              Więcej...
            </MoreButton>
          </SocialBox>

          <DeadlinesBox>
            <CardTitle>Bliskie terminy</CardTitle>
            <ItemList>
              {upcomingDeadlines.length > 0 ? (
                <>
                  {/* bedziemy wyswietlac ikonki zamiast kategorii */}
                  {upcomingDeadlines.map((deadline) => {
                    const icons = (deadline.tags || [])
                      .map((tag) => TAG_CONFIG[tag]?.icon)
                      .filter(Boolean);

                    return (
                      <ListItem
                        key={deadline.id}
                        onClick={() =>
                          navigate("/calendar", {
                            state: { selectedDate: deadline.date },
                          })
                        }
                        style={{
                          borderLeft: `4px solid ${
                            theme.colors.danger || "#ef4444"
                          }`,
                        }}
                      >
                        <ItemInfo>
                          <ItemTitle>{deadline.title}</ItemTitle>
                          <ItemSub>
                            {deadline.date.toLocaleDateString("pl-PL", {
                              day: "2-digit",
                              month: "short",
                            })}
                            {deadline.allDay
                              ? ""
                              : ` o ${String(deadline.startHour).padStart(
                                  2,
                                  "0"
                                )}:${String(deadline.startMin).padStart(
                                  2,
                                  "0"
                                )}`}
                          </ItemSub>
                        </ItemInfo>
                        {icons.length > 0 && (
                          <ItemMeta>
                            <div
                              style={{
                                display: "flex",
                                gap: "4px",
                                fontSize: "0.95rem",
                                alignItems: "center",
                              }}
                            >
                              {icons.slice(0, 3).map((icon, idx) => (
                                <DeadlineIcon
                                  key={idx}
                                  title="Kategoria"
                                  $extra={idx >= 1}
                                >
                                  {icon}
                                </DeadlineIcon>
                              ))}
                            </div>
                          </ItemMeta>
                        )}
                      </ListItem>
                    );
                  })}
                  {upcomingDeadlines.length < 3 &&
                    renderEmptyDeadlines(upcomingDeadlines.length, 3)}
                </>
              ) : (
                <>
                  <EmptyPlaceholder>
                    {renderEmptyDeadlines(0, 3)}
                  </EmptyPlaceholder>
                  <EmptyDataMessage>Brak bliskich terminów.</EmptyDataMessage>
                </>
              )}
            </ItemList>
            <MoreButton onClick={() => navigate("/calendar")}>
              Więcej...
            </MoreButton>
          </DeadlinesBox>
        </BottomRow>
      </StyledContainer>
    </Layout>
  );
};

export default Home;
