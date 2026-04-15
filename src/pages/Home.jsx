import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, parseJwt, removeToken } from '../token';
import Layout from '../components/organisms/Layout';
import { getAllNotes, getAllFolders, getRecentFlashcardSets, getFlashcardSetStats, getEventsBetween } from '../api';
import CalendarGrid, { getWeekStart, mapBackendEvent, TAG_CONFIG } from '../components/organisms/CalendarGrid';

const MONTHS_PL = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

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
`

const StyledHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-shrink: 0;
    min-height: 42px;
`

const StyledName = styled.h2`
    color: #122818;
    font-size: 1.7rem; 
    font-weight: 800;
    cursor: default;
    margin: 0;
    line-height: 1;
`

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`
/*
const SearchInput = styled.input`
    padding: 0 15px;
    border-radius: 8px;
    border: 1px solid #d1d4c9;
    background-color: #ffffff;
    font-size: 0.9rem;
    outline: none;
    width: 200px;
    height: 40px; 
    transition: border-color 0.2s;
    &:focus { border-color: #122818; }
`
*/

const StyledLogoutButton = styled.button`
    padding: 0 20px;
    background-color: #ffffff;
    color: #122818;
    border: 1px solid #d1d4c9;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    height: 40px; 
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    &:hover { background-color: #e9ece1; }
`

const DashboardLayout = styled.div`
    display: grid;
    grid-template-columns: 3.8fr 6.2fr;
    gap: 20px;
    align-items: stretch; 

    @media(max-width: 1024px) {
        grid-template-columns: 1fr; 
    }
`

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: 100%; 
`

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: 100%; 
`

const CardBox = styled.div`
    background-color: #ffffff;
    border-radius: 24px;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
    padding: 30px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`

const FiszkiBox = styled(CardBox)` flex: 5.5; `
const NotatkiBox = styled(CardBox)` flex: 4.5; `
const CalendarBox = styled(CardBox)` flex: 6.5; `

const BottomRow = styled.div`
    flex: 4.5;
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 30px;
`

const CardTitle = styled.h3`
    color: #122818;
    font-size: 1.4rem; 
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 24px; 
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
`
const ItemList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-grow: 1; 
`

const ListItem = styled.div`
    background-color: ${({ $isEmpty }) => $isEmpty ? '#e6eadb' : '#dbe0d0'}; 
    opacity: ${({ $isEmpty }) => $isEmpty ? 0.6 : 1};
    border-radius: 12px;
    padding: 12px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: ${({ $isEmpty }) => $isEmpty ? 'default' : 'pointer'};
    transition: transform 0.2s;
    min-height: 40px;

    &:hover { transform: ${({ $isEmpty }) => $isEmpty ? 'none' : 'translateX(5px)'}; }
`

const SimpleListItem = styled.div`
    background-color: ${({ $isEmpty }) => $isEmpty ? '#e6eadb' : '#dbe0d0'}; 
    opacity: ${({ $isEmpty }) => $isEmpty ? 0.6 : 1};
    border-radius: 12px;
    padding: 12px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 0.95rem;
    color: #122818;
    min-height: 40px;
`

const ItemInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 60%;
`

const ItemTitle = styled.span`
    font-weight: 700;
    color: #122818;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const ItemSub = styled.span`
    font-size: 0.75rem;
    color: #555;
    font-weight: 500;
`

const ItemMeta = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
`

const ProgressBar = styled.div`
    width: 60px;
    height: 8px;
    border-radius: 4px;
    display: flex;
    overflow: hidden;
    background-color: #c4c9b9;
`
const ProgressGreen = styled.div`width: 50%; background-color: #5ba354;`
const ProgressBlue = styled.div`width: 50%; background-color: #e4fafd;`

const TagPill = styled.span`
    font-size: 0.65rem;
    color: #555;
    font-weight: 600;
`

const MoreButton = styled.div`
    text-align: right;
    margin-top: auto; 
    color: #707a73;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    padding-top: 15px;
    &:hover { color: #122818; }
`

const FoldersRow = styled.div`
    display: flex;
    justify-content: center;
    gap: 25px;
    margin-bottom: 24px;
    flex-shrink: 0;
`

const FolderBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    width: 90px;
`

const FolderIcon = styled.div`
    width: 45px;
    height: 40px;
    color: #122818;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        width: 140%;
        height: 140%;
    }
`

const FolderName = styled.span`
    font-size: 0.75rem;
    font-weight: 800;
    color: #122818;
    width: 100%;
    text-align: center;
    
    /* zamiast jednej linijki pozwalamy na max 2 linijki tekstu */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-wrap: break-word;
`

const Home = () => {
    const [username, setUsername] = useState("");
    const [recentSets, setRecentSets] = useState([]);
    const [recentNotes, setRecentNotes] = useState([]);
    const [recentFolders, setRecentFolders] = useState([]);
    
    const [allFoldersList, setAllFoldersList] = useState([]);

    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState(() => localStorage.getItem("calendarView") || "week");
    const [events, setEvents] = useState([]);

    const upcomingDeadlines = events.filter(ev => ev.isDeadline).sort((a, b) => a.date - b.date).slice(0, 3);

    useEffect(() => {
        const fetchEvents = async () => {
            let startDate, endDate;
            if (calendarView === "week") {
                const ws = getWeekStart(currentDate);
                const margin = new Date(ws); margin.setDate(margin.getDate() - 7);
                const we = new Date(ws); we.setDate(we.getDate() + 13);
                startDate = toLocalDateTimeISO(margin, 0, 0);
                endDate = toLocalDateTimeISO(we, 23, 59);
            } else {
                const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const margin = new Date(first); margin.setDate(margin.getDate() - 7);
                const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                const marginEnd = new Date(last); marginEnd.setDate(marginEnd.getDate() + 7);
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
        else { d.setDate(1); d.setMonth(d.getMonth() - 1); }
        setCurrentDate(d);
    };

    const handleNext = () => {
        const d = new Date(currentDate);
        if (calendarView === "week") d.setDate(d.getDate() + 7);
        else { d.setDate(1); d.setMonth(d.getMonth() + 1); }
        setCurrentDate(d);
    };

    const headerTitle = () => {
        if (calendarView === "week") {
            const weekStart = getWeekStart(currentDate);
            const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
            if (weekStart.getMonth() === weekEnd.getMonth()) return `${MONTHS_PL[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
            return `${MONTHS_PL[weekStart.getMonth()]} – ${MONTHS_PL[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
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
            try {
                const [notesData, foldersData, recentSetsData] = await Promise.all([
                    getAllNotes(),
                    getAllFolders(),
                    getRecentFlashcardSets()
                ]);

                const notesArray = Array.isArray(notesData) ? notesData : (notesData.notes || []);
                const foldersArray = Array.isArray(foldersData) ? foldersData : (foldersData.folders || []);
                const setsArray = recentSetsData.errorCode ? [] : (recentSetsData.sets || []);

                const setsWithStats = await Promise.all(setsArray.map(async (set) => {
                    const statsRes = await getFlashcardSetStats(set.id);

                    let rawStats = parseFloat(statsRes.stats);
                    if (isNaN(rawStats)) rawStats = 0;
                    let progressPercent = rawStats <= 1 && rawStats > 0 ? rawStats * 100 : rawStats;

                    const activityVal = set.lastActivity ?? set.last_activity ?? set.lastActivityTime ?? set.updatedAt ?? set.createTime;
                    const timestamp = parseDateFromBackend(activityVal);

                    return { ...set, progress: progressPercent || 0, _sortTime: timestamp };
                }));

                setsWithStats.sort((a, b) => b._sortTime - a._sortTime);

                const sortedFolders = [...foldersArray]
                    .filter(f => f.name !== "/")
                    .sort((a, b) => (b.id || 0) - (a.id || 0));

                const sortedNotes = [...notesArray]
                    .sort((a, b) => {
                        const dateA = new Date(a.editTime ?? a.lastEdited ?? a.createTime ?? 0).getTime();
                        const dateB = new Date(b.editTime ?? b.lastEdited ?? b.createTime ?? 0).getTime();
                        if (!dateA || isNaN(dateA) || dateA === 0) return (b.id || 0) - (a.id || 0);
                        return dateB - dateA;
                    });

                setRecentSets(setsWithStats.slice(0, 3));
                setRecentNotes(sortedNotes.slice(0, 3));
                setRecentFolders(sortedFolders.slice(0, 4));
                setAllFoldersList(foldersArray);
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        };

        fetchData();
    }, [navigate]);


    const formatActivityDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return "Brak aktywności";
        const date = new Date(timestamp);
        return date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };


    const getFolderFullPath = (folder) => {
        if (!folder || folder.name === "/") return "";
        return folder.path === "/" ? "/" + folder.name : folder.path + "/" + folder.name;
    };

    const getNotePath = (note) => {
        if (note.folderId !== undefined && note.folderId !== null) {
            
            const parentFolder = allFoldersList.find(f => f.id === note.folderId);
            
            if (parentFolder && parentFolder.name !== "/") {
                const fullPath = getFolderFullPath(parentFolder);
                const formatted = fullPath.split('/').filter(Boolean).join(' > ');
                
                if (formatted) return formatted;
            }
        }
        
        return "Katalog główny";
    };

    const handleFolderClick = (folder) => {
        const fullPath = getFolderFullPath(folder);
        const segments = fullPath.split('/').filter(Boolean).map(s => encodeURIComponent(s));
        navigate(`/notes/${segments.join('/')}`);
    };

    // funkcje do pokazywania pustych slotow jesli uzytkownik ma za malo notatek fiszek i terminow
    const renderEmptySlots = (currentLength, maxSlots) => {
        const emptySlots = [];
        for (let i = currentLength; i < maxSlots; i++) {
            emptySlots.push(<ListItem key={`empty-${i}`} $isEmpty={true}><ItemTitle>&nbsp;</ItemTitle></ListItem>);
        }
        return emptySlots;
    };

    const renderEmptyDeadlines = (currentLength, maxSlots) => {
        const emptySlots = [];
        for (let i = currentLength; i < maxSlots; i++) {
            emptySlots.push(<SimpleListItem key={`empty-dl-${i}`} $isEmpty={true}><span>&nbsp;</span></SimpleListItem>);
        }
        return emptySlots;
    };

    const parseDateFromBackend = (dateVal) => {
        if (!dateVal) return 0;
        if (Array.isArray(dateVal) && dateVal.length >= 3) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0).getTime();
        }
        const parsed = new Date(dateVal).getTime();
        return isNaN(parsed) ? 0 : parsed;
    };

    return (
        <Layout>
            <StyledContainer>
                
                <StyledHeader>
                    <StyledName>Witaj, {username || "użytkowniku"}!</StyledName>
                    <HeaderRight>
                        <StyledLogoutButton onClick={() => { removeToken(); navigate("/"); }}>
                            Wyloguj
                        </StyledLogoutButton>
                    </HeaderRight>
                </StyledHeader>

                <DashboardLayout>
                    
                    {/* LEWA KOLUMNA */}
                    <LeftColumn>
                        
                        <FiszkiBox>
                            <CardTitle>Wróć do nauki</CardTitle>
                            <ItemList>
                                {recentSets.map((set) => {
                                    const validProgress = isNaN(set.progress) ? 0 : set.progress;
                                    const greenWidth = Math.min(Math.max(validProgress, 0), 100);
                                    const blueWidth = 100 - greenWidth;

                                    return (
                                        <ListItem key={set.id} onClick={() => navigate(`/learning/fast/${set.id}`)}>
                                            <ItemInfo>
                                                <ItemTitle>{set.name}</ItemTitle>
                                                <ItemSub>Ostatnia aktywność: {formatActivityDate(set._sortTime)}</ItemSub>
                                            </ItemInfo>
                                            
                                            <ItemMeta>
                                                <ProgressBar>
                                                    <ProgressGreen style={{ width: `${greenWidth}%` }} />
                                                    <ProgressBlue style={{ width: `${blueWidth}%` }} />
                                                </ProgressBar>
                                            </ItemMeta>
                                        </ListItem>
                                    );
                                })}
                                {renderEmptySlots(recentSets.length, 3)}
                            </ItemList>
                            <MoreButton onClick={() => navigate("/learning")}>Więcej...</MoreButton>
                        </FiszkiBox>

                        <NotatkiBox>
                            <CardTitle>Ostatnie notatki</CardTitle>
                            <FoldersRow>
                                {recentFolders.length > 0 ? (
                                    recentFolders.map((folder) => (
                                        <FolderBox key={folder.id} onClick={() => handleFolderClick(folder)}>
                                            <FolderIcon>
                                                <svg fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                                                </svg>
                                            </FolderIcon>
                                            <FolderName>{folder.name}</FolderName>
                                        </FolderBox>
                                    ))
                                ) : (
                                    <FolderBox>
                                        <FolderIcon>
                                            <svg fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                                            </svg>
                                        </FolderIcon>
                                        <FolderName>Brak</FolderName>
                                    </FolderBox>
                                )}
                            </FoldersRow>
                            
                            <ItemList>
                                {recentNotes.map((note) => (
                                    <ListItem key={note.id} onClick={() => navigate(`/note/${note.id}`)}>
                                        <ItemInfo>
                                            <ItemTitle>{note.name || "Brak nazwy"}</ItemTitle>
                                        </ItemInfo>
                                        <ItemMeta>
                                            <TagPill><i>{getNotePath(note)}</i></TagPill>
                                        </ItemMeta>
                                    </ListItem>
                                ))}
                                {renderEmptySlots(recentNotes.length, 3)}
                            </ItemList>
                            <MoreButton onClick={() => navigate("/notes")}>Więcej...</MoreButton>
                        </NotatkiBox>

                        <CardBox>
                            <CardTitle>Społeczności</CardTitle>
                            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#b3b9a8', fontSize: '0.95rem', textAlign: 'center', minHeight: '80px' }}>
                                Brak nowych aktywności.
                            </div>
                            <MoreButton>Więcej...</MoreButton>
                        </CardBox>

                    </LeftColumn>

                    {/* PRAWA KOLUMNA */}
                    <RightColumn>
                        
                        <CalendarBox style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '650px' }}>

                            <CardTitle style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button onClick={handlePrev} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.4rem', color: '#122818', padding: '0 5px' }}>‹</button>
                                    <span style={{ fontSize: '1.15rem', minWidth: '130px', textAlign: 'center' }}>{headerTitle()}</span>
                                    <button onClick={handleNext} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.4rem', color: '#122818', padding: '0 5px' }}>›</button>
                                </div>

                                <div style={{ display: 'flex', gap: '5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <button
                                        onClick={() => { setCalendarView('week'); localStorage.setItem('calendarView', 'week'); }}
                                        style={{ border: 'none', background: calendarView === 'week' ? '#e6eadb' : 'transparent', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: '#122818', transition: 'all 0.2s' }}>
                                        Tydzień
                                    </button>
                                    <button
                                        onClick={() => { setCalendarView('month'); localStorage.setItem('calendarView', 'month'); }}
                                        style={{ border: 'none', background: calendarView === 'month' ? '#e6eadb' : 'transparent', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: '#122818', transition: 'all 0.2s' }}>
                                        Miesiąc
                                    </button>
                                </div>
                            </CardTitle>

                            <div style={{ position: 'relative', flex: '1 1 auto', overflow: 'hidden', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, bottom: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                    <CalendarGrid
                                        view={calendarView}
                                        currentDate={currentDate}
                                        events={events}
                                        onDayClick={() => navigate('/calendar')}
                                        startHour={8}
                                        endHour={22}
                                        dashboardMode={true}
                                    />
                                </div>
                            </div>
                            
                        </CalendarBox>

                        <CardBox>
                            <CardTitle>Bliskie terminy</CardTitle>
                            <ItemList>
                                {upcomingDeadlines.length > 0 ? (
                                    upcomingDeadlines.map((deadline) => {
                                        const categoryTag = deadline.tags && deadline.tags.length > 0 ? deadline.tags[0] : null;
                                        const categoryLabel = categoryTag && TAG_CONFIG[categoryTag] 
                                            ? TAG_CONFIG[categoryTag].label 
                                            : "TERMIN";

                                        return (
                                            <ListItem 
                                                key={deadline.id} 
                                                onClick={() => navigate('/calendar')}
                                                style={{ borderLeft: '4px solid #e74c3c' }}
                                            >
                                                <ItemInfo>
                                                    <ItemTitle>{deadline.title}</ItemTitle>
                                                    <ItemSub>
                                                        {deadline.date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' })}
                                                        {deadline.allDay ? '' : ` o ${String(deadline.startHour).padStart(2, '0')}:${String(deadline.startMin).padStart(2, '0')}`}
                                                    </ItemSub>
                                                </ItemInfo>
                                                <ItemMeta>
                                                    <TagPill style={{ color: '#e74c3c', textTransform: 'uppercase' }}>
                                                        {categoryLabel}
                                                    </TagPill>
                                                </ItemMeta>
                                            </ListItem>
                                        );
                                    })
                                ) : (
                                    renderEmptyDeadlines(0, 3)
                                )}
                                
                                {upcomingDeadlines.length > 0 && upcomingDeadlines.length < 3 && 
                                    renderEmptyDeadlines(upcomingDeadlines.length, 3)
                                }
                            </ItemList>
                            <MoreButton onClick={() => navigate('/calendar')}>Więcej...</MoreButton>
                        </CardBox>

                    </RightColumn>

                </DashboardLayout>
            </StyledContainer>
        </Layout>
    );
};

export default Home;