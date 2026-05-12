import { useState, useEffect, useRef } from "react";
import styled, { keyframes, useTheme } from "styled-components";

const TAG_CONFIG = {
  Egzamin: { label: "Egzamin", icon: "📝" },
  Kolos: { label: "Kolos", icon: "📋" },
  Wykład: { label: "Wykład", icon: "🎓" },
  Wyjazd: { label: "Wyjazd", icon: "🧳" },
  "Praca domowa": { label: "Praca domowa", icon: "📚" },
  "Zajęcia terenowe": { label: "Zajęcia terenowe", icon: "🌿" },
  Korepetycje: { label: "Korepetycje", icon: "👨‍🏫" },
  Praca: { label: "Praca", icon: "💼" },
  Piwo: { label: "Piwo", icon: "🍺" },
  USOS: { label: "USOS", icon: "🎓" },
  deadline: { label: "Deadline", icon: "⏰" },
};

const EVENT_COLORS = [
  { id: "blue", bg: "rgb(232, 244, 253)", dark: "rgb(24, 95, 165)" },
  { id: "green", bg: "rgb(234, 243, 222)", dark: "rgb(59, 109, 17)" },
  { id: "purple", bg: "rgb(238, 237, 254)", dark: "rgb(60, 52, 137)" },
  { id: "amber", bg: "rgb(250, 238, 218)", dark: "rgb(186, 117, 23)" },
  { id: "red", bg: "rgb(252, 235, 235)", dark: "rgb(226, 75, 74)" },
  { id: "teal", bg: "rgb(225, 245, 244)", dark: "rgb(17, 105, 100)" },
  { id: "orange", bg: "rgb(255, 243, 224)", dark: "rgb(180, 95, 6)" },
  { id: "pink", bg: "rgb(252, 231, 243)", dark: "rgb(162, 28, 100)" },
  { id: "lime", bg: "rgb(240, 249, 220)", dark: "rgb(77, 124, 15)" },
  { id: "slate", bg: "rgb(237, 241, 245)", dark: "rgb(55, 75, 90)" },
  { id: "rose", bg: "rgb(255, 236, 236)", dark: "rgb(180, 40, 40)" },
];

const DAYS_PL = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];

function getColorById(colorId) {
  return EVENT_COLORS.find((c) => c.id === colorId) || EVENT_COLORS[0];
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekStart(date) {
  const dd = new Date(date);
  const day = dd.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  dd.setDate(dd.getDate() + diff);
  dd.setHours(0, 0, 0, 0);
  return dd;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(weekStart);
    dd.setDate(weekStart.getDate() + i);
    return dd;
  });
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(start.getDate() - (startDow === 0 ? 6 : startDow - 1));
  const days = [];
  const cur = new Date(start);
  while (cur <= lastDay || days.length % 7 !== 0) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
    if (days.length > 42) break;
  }
  return days;
}

function resolveEventConflicts(events) {
  const sorted = [...events].sort(
    (a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin)
  );
  const columns = [];
  sorted.forEach((ev) => {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastInCol = columns[col][columns[col].length - 1];
      const lastEnd = lastInCol.endHour * 60 + lastInCol.endMin;
      const curStart = ev.startHour * 60 + ev.startMin;
      if (curStart >= lastEnd) {
        columns[col].push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([ev]);
  });
  const result = {};
  columns.forEach((col, colIdx) => {
    col.forEach((ev) => {
      result[ev.id] = { col: colIdx, totalCols: columns.length };
    });
  });
  sorted.forEach((ev) => {
    const evStart = ev.startHour * 60 + ev.startMin;
    const evEnd = ev.endHour * 60 + ev.endMin;
    let maxCol = result[ev.id].col;
    sorted.forEach((other) => {
      if (other.id === ev.id) return;
      const oStart = other.startHour * 60 + other.startMin;
      const oEnd = other.endHour * 60 + other.endMin;
      if (oStart < evEnd && oEnd > evStart) {
        maxCol = Math.max(maxCol, result[other.id].col);
      }
    });
    result[ev.id].totalCols = maxCol + 1;
  });
  return result;
}

function isMultiDay(ev) {
  return ev.endDate && !isSameDay(ev.date, ev.endDate);
}

function dayInRange(day, start, end) {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d >= s && d <= e;
}

function isOccurrenceStart(type, diffDays, ev) {
  const origin = new Date(ev.date);
  origin.setHours(0, 0, 0, 0);

  switch (type) {
    case "daily":
      return true;
    case "weekly":
      return diffDays % 7 === 0;
    case "biweekly":
      return diffDays % 14 === 0;
    case "monthly": {
      const target = new Date(origin);
      target.setDate(target.getDate() + diffDays);
      return target.getDate() === origin.getDate();
    }
    case "yearly": {
      const target = new Date(origin);
      target.setDate(target.getDate() + diffDays);
      return (
        target.getDate() === origin.getDate() &&
        target.getMonth() === origin.getMonth()
      );
    }
    case "custom": {
      const interval = ev.customInterval || 1;
      const unit = ev.customUnit || "weeks";
      if (unit === "days") return diffDays % interval === 0;
      if (unit === "weeks") {
        const diffWeeks = diffDays / 7;
        if (ev.customDays && ev.customDays.length > 0) {
          const target = new Date(origin);
          target.setDate(target.getDate() + diffDays);
          const targetDow = target.getDay();
          if (!ev.customDays.includes(targetDow)) return false;
          const originWeekStart = getWeekStart(origin);
          const targetWeekStart = getWeekStart(target);
          const weekDiff = Math.round(
            (targetWeekStart - originWeekStart) / (7 * 24 * 60 * 60 * 1000)
          );
          return weekDiff % interval === 0;
        }
        return Number.isInteger(diffWeeks) && diffWeeks % interval === 0;
      }
      if (unit === "months") {
        const target = new Date(origin);
        target.setDate(target.getDate() + diffDays);
        if (target.getDate() !== origin.getDate()) return false;
        const monthDiff =
          (target.getFullYear() - origin.getFullYear()) * 12 +
          (target.getMonth() - origin.getMonth());
        return monthDiff > 0 && monthDiff % interval === 0;
      }
      if (unit === "years") {
        const target = new Date(origin);
        target.setDate(target.getDate() + diffDays);
        if (
          target.getDate() !== origin.getDate() ||
          target.getMonth() !== origin.getMonth()
        )
          return false;
        const yearDiff = target.getFullYear() - origin.getFullYear();
        return yearDiff > 0 && yearDiff % interval === 0;
      }
      return false;
    }
    default:
      return diffDays % 7 === 0;
  }
}

function eventOccursOnDay(ev, day) {
  if (ev.excludedDates && ev.excludedDates.length > 0) {
    const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day.getDate()).padStart(2, "0")}`;
    if (ev.excludedDates.includes(dayStr)) return false;
  }
  if (isMultiDay(ev) && !ev.recurrent) {
    return dayInRange(day, ev.date, ev.endDate);
  }
  if (isSameDay(ev.date, day)) return true;
  if (!ev.recurrent) return false;

  const origin = new Date(ev.date);
  origin.setHours(0, 0, 0, 0);
  const target = new Date(day);
  target.setHours(0, 0, 0, 0);
  if (target < origin) return false;

  const diffTime = target - origin;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const duration = isMultiDay(ev)
    ? Math.round(
        (new Date(ev.endDate).setHours(0, 0, 0, 0) -
          new Date(ev.date).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const type = ev.recurrenceType || "weekly";

  const matchesWithDuration = (occurrenceStartMatches) => {
    if (!occurrenceStartMatches && duration > 0) {
      for (let offset = 1; offset <= duration; offset++) {
        const checkDate = new Date(target);
        checkDate.setDate(checkDate.getDate() - offset);
        if (checkDate < origin) break;
        const checkDiff = Math.round(
          (checkDate - origin) / (1000 * 60 * 60 * 24)
        );
        if (isOccurrenceStart(type, checkDiff, ev)) return true;
      }
      return false;
    }
    return occurrenceStartMatches;
  };

  return matchesWithDuration(isOccurrenceStart(type, diffDays, ev));
}

function getEventsForDay(events, day) {
  return events
    .filter((ev) => eventOccursOnDay(ev, day))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      const aMin = (a.startHour || 0) * 60 + (a.startMin || 0);
      const bMin = (b.startHour || 0) * 60 + (b.startMin || 0);
      return aMin - bMin;
    });
}

function getDeadlineUrgency(events, day) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayTime = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate()
  ).getTime();
  const nowTime = now.getTime();
  if (dayTime < nowTime) return 0;
  const MAX_DAYS = 14;
  let maxUrgency = 0;
  for (const ev of events) {
    if (!ev.isDeadline) continue;
    if (!eventOccursOnDay(ev, day)) continue;
    const daysLeft = Math.round((dayTime - nowTime) / 86400000);
    if (daysLeft > MAX_DAYS) {
      maxUrgency = Math.max(maxUrgency, 0.15);
      continue;
    }
    const urgency =
      daysLeft === 0 ? 1 : Math.max(0.15, 1 - daysLeft / MAX_DAYS);
    if (urgency > maxUrgency) maxUrgency = urgency;
  }
  return maxUrgency;
}

function getEventStyle(ev, theme) {
  if (ev.isDeadline)
    return { bg: theme.colors.dangerLight, dark: theme.colors.danger };
  const color = getColorById(ev.colorId);
  return { bg: color.bg, dark: color.dark };
}

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

// Month view
const MonthGrid = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  gap: ${({ $weeks }) => ($weeks > 5 ? 3 : 6)}px;
  overflow: hidden;
  @media (max-width: 768px) {
    flex: none;
    padding: 8px 8px;
    gap: 3px;
    overflow: visible;
  }
`;

const DayLabels = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.textLight};
  padding: 4px 0;
`;

const MonthCell = styled.div`
  background: ${({ $today, theme }) =>
    $today ? theme.colors.lightPrimary : theme.colors.white};
  border: ${({ $selected, theme }) =>
    $selected
      ? `2px solid ${theme.colors.secondary}`
      : `1px solid ${theme.colors.borderMuted}`};
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: ${({ $compact }) => ($compact ? "3px 5px" : "6px 7px")};
  cursor: pointer;
  opacity: ${({ $outOfMonth }) => ($outOfMonth ? 0.4 : 1)};
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  overflow: hidden;
  @media (max-width: 768px) {
    padding: 3px 4px;
    border-radius: 6px;
    aspect-ratio: 1;
  }
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondaryLight};
  }
`;

const CellDate = styled.div`
  font-size: 13px;
  font-weight: ${({ $today }) => ($today ? 700 : 600)};
  color: ${({ $today, theme }) =>
    $today ? theme.colors.secondary : theme.colors.textMuted};
  font-family: monospace;
  margin-bottom: ${({ $compact }) => ($compact ? 4 : 10)}px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 2px;
  }
`;

const DeadlineDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $urgency, theme }) =>
    `color-mix(in srgb, ${theme.colors.danger} ${Math.round(
      25 + $urgency * 75
    )}%, transparent)`};
  flex-shrink: 0;
`;

const CellEvents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  @media (max-width: 768px) {
    gap: 2px;
  }
`;

const CellEventBar = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 4px;
  border-radius: 3px;
  background: ${({ $bg }) => $bg};
  border-left: 2px solid ${({ $dark }) => $dark};
  min-height: 28px;
  flex-shrink: 0;
  pointer-events: none;
  @media (max-width: 768px) {
    min-height: 6px;
    height: 6px;
    padding: 0;
    margin-left: 4px;
  }
`;

const CellEventTitle = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ $dark }) => $dark};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  @media (max-width: 768px) {
    display: none;
  }
`;

const CellEventIcons = styled.span`
  display: flex;
  gap: 1px;
  flex-shrink: 0;
  font-size: 11px;
  line-height: 1;
  @media (max-width: 768px) {
    display: none;
  }
`;

const CellMore = styled.div`
  font-size: 9px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
`;

const HiddenCount = styled.div`
  text-align: center;
  font-size: ${({ $mobile }) => ($mobile ? "10px" : "12px")};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: auto;
  line-height: 1;
  flex-shrink: 0;
`;

const EllipsisIcon = styled.span`
  font-size: 9px;
  color: ${({ $dark }) => $dark};
`;

const MonthWeekRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${({ $compact }) => ($compact ? 4 : 8)}px;
  flex: 1;
  min-height: 0;
  @media (max-width: 768px) {
    flex: none;
    gap: 3px;
  }
`;

const SpanningBar = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: ${({ $isStart, $isEnd }) =>
    $isStart && $isEnd
      ? "3px"
      : $isStart
      ? "3px 0 0 3px"
      : $isEnd
      ? "0 3px 3px 0"
      : "0"};
  background: ${({ $bg }) => $bg};
  border-left: ${({ $isStart, $dark }) =>
    $isStart ? `2px solid ${$dark}` : "none"};
  height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
  pointer-events: none;
  @media (max-width: 768px) {
    height: 6px;
    padding: 0;
  }
`;

const SpanningBarTitle = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ $dark }) => $dark};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  @media (max-width: 768px) {
    display: none;
  }
`;

// Week view
const WeekContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: 52px repeat(7, 1fr);
  background: ${({ theme }) => theme.colors.pageBg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGrey};
  flex-shrink: 0;
`;

const WeekHeaderCell = styled.div`
  padding: 10px 8px;
  text-align: center;
  border-left: none;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary}40;
  }
`;

const WeekDayName = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${({ $today, theme }) =>
    $today ? theme.colors.secondary : theme.colors.textLight};
`;

const WeekDayNum = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-family: monospace;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2px auto 0;
  background: ${({ $today, theme }) =>
    $today ? theme.colors.secondary : "transparent"};
  color: ${({ $today, $selected, theme }) =>
    $today ? "" : $selected ? theme.colors.secondary : theme.colors.text};
  box-shadow: ${({ $today, $selected, theme }) =>
    !$today && $selected
      ? `inset 0 0 0 2px ${theme.colors.secondary}`
      : "none"};
  border: none;
  transition: box-shadow 0.15s, color 0.15s;
`;

const WeekBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 52px repeat(7, 1fr);
  position: relative;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.darkGrey};
    border-radius: 2px;
  }
`;

const TimeCol = styled.div`
  position: sticky;
  left: 0;
  background: ${({ theme }) => theme.colors.white};
  z-index: 2;
`;

const TimeSlot = styled.div`
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 2px 8px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderMuted};
`;

const TimeLabel = styled.span`
  font-size: 10px;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.textLight};
  transform: translateY(-2px);
`;

const DayCol = styled.div`
  position: relative;
  border-left: 1px solid ${({ theme }) => theme.colors.borderMuted};
  background: ${({ $selected, theme }) =>
    $selected
      ? `color-mix(in srgb, ${theme.colors.secondary} 6%, transparent)`
      : "transparent"};
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary}40;
  }
`;

const HourLine = styled.div`
  height: 60px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderMuted};
`;

const NowLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ $top }) => $top}px;
  height: 2px;
  background: ${({ theme }) => theme.colors.secondary};
  z-index: 3;
  &::before {
    content: "";
    position: absolute;
    left: -4px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const EventBlock = styled.div`
  position: absolute;
  top: ${({ $top }) => $top}px;
  height: ${({ $height }) => $height}px;
  left: ${({ $left }) => $left};
  width: ${({ $width }) => $width};
  background: ${({ $bg }) => $bg};
  border-left: 3px solid ${({ $borderColor }) => $borderColor};
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: all 0.15s;
  animation: ${fadeIn} 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
`;

const EventTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $dark }) => $dark};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventTags = styled.div`
  display: flex;
  gap: 3px;
  align-self: flex-end;
  margin-top: auto;
`;

const EventTagIcon = styled.span`
  font-size: 18px;
`;

const AllDayArea = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.white};
  min-height: 28px;
  flex-shrink: 0;
  padding-left: 52px;
`;

const AllDayRow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px 0;
`;

const AllDayEvent = styled.div`
  height: 22px;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${({ $bg }) => $bg};
  color: ${({ $dark }) => $dark};
  border-left: 3px solid ${({ $dark }) => $dark};
  transition: filter 0.15s;
  animation: ${fadeIn} 0.3s ease;
  &:hover {
    filter: brightness(0.93);
  }
`;

const CalendarGrid = ({
  view,
  currentDate,
  events,
  selectedDate = null,
  onDayClick,
  startHour = 0,
  endHour = 24,
  dashboardMode = false,
}) => {
  const theme = useTheme();
  const [nowPos, setNowPos] = useState(() => {
    const now = new Date();
    return (now.getHours() - startHour) * 60 + now.getMinutes();
  });
  const weekBodyRef = useRef(null);
  const monthGridRef = useRef(null);
  const [monthGridHeight, setMonthGridHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowPos((now.getHours() - startHour) * 60 + now.getMinutes());
    };
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [startHour]);

  useEffect(() => {
    if (weekBodyRef.current) {
      weekBodyRef.current.scrollTop = 8 * 60;
    }
  }, [view, currentDate]);

  useEffect(() => {
    const el = monthGridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setMonthGridHeight(entry.contentRect.height)
    );
    ro.observe(el);
    return () => ro.disconnect();
  });

  const handleDayClick = (day) => {
    if (onDayClick) {
      const dayEvents = getEventsForDay(events, day);
      onDayClick(day, dayEvents);
    }
  };

  // WEEK VIEW

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const days = getWeekDays(weekStart);
    const hours = Array.from(
      { length: endHour - startHour },
      (_, i) => i + startHour
    );
    const nowDate = new Date();
    const isCurrentWeek = days.some((dd) => isSameDay(dd, nowDate));

    const allDayBanners = [];
    const seenAllDay = new Set();
    events.forEach((ev) => {
      if (!isMultiDay(ev)) return;
      if (seenAllDay.has(ev.id)) return;
      const evStart = new Date(ev.date);
      evStart.setHours(0, 0, 0, 0);
      const evEnd = new Date(ev.endDate);
      evEnd.setHours(0, 0, 0, 0);
      const weekEndD = new Date(days[6]);
      weekEndD.setHours(0, 0, 0, 0);
      const weekStartD = new Date(days[0]);
      weekStartD.setHours(0, 0, 0, 0);
      if (evEnd < weekStartD || evStart > weekEndD) return;
      seenAllDay.add(ev.id);
      const startCol =
        evStart < weekStartD
          ? 0
          : days.findIndex((dd) => isSameDay(dd, evStart));
      const endCol =
        evEnd > weekEndD ? 6 : days.findIndex((dd) => isSameDay(dd, evEnd));
      if (startCol === -1 || endCol === -1) return;
      allDayBanners.push({ ev, startCol, endCol, span: endCol - startCol + 1 });
    });

    const getDayEventsForColumn = (day) => {
      const allEvs = getEventsForDay(events, day);
      return allEvs
        .filter((ev) => !isMultiDay(ev))
        .map((ev) => {
          if (!isMultiDay(ev)) return ev;
          const isFirstDay = isSameDay(day, ev.date);
          const isLastDay = isSameDay(day, ev.endDate);
          return {
            ...ev,
            _sliceId: `${ev.id}-${day.getTime()}`,
            startHour: isFirstDay ? ev.startHour : 0,
            startMin: isFirstDay ? ev.startMin : 0,
            endHour: isLastDay ? ev.endHour : 23,
            endMin: isLastDay ? ev.endMin : 59,
          };
        });
    };

    return (
      <WeekContainer>
        <WeekHeader>
          <div />
          {days.map((day, i) => {
            const isToday = isSameDay(day, nowDate);
            const isSelected = selectedDate && isSameDay(selectedDate, day);
            return (
              <WeekHeaderCell key={i} onClick={() => handleDayClick(day)}>
                <WeekDayName $today={isToday}>
                  {DAYS_PL[day.getDay()]}
                </WeekDayName>
                <WeekDayNum $today={isToday} $selected={isSelected}>
                  {day.getDate()}
                </WeekDayNum>
              </WeekHeaderCell>
            );
          })}
        </WeekHeader>

        {allDayBanners.length > 0 && (
          <AllDayArea>
            <AllDayRow>
              {allDayBanners.map(({ ev, startCol, span }) => {
                const style = getEventStyle(ev, theme);
                const leftPct = (startCol / 7) * 100;
                const widthPct = (span / 7) * 100;
                return (
                  <AllDayEvent
                    key={ev.id}
                    $bg={style.bg}
                    $dark={style.dark}
                    style={{
                      position: "relative",
                      marginLeft: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                    onClick={() => handleDayClick(ev.date)}
                  >
                    {ev.title}
                  </AllDayEvent>
                );
              })}
            </AllDayRow>
          </AllDayArea>
        )}

        <WeekBody ref={weekBodyRef}>
          <TimeCol>
            {hours.map((h) => (
              <TimeSlot key={h}>
                {h > 0 && (
                  <TimeLabel>{String(h).padStart(2, "0")}:00</TimeLabel>
                )}
              </TimeSlot>
            ))}
          </TimeCol>

          {days.map((day, colIdx) => {
            const isToday = isSameDay(day, nowDate);
            const dayEvs = getDayEventsForColumn(day);
            const layout = resolveEventConflicts(dayEvs);

            return (
              <DayCol
                key={colIdx}
                $today={isToday}
                $selected={selectedDate && isSameDay(selectedDate, day)}
                onClick={() => handleDayClick(day)}
              >
                {hours.map((h) => (
                  <HourLine key={h} />
                ))}
                {isToday && isCurrentWeek && <NowLine $top={nowPos} />}
                {dayEvs.map((ev) => {
                  const topMins = ev.startHour * 60 + ev.startMin;
                  const endMins = ev.endHour * 60 + ev.endMin;
                  const widgetStart = startHour * 60;
                  const widgetEnd = endHour * 60;

                  if (endMins <= widgetStart || topMins >= widgetEnd)
                    return null;

                  const clampedStart = Math.max(
                    widgetStart,
                    Math.min(topMins, widgetEnd)
                  );
                  const clampedEnd = Math.max(
                    widgetStart,
                    Math.min(endMins, widgetEnd)
                  );

                  const rawHeight = Math.max(24, clampedEnd - clampedStart);

                  const maxTop = (widgetEnd - widgetStart) - rawHeight;
                  const top = Math.min(clampedStart - widgetStart, maxTop);
                  const height = rawHeight;

                  if (clampedEnd <= widgetStart || clampedStart >= widgetEnd)
                    return null;

                  const { col, totalCols } = layout[ev.id] || {
                    col: 0,
                    totalCols: 1,
                  };
                  const colW = 96 / totalCols;
                  const left = `${2 + col * colW}%`;
                  const width = `${colW - 2}%`;
                  const style = getEventStyle(ev, theme);

                  return (
                    <EventBlock
                      key={ev._sliceId || ev.id}
                      $top={top}
                      $height={height}
                      $left={left}
                      $width={width}
                      $bg={style.bg}
                      $borderColor={style.dark}
                    >
                      <EventTitle $dark={style.dark}>{ev.title}</EventTitle>
                      {height > 30 && (
                        <EventTags>
                          {ev.tags.map((t) => (
                            <EventTagIcon key={t}>
                              {TAG_CONFIG[t]?.icon}
                            </EventTagIcon>
                          ))}
                        </EventTags>
                      )}
                    </EventBlock>
                  );
                })}
              </DayCol>
            );
          })}
        </WeekBody>
      </WeekContainer>
    );
  };

  // MONTH VIEW
  const renderMonthView = () => {
    const mobileDash = isMobile || dashboardMode;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getMonthDays(year, month);
    const nowDate = new Date();

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const GAP = 8;

    return (
      <MonthGrid ref={monthGridRef}>
        <DayLabels>
          {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map((dd) => (
            <DayLabel key={dd}>{dd}</DayLabel>
          ))}
        </DayLabels>
        {weeks.map((weekDays, weekIdx) => {
          const weekStartD = new Date(weekDays[0]);
          weekStartD.setHours(0, 0, 0, 0);
          const weekEndD = new Date(weekDays[6]);
          weekEndD.setHours(0, 0, 0, 0);
          const spanningEvents = [];
          const seenIds = new Set();

          events.forEach((ev) => {
            if (!isMultiDay(ev)) return;
            if (seenIds.has(ev.id)) return;
            const evStart = new Date(ev.date);
            evStart.setHours(0, 0, 0, 0);
            const evEnd = new Date(ev.endDate);
            evEnd.setHours(0, 0, 0, 0);
            if (evEnd < weekStartD || evStart > weekEndD) return;
            seenIds.add(ev.id);

            const startCol =
              evStart < weekStartD
                ? 0
                : weekDays.findIndex((dd) => isSameDay(dd, evStart));
            const endCol =
              evEnd > weekEndD
                ? 6
                : weekDays.findIndex((dd) => isSameDay(dd, evEnd));
            if (startCol === -1 || endCol === -1) return;
            const isStart = evStart >= weekStartD;
            const isEnd = evEnd <= weekEndD;
            spanningEvents.push({ ev, startCol, endCol, isStart, isEnd });
          });

          const lanes = [];
          spanningEvents.forEach((item) => {
            let placed = false;
            for (let lane = 0; lane < lanes.length; lane++) {
              const conflict = lanes[lane].some(
                (other) =>
                  item.startCol <= other.endCol && item.endCol >= other.startCol
              );
              if (!conflict) {
                lanes[lane].push(item);
                item.lane = lane;
                placed = true;
                break;
              }
            }
            if (!placed) {
              item.lane = lanes.length;
              lanes.push([item]);
            }
          });

          const multiDayIds = new Set(spanningEvents.map((s) => s.ev.id));

          return (
            <MonthWeekRow key={weekIdx}>
              {spanningEvents.map(
                ({ ev, startCol, endCol, lane, isStart, isEnd }) => {
                  // Check if this spanning bar should be hidden on any day it covers
                  // If on every day it covers the lane exceeds the limit, hide entirely
                  const isOverLimit = (() => {
                    for (let col = startCol; col <= endCol; col++) {
                      const singleDayCount = getEventsForDay(
                        events,
                        weekDays[col]
                      ).filter((e) => !multiDayIds.has(e.id)).length;
                      const spanningOnCol = spanningEvents.filter(
                        (s) => col >= s.startCol && col <= s.endCol
                      );
                      const totalOnCol = spanningOnCol.length + singleDayCount;
                      const maxOnCol = totalOnCol > 3 ? 2 : 3;
                      if (lane >= maxOnCol) return true;
                    }
                    return false;
                  })();
                  if (isOverLimit) return null;

                  const style = getEventStyle(ev, theme);
                  const icons = (ev.tags || [])
                    .map((t) => TAG_CONFIG[t]?.icon)
                    .filter(Boolean);
                  const span = endCol - startCol + 1;
                  const marginStart = isStart ? 6 : 0;
                  const marginEnd = isEnd ? 6 : 0;
                  const leftCalc = isMobile
                    ? `calc(${(startCol / 7) * 100}% + ${
                        startCol > 0 ? `${(startCol * GAP) / 7}px` : "0px"
                      } + ${marginStart}px)`
                    : `calc(${(startCol / 7) * 100}% + ${
                        startCol > 0 ? `${(startCol * GAP) / 7}px` : "0px"
                      } + ${marginStart}px + 3px)`;
                  const widthCalc = `calc(${(span / 7) * 100}% - ${
                    ((7 - span) * GAP) / 7
                  }px - ${marginStart + marginEnd}px)`;
                  const eventSlotHeight = dashboardMode || isMobile ? 8 : 33;
                  const topOffset =
                    (isMobile ? 22 : 36) + lane * eventSlotHeight;

                  return (
                    <SpanningBar
                      key={`${ev.id}-w${weekIdx}`}
                      $bg={style.bg}
                      $dark={style.dark}
                      $isStart={isStart}
                      $isEnd={isEnd}
                      style={{
                        left: leftCalc,
                        width: widthCalc,
                        top: `${topOffset}px`,
                        height: mobileDash ? "6px" : "28px",
                        padding: mobileDash ? 0 : "1px 6px",
                      }}
                    >
                      {!mobileDash && (
                        <SpanningBarTitle $dark={style.dark}>
                          {ev.title}
                        </SpanningBarTitle>
                      )}
                      {!mobileDash && isEnd && icons.length > 0 && (
                        <CellEventIcons>
                          {icons.slice(0, 2).map((ic, idx) => (
                            <span key={idx}>{ic}</span>
                          ))}
                          {icons.length > 2 && (
                            <EllipsisIcon $dark={style.dark}>…</EllipsisIcon>
                          )}
                        </CellEventIcons>
                      )}
                    </SpanningBar>
                  );
                }
              )}
              {weekDays.map((day, dayIdx) => {
                const isToday = isSameDay(day, nowDate);
                const outOfMonth = day.getMonth() !== month;
                const urgency = getDeadlineUrgency(events, day);
                const dayEvs = getEventsForDay(events, day).filter(
                  (ev) => !multiDayIds.has(ev.id)
                );
                const lanesOnDay = spanningEvents.filter(
                  (s) => dayIdx >= s.startCol && dayIdx <= s.endCol
                );
                const totalCount = lanesOnDay.length + dayEvs.length;
                const maxShown = totalCount > 3 ? 2 : 3;
                const visibleSpanningCount = lanesOnDay.filter(
                  (s) => s.lane < maxShown
                ).length;
                const slotH = isMobile ? 8 : 33;
                const spanPadding =
                  visibleSpanningCount > 0
                    ? visibleSpanningCount * slotH + (isMobile ? 2 : -2)
                    : 0;
                const compact = weeks.length > 5;
                const slotsForSingleDay = Math.max(
                  0,
                  maxShown - visibleSpanningCount
                );
                const visible = dayEvs.slice(0, slotsForSingleDay);
                const hiddenCount =
                  totalCount - visibleSpanningCount - visible.length;

                return (
                  <MonthCell
                    key={dayIdx}
                    $today={isToday}
                    $outOfMonth={outOfMonth}
                    $compact={compact}
                    $selected={selectedDate && isSameDay(selectedDate, day)}
                    onClick={() => handleDayClick(day)}
                  >
                    <CellDate $today={isToday} $compact={compact}>
                      {day.getDate()}
                      {urgency > 0 && <DeadlineDot $urgency={urgency} />}
                    </CellDate>
                    {spanPadding > 0 && (
                      <div
                        style={{
                          minHeight: 0,
                          height: spanPadding,
                          flexShrink: 1,
                        }}
                      />
                    )}
                    <CellEvents
                      style={
                        hiddenCount > 0
                          ? { marginBottom: 5 }
                          : undefined
                      }
                    >
                      {visible.map((ev) => {
                        const style = getEventStyle(ev, theme);
                        const icons = (ev.tags || [])
                          .map((t) => TAG_CONFIG[t]?.icon)
                          .filter(Boolean);
                        return (
                          <CellEventBar
                            key={ev.id}
                            $bg={style.bg}
                            $dark={style.dark}
                            style={{
                              minHeight: mobileDash ? "6px" : "28px",
                              height: mobileDash ? "6px" : "auto",
                              padding: mobileDash ? 0 : "1px 4px",
                              marginBottom: mobileDash ? "2px" : 0,
                            }}
                          >
                            {!mobileDash && (
                              <CellEventTitle $dark={style.dark}>
                                {ev.title}
                              </CellEventTitle>
                            )}
                            {!mobileDash && icons.length > 0 && (
                              <CellEventIcons>
                                {icons.slice(0, 2).map((ic, idx) => (
                                  <span key={idx}>{ic}</span>
                                ))}
                                {icons.length > 2 && (
                                  <span
                                    style={{ fontSize: 9, color: style.dark }}
                                  >
                                    …
                                  </span>
                                )}
                              </CellEventIcons>
                            )}
                          </CellEventBar>
                        );
                      })}
                      {hiddenCount > 0 && (
                        <HiddenCount $mobile={mobileDash}>
                          {mobileDash
                            ? `+${hiddenCount}`
                            : `+${hiddenCount} więcej`}
                        </HiddenCount>
                      )}
                    </CellEvents>
                  </MonthCell>
                );
              })}
            </MonthWeekRow>
          );
        })}
      </MonthGrid>
    );
  };

  return view === "week" ? renderWeekView() : renderMonthView();
};

function mapBackendEvent(ev) {
  const start = new Date(ev.start || ev.startTime);
  const end = new Date(ev.end || ev.endTime);
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const multiDay = startDay.getTime() !== endDay.getTime();

  const rule = ev.recurrenceRule || null;
  const recurrenceFields = rule
    ? mapRecurrenceRule(rule)
    : { recurrent: false, isPartOfSeries: false };

  return {
    id: `backend-${ev.id}`,
    backendId: ev.id,
    title: ev.title,
    description: ev.description || "",
    date: startDay,
    endDate: multiDay ? endDay : undefined,
    startHour: start.getHours(),
    startMin: start.getMinutes(),
    endHour: end.getHours(),
    endMin: end.getMinutes(),
    tags: ev.eventTags
      ? [...ev.eventTags].filter((t) => TAG_CONFIG[t] && t !== "deadline")
      : [],
    customTags: ev.eventTags
      ? [...ev.eventTags].filter((t) => !TAG_CONFIG[t] && t !== "deadline")
      : [],
    regularTags: ev.regularTags ? [...ev.regularTags] : [],
    isDeadline: !!ev.isDeadline,
    colorId: ev.color || "blue",
    allDay:
      multiDay &&
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0,
    ...recurrenceFields,
  };
}

// odwrotne mapowanie do buildRecurrenceRule w Calendar.jsx
function mapRecurrenceRule(rule) {
  const FREQUENCY_TO_UNIT = {
    DAILY: "days",
    WEEKLY: "weeks",
    MONTHLY: "months",
    YEARLY: "years",
  };
  const interval = rule.interval || 1;
  const freq = rule.frequency;
  const daysOfWeek = rule.daysOfWeek || null;

  // detekcja presetu
  let recurrenceType = "custom";
  let customInterval = interval;
  let customUnit = FREQUENCY_TO_UNIT[freq] || "weeks";
  let customDays = [];

  if (!daysOfWeek) {
    if (freq === "DAILY" && interval === 1) recurrenceType = "daily";
    else if (freq === "WEEKLY" && interval === 1) recurrenceType = "weekly";
    else if (freq === "WEEKLY" && interval === 2) recurrenceType = "biweekly";
    else if (freq === "MONTHLY" && interval === 1) recurrenceType = "monthly";
    else if (freq === "YEARLY" && interval === 1) recurrenceType = "yearly";
  }

  if (recurrenceType === "custom" && daysOfWeek) {
    // "1,3,5" → [1, 3, 5] (7 traktujemy jako 0 = niedziela, zgodnie z JS)
    customDays = daysOfWeek
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
      .map((n) => (n === 7 ? 0 : n));
  }

  let recurrenceEndType = "never";
  let recurrenceEndDate = "";
  let recurrenceOccurrences = 10;
  if (rule.recurrenceEnd) {
    recurrenceEndType = "date";
    recurrenceEndDate = rule.recurrenceEnd;
  } else if (rule.occurrences && rule.occurrences > 0) {
    recurrenceEndType = "after";
    recurrenceOccurrences = rule.occurrences;
  }

  return {
    // backend materializuje kazde wystapienie jako osobny rekord,
    // wiec frontend nie powinien juz sam rozwijac cyklu (eventOccursOnDay)
    recurrent: false,
    isPartOfSeries: true,
    recurrenceType,
    customInterval,
    customUnit,
    customDays,
    recurrenceEndType,
    recurrenceEndDate,
    recurrenceOccurrences,
  };
}

export {
  TAG_CONFIG,
  EVENT_COLORS,
  DAYS_PL,
  getEventsForDay,
  getWeekStart,
  isMultiDay,
  getEventStyle,
  mapBackendEvent,
};

export default CalendarGrid;
