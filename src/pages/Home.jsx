import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton'
import Text from '../components/atoms/Text'
import { getAllDeletedNotes, addNote, deleteNote, clearTrash, restoreNote, getSubjectSuggestedTags, getAllSubjects, getSubjectContent, addSubject } from '../api';
import { useNavigate } from 'react-router-dom'
import Input from '../components/atoms/Input';
import { current } from '@reduxjs/toolkit';

const StyledContainer = styled.div`
   width: 100%;
   height:100%;
   min-height:100vh;
   padding:20px;
   position:relative;
`


const StyledHeader = styled.div`
    display:flex;
    flex-flow:row nowrap;
    justify-content:space-between;
    align-items:center;
`

const StyledName = styled.h2`
    color: ${({ theme }) => theme.colors.text};
    font-size: 3rem;
    @media(max-width:768px){
        font-size: 2rem;
    }
`

const ContentContainer = styled.div`
    width:100%; 
    padding:20px 0;  
    display:flex;
    flex-flow:row wrap;
    gap:20px;
`

const StyledNote = styled.div`
    width:85px;
    cursor:pointer;
    @media(max-width:768px){
        width:90px;
    }
`

const StyledNoteImage = styled.div`
    width:100%;
    height:100px;
    border:3px solid ${({ theme }) => theme.colors.darkGrey};
    border-radius:4px;
    padding:10px;
    @media(max-width:768px){
        height:110px;
    }
    >svg{
        color:${({ theme }) => theme.colors.darkGrey};
    }
`


const StyledFolder = styled.div`
    width:100px;
    cursor:pointer;
    @media(max-width:768px){
        width:90px;
    }
`

const StyledFolderImage = styled.div`
    width:100%;
    height:100px;
    padding:10px;
    @media(max-width:768px){
        height:110px;
    }
    >svg{
        color:${({ theme }) => theme.colors.black};
    }
`


const StyledNoteHeader = styled.div`
    position:relative;
    display:flex;
    flex-flow:row nowrap;
    justify-content:center;
    align-items:center;
    padding-left:14px;
    svg{
        width:9px;
        margin-left:5px;
        color:${({ theme }) => theme.colors.dark};
    }
`

const StyledNoteOptions = styled.div`
    display:${({ $active }) => $active ? "block" : "none"};
    position:absolute;
    left:95px;
    width:155px;
    border:2px solid ${({ theme }) => theme.colors.darkGrey};
    border-radius:5px;
    z-index:10;
    background-color: ${({ theme }) => theme.colors.white};
    padding:15px;
`

const StyledAddButton = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  width:30px;
  background-color:${({ theme }) => theme.colors.darkGrey};
  border-radius:5px;
  color:${({ theme }) => theme.colors.text};
  font-weight:700;
  cursor: pointer;
`

const StyledAddOptions = styled.div`
    display:${({ $active }) => $active ? "block" : "none"};
    position:absolute;
    left:60px;
    width:200px;
    border:2px solid ${({ theme }) => theme.colors.darkGrey};
    border-radius:5px;
    z-index:10;
    background-color: ${({ theme }) => theme.colors.white};
    padding:10px;
    cursor:default;
    >div{
        cursor:pointer;
        padding:5px 0;
        border-bottom: 2px solid ${({ theme }) => theme.colors.lightGrey};
    }
    :nth-last-child(1){
        border:none;
    }
`

const StyledClearTrashButton = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  width:120px;
  background-color:${({ theme }) => theme.colors.danger};
  border-radius:5px;
  color:${({ theme }) => theme.colors.white};
  font-weight:700;
  cursor: pointer;
`

const StyledAddNoteBox = styled.div`
    position:absolute;
    left:50%;
    transform:translateX(-50%);
    width:700px;
    height:300px;
    padding:60px;
    border-radius:5px;
    background-color:${({ theme }) => theme.colors.white};
    @media(max-width:768px){
        width:90%;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        border:1px solid black;
    }   
`

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const TagsContainer = styled.div`
  width:100%;
  display:flex;
  flex-flow:row wrap;
  align-items:center;
  >p{
    color:${({ theme }) => theme.colors.darkGrey};
    font-size:1rem;
    margin-right:7px;
    font-weight:600;
  }
`

const StyledTag = styled.div`
  padding:2px 10px;
  margin: 3px;
  background-color:${({ theme, $active }) => $active ? theme.colors.secondary : theme.colors.darkGrey};
  border-radius:10px;
  color:${({ theme, $active }) => $active ? theme.colors.white : theme.colors.text};
  font-weight:500;
  font-size: 0.9rem;
  display:flex;
  flex-flow:row-nowrap;
  cursor: default;
  >div{
    cursor:pointer;
    font-weight:700;
    font-size:1rem;
    margin:0 0 0 6px;
    padding:0;
    position:relative;
    bottom:2px;
  }
`
const StyledAddTagButton = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  background-color:${({ theme }) => theme.colors.darkGrey};
  border-radius:7px;
  color:${({ theme }) => theme.colors.text};
  font-weight:500;
  cursor: pointer;
`

const StyledTagInput = styled.input`
  padding: 2px 10px;
  margin: 0 3px;
  border-radius: 10px;
  color:${({ theme }) => theme.colors.white};
  border:none;
  width:100px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus{
    outline:none;
  }
`

const Home = () => {
    const [username, setUsername] = useState(undefined);
    const [noteName, setNoteName] = useState("");
    const [folderName, setFolderName] = useState("");
    const [notes, setNotes] = useState([]);
    const [deletedNotes, setDeletedNotes] = useState([]);
    const [addNoteErrorMessage, setAddNoteErrorMessage] = useState("");
    const [addFolderErrorMessage, setAddFolderErrorMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [activeNoteOptionsId, setActiveNoteOptionsId] = useState(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [isActiveAddOptions, setIsActiveAddOptions] = useState(false);
    const [noteNameErrorMessage, setNoteNameErrorMessage] = useState("");
    const [folderNameErrorMessage, setFolderNameErrorMessage] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [newTag, setNewTag] = useState('')
    const [suggestedTags, setSuggestedTags] = useState('')
    const [chosenTags, setChosenTags] = useState([])
    const navigate = useNavigate();
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [subFolders, setSubFolders] = useState([]);

    const handleFetchRootContent = async () => {
        const res = await getAllSubjects();
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode === "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
            return;
        }
        const rootSubject = res.subjects.find(s => s.name === "/" && s.path === "/");
        if (rootSubject) {
            const content = await getSubjectContent(rootSubject.id);
            if (!content.errorCode) {
                setSubFolders(content.subFolders || []);
                setNotes((content.notes || []).sort((a, b) => {
                    const dateA = new Date(a.editTime ?? 0);
                    const dateB = new Date(b.editTime ?? 0);
                    return dateB - dateA;
                }));
            }
        } else {
            setSubFolders(res.subjects.filter(s => s.path === "/"));
            setNotes([]);
        }
    };

    const handleOpenFolder = async (folder) => {
        const res = await getSubjectContent(folder.id);
        if (!res.errorCode) {
            setSubFolders(res.subFolders || []);
            setNotes((res.notes || []).sort((a, b) => {
                const dateA = new Date(a.editTime ?? 0);
                const dateB = new Date(b.editTime ?? 0);
                return dateB - dateA;
            }));
            const newBreadcrumbs = [...breadcrumbs, folder];
            setCurrentFolder(folder);
            setBreadcrumbs(newBreadcrumbs);
            saveFolderPosition(folder, newBreadcrumbs);
        }
    };

    const saveFolderPosition = (folder, crumbs) => {
        if (folder) {
            sessionStorage.setItem("currentFolder", JSON.stringify(folder));
            sessionStorage.setItem("breadcrumbs", JSON.stringify(crumbs));
        } else {
            sessionStorage.removeItem("currentFolder");
            sessionStorage.removeItem("breadcrumbs");
        }
    };

    // Navigate back
    const handleBreadcrumbClick = async (index) => {
        if (index === -1) {
            // Go to root
            setCurrentFolder(null);
            setBreadcrumbs([]);
            saveFolderPosition(null, []);
            await handleFetchRootContent();
        } else {
            const target = breadcrumbs[index];
            const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
            const res = await getSubjectContent(target.id);
            if (!res.errorCode) {
                setSubFolders(res.subFolders || []);
                setNotes((res.notes || []).sort((a, b) => {
                    const dateA = new Date(a.editTime ?? 0);
                    const dateB = new Date(b.editTime ?? 0);
                    return dateB - dateA;
                }));
                setBreadcrumbs(newBreadcrumbs);
                setCurrentFolder(target);
                saveFolderPosition(target, newBreadcrumbs);
            }
        }
    };

    const refreshCurrentView = async () => {
        if (currentFolder) {
            const res = await getSubjectContent(currentFolder.id);
            console.log("refreshCurrentView response:", JSON.stringify(res, null, 2));
            if (!res.errorCode) {
                setSubFolders(res.subFolders || []);
                setNotes((res.notes || []).sort((a, b) => {
                    const dateA = new Date(a.editTime ?? 0);
                    const dateB = new Date(b.editTime ?? 0);
                    return dateB - dateA;
                }));
            }
        } else {
            await handleFetchRootContent();
        }
    };

    const handleFetchDeletedNotes = async () => {
        setErrorMessage("");
        const res = await getAllDeletedNotes();
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            const sorted = [...res.notes].sort((a, b) => {
                const dateA = new Date(a.lastEdited ?? 0);
                const dateB = new Date(b.lastEdited ?? 0);
                return dateB - dateA;
            });
            setDeletedNotes(sorted);
        }
    }

    const getCurrentPath = () => {
        if (breadcrumbs.length === 0) return "/";
        return "/" + breadcrumbs.map(b => b.name).join("/");
    };

    const handleAddNote = async () => {
        setAddNoteErrorMessage("");
        const res = await addNote(noteName, getCurrentPath());
        if (res.errorCode) {
            setAddNoteErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            setIsAddingNote(false);
            navigate(`/dokument/${res.id}`)
        }
        setNoteName("");
    }

    const handleDeleteNote = async (id) => {
        setErrorMessage("");
        const res = await deleteNote(id);
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            await refreshCurrentView();
            handleFetchDeletedNotes();
        }
    }

    const handleRestoreNote = async (id) => {
        setErrorMessage("")
        const res = await restoreNote(id);
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            await refreshCurrentView();
            handleFetchDeletedNotes();
        }
    }

    const handleClearTrash = async () => {
        setErrorMessage("")
        const res = await clearTrash();
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            await refreshCurrentView();
            handleFetchDeletedNotes();
        }
    }

    const handleFetchSubjectSuggestedTags = async () => {
        setAddFolderErrorMessage("")
        const res = await getSubjectSuggestedTags(currentFolder?.id);
        if (res.errorCode) {
            setAddFolderErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            setSuggestedTags(res.tags);
            setChosenTags(res.tags);
        }

    }

    const handleAddFolder = async () => {
        setAddFolderErrorMessage("");
        const res = await addSubject(folderName, getCurrentPath());
        if (res.errorCode) {
            setAddFolderErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            setIsAddingFolder(false);
        }
        setFolderName("");
        await refreshCurrentView();
    }

    useEffect(() => {
        let jwt = sessionStorage.getItem("token");
        if (jwt) {
            let tokenContent = parseJwt(jwt);
            setUsername(tokenContent?.sub);

            // Restore last folder position from sessionStorage
            const savedFolder = sessionStorage.getItem("currentFolder");
            const savedBreadcrumbs = sessionStorage.getItem("breadcrumbs");
            if (savedFolder && savedBreadcrumbs) {
                const folder = JSON.parse(savedFolder);
                const crumbs = JSON.parse(savedBreadcrumbs);
                setCurrentFolder(folder);
                setBreadcrumbs(crumbs);
                getSubjectContent(folder.id).then(res => {
                    if (!res.errorCode) {
                        setSubFolders(res.subFolders || []);
                        setNotes((res.notes || []).sort((a, b) => {
                            const dateA = new Date(a.editTime ?? 0);
                            const dateB = new Date(b.editTime ?? 0);
                            return dateB - dateA;
                        }));
                    }
                });
            } else {
                handleFetchRootContent();
            }
            handleFetchDeletedNotes();
        }
    }, [])

    return (
        <StyledContainer onClick={() => {
            setActiveNoteOptionsId(null);
            setIsAddingNote(false);
            setIsAddingFolder(false);
            setIsActiveAddOptions(false);
        }}>
            <StyledHeader>
                <StyledName>Witaj, {username}!</StyledName>
                <SubmitButton style={{ width: "fit-content" }} color="dark" text="Wyloguj" path="/wyloguj" light />
            </StyledHeader>
            {errorMessage &&
                <Text color="danger" text={errorMessage} />}
            <div style={{ width: "100%", display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ cursor: "pointer" }} onClick={() => handleBreadcrumbClick(-1)}>
                    Główny
                </span>
                {breadcrumbs.map((b, i) => (
                    <React.Fragment key={b.id}>
                        <span>/</span>
                        <span style={{ cursor: "pointer" }} onClick={() => handleBreadcrumbClick(i)}>
                            {b.name}
                        </span>
                    </React.Fragment>
                ))}
            </div>
            <ContentContainer>
                {subFolders.map((folder) => (
                    <StyledFolder key={`folder-${folder.id}`}>
                        <StyledFolderImage onClick={() => handleOpenFolder(folder)}>
                            <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                            </svg>
                        </StyledFolderImage>
                        <Text style={{ width: "unset" }} as="h4" bold="true" text={folder.name} />
                    </StyledFolder>
                ))}
                {notes.map((d) => {
                    const dateObj = new Date(d.editTime ?? d.lastEdited);
                    const formattedDate = dateObj.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' o');
                    return (
                        <StyledNote key={d.id}>
                            <StyledNoteImage onClick={() => { navigate(`/dokument/${d.id}`) }}>
                                <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5m0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                </svg>
                            </StyledNoteImage>
                            <StyledNoteHeader onClick={(e) => {
                                e.stopPropagation();
                                setActiveNoteOptionsId(activeNoteOptionsId === d.id ? null : d.id)
                            }}
                            >
                                <Text style={{ width: "unset" }} as="h4" bold="true" text={d.name} />
                                <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>
                                <StyledNoteOptions $active={activeNoteOptionsId === d.id}>
                                    <div onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(d.id);
                                        setActiveNoteOptionsId(null);
                                    }}>Usuń dokument</div>
                                </StyledNoteOptions>
                            </StyledNoteHeader>
                            <Text as="h6" text={formattedDate} />
                        </StyledNote>
                    )
                })}
                {currentFolder && currentFolder.name == "teścik" &&
                    <StyledFolder style={{ color: "rgb(255,0,0)" }}>
                        <StyledFolderImage onClick={() => handleOpenFolder("\trash")}>
                            <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                            </svg>
                        </StyledFolderImage>
                        <Text style={{ width: "unset" }} as="h4" bold="true" text="Usunięte" />
                    </StyledFolder>
                }
            </ContentContainer>
            <StyledAddButton onClick={(e) => {
                e.stopPropagation();
                setIsActiveAddOptions(!isActiveAddOptions);
            }}>
                +
            </StyledAddButton>
            <StyledAddOptions $active={isActiveAddOptions}>
                <div onClick={(e) => {
                    e.stopPropagation();
                    handleFetchSubjectSuggestedTags();
                    setIsAddingFolder(true);
                    setIsActiveAddOptions(false);
                }}>Nowy folder</div>
                <div onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingNote(true);
                    setIsActiveAddOptions(false);
                }}>Nowy dokument</div>
            </StyledAddOptions>

            <Text text="Usunięte:" as="h2" bold="true" />
            <ContentContainer>
                {deletedNotes.map((d) => {
                    const dateObj = new Date(d.editTime ?? d.lastEdited);
                    const formattedDate = dateObj.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' o');
                    return (
                        <StyledNote key={d.id}>
                            <StyledNoteImage style={{ backgroundColor: 'red' }}>
                                <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5m0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                </svg>
                            </StyledNoteImage>
                            <StyledNoteHeader onClick={(e) => {
                                e.stopPropagation();
                                setActiveNoteOptionsId(activeNoteOptionsId === d.id ? null : d.id)
                            }}
                            >
                                <Text style={{ width: "unset" }} as="h4" bold="true" text={d.name} />
                                <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>
                                <StyledNoteOptions $active={activeNoteOptionsId === d.id}>
                                    <div onClick={(e) => {
                                        e.stopPropagation();
                                        handleRestoreNote(d.id);
                                        setActiveNoteOptionsId(null);
                                    }}>Przywróć</div>
                                </StyledNoteOptions>
                            </StyledNoteHeader>
                            <Text as="h6" text={formattedDate} />
                        </StyledNote>
                    )
                })}
            </ContentContainer>
            {deletedNotes.length > 0 && <StyledClearTrashButton onClick={(e) => {
                e.stopPropagation();
                handleClearTrash();
            }}>
                Usuń na śmierć
            </StyledClearTrashButton>}

            {isAddingNote &&
                <StyledAddNoteBox onClick={(e) => e.stopPropagation()}>
                    <Text bold="true" as="h2" text="Nowy Dokument" />
                    {addNoteErrorMessage &&
                        <Text color="danger" text={addNoteErrorMessage} />}
                    {noteNameErrorMessage &&
                        <Text color="danger" text={noteNameErrorMessage} />}
                    < Input
                        type="text"
                        name="name"
                        placeholder="Nazwa"
                        value={noteName}
                        mode={noteNameErrorMessage ? "error" : "normal"}
                        onChange={(e) => {
                            setNoteName(e.target.value);
                            setNoteNameErrorMessage("");
                        }}
                    />

                    <SubmitButton text="Stwórz" color="dark" onClick={(e) => {
                        e.preventDefault();
                        const nameEmpty = !noteName;
                        if (nameEmpty) setNoteNameErrorMessage("Wypełnij pole");
                        if (!nameEmpty) handleAddNote();
                    }} />
                </StyledAddNoteBox>
            }
            {isAddingFolder &&
                <StyledAddNoteBox onClick={(e) => e.stopPropagation()}>
                    <Text bold="true" as="h2" text="Nowy Folder" />
                    {addFolderErrorMessage &&
                        <Text color="danger" text={addFolderErrorMessage} />}
                    {folderNameErrorMessage &&
                        <Text color="danger" text={folderNameErrorMessage} />}
                    < Input
                        type="text"
                        name="name"
                        placeholder="Nazwa"
                        value={folderName}
                        mode={folderNameErrorMessage ? "error" : "normal"}
                        onChange={(e) => {
                            setFolderName(e.target.value);
                            setFolderNameErrorMessage("");
                        }}
                    />
                    <TagsContainer>
                        <p>Tagi: </p>
                        {chosenTags.map((tag, index) => (
                            <StyledTag $active={chosenTags.includes(tag)} key={index} onClick={() => {
                                setChosenTags(prev =>
                                    prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                );
                            }}>
                                {tag}
                            </StyledTag>
                        ))}
                        {isAddingTag && (
                            <StyledTagInput
                                autoFocus
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newTag.trim()) {
                                        setChosenTags(prev => [...prev, newTag.trim()])
                                        setNewTag('')
                                        setIsAddingTag(false)
                                    }
                                    if (e.key === 'Escape') {
                                        setIsAddingTag(false)
                                        setNewTag('')
                                    }
                                }}
                                onBlur={() => {
                                    setIsAddingTag(false)
                                    setNewTag('')
                                }}
                            />
                        )}

                        {!isAddingTag && (
                            <StyledAddTagButton onClick={() => setIsAddingTag(true)}>
                                +
                            </StyledAddTagButton>
                        )}
                    </TagsContainer>
                    <SubmitButton text="Stwórz" color="dark" onClick={(e) => {
                        e.preventDefault();
                        const nameEmpty = !folderName;
                        if (nameEmpty) setFolderNameErrorMessage("Wypełnij pole");
                        if (!nameEmpty) handleAddFolder();
                    }} />
                </StyledAddNoteBox>
            }
        </StyledContainer >
    )
}

export default Home;
