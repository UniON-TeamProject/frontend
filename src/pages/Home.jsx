import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, parseJwt, removeToken } from '../token';
import Layout from '../components/organisms/Layout';
import { getAllFlashcardSets, getAllNotes, getAllFolders } from '../api';


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
const ProgressGreen = styled.div`width: 50%; background-color: #72b36c;`
const ProgressBlue = styled.div`width: 50%; background-color: #a7caf0;`

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
                const setsData = await getAllFlashcardSets();
                const notesData = await getAllNotes();
                const foldersData = await getAllFolders();

                const setsArray = Array.isArray(setsData) ? setsData : (setsData.sets || []);
                const notesArray = Array.isArray(notesData) ? notesData : (notesData.notes || []);
                const foldersArray = Array.isArray(foldersData) ? foldersData : (foldersData.folders || []);

                const sortedFolders = [...foldersArray]
                    .filter(f => f.name !== "/")
                    .sort((a, b) => (b.id || 0) - (a.id || 0));

                const sortedNotes = [...notesArray]
                    .sort((a, b) => {
                        const dateA = new Date(a.editTime ?? a.lastEdited ?? a.createTime ?? 0).getTime();
                        const dateB = new Date(b.editTime ?? b.lastEdited ?? b.createTime ?? 0).getTime();
                        if (!dateA || isNaN(dateA) || dateA === 0) return (b.id || 0) - (a.id || 0); // fallback na ID
                        return dateB - dateA;
                    });

                setRecentSets(setsArray.slice(0, 3));
                setRecentNotes(sortedNotes.slice(0, 3)); 
                setRecentFolders(sortedFolders.slice(0, 4));
                
                setAllFoldersList(foldersArray);
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        };

        fetchData();
    }, [navigate]);

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

    return (
        <Layout>
            <StyledContainer>
                
                <StyledHeader>
                    <StyledName>Witaj, {username || "użytkowniku"}!</StyledName>
                    <HeaderRight>
                        {/* <SearchInput placeholder="Wyszukaj..." /> */}
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
                                {recentSets.map((set) => (
                                    <ListItem key={set.id} onClick={() => navigate(`/learning/set/${set.id}`)}>
                                        <ItemInfo>
                                            <ItemTitle>{set.name}</ItemTitle>
                                            <ItemSub>Ostatnia aktywność: </ItemSub>
                                        </ItemInfo>
                                        {/*    STATYSTYKI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
                                        <ItemMeta>
                                            <ProgressBar><ProgressGreen style={{width:'50%'}} /><ProgressBlue style={{width:'50%'}} /></ProgressBar>
                                        </ItemMeta>
                                    </ListItem>
                                ))}
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

                    </LeftColumn>

                    {/* PRAWA KOLUMNA */}
                    <RightColumn>
                        
                        <CalendarBox>
                            <CardTitle>Styczeń
                                <span style={{ cursor: 'pointer', color: '#707a73' }}>⋮</span>
                            </CardTitle>
                            
                            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#b3b9a8', fontSize: '1.2rem' }}>
                                (Miejsce na kalendarz)
                            </div>
                        </CalendarBox>

                        <BottomRow>
                            
                            <CardBox>
                                <CardTitle>Bliskie terminy</CardTitle>
                                <ItemList>
                                    {renderEmptyDeadlines(0, 3)}
                                </ItemList>
                                <MoreButton>Więcej...</MoreButton>
                            </CardBox>

                            <CardBox>
                                <CardTitle>Społeczności</CardTitle>
                                <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#b3b9a8', fontSize: '0.95rem', textAlign: 'center' }}>
                                    Brak nowych aktywności.
                                </div>
                                <MoreButton>Więcej...</MoreButton>
                            </CardBox>

                        </BottomRow>

                    </RightColumn>

                </DashboardLayout>
            </StyledContainer>
        </Layout>
    );
};

export default Home;