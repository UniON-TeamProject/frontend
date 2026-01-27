import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton'
import Text from '../components/atoms/Text'
import { getAllNotes, addNote, deleteNote } from '../api';
import { useNavigate } from 'react-router-dom'
import Input from '../components/atoms/Input';

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

const NotesContainer = styled.div`
    width:100%; 
    padding:20px 0;  
    display:flex;
    flex-flow:row wrap;
    gap:20px;
`

const StyledNote = styled.div`
    width:120px;
    cursor:pointer;
    @media(max-width:768px){
        width:90px;
    }
`

const StyledNoteImage = styled.div`
    width:100%;
    height:140px;
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

const StyledAddNoteButton = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  width:30px;
  background-color:${({ theme }) => theme.colors.darkGrey};
  border-radius:5px;
  color:${({ theme }) => theme.colors.text};
  font-weight:700;
  cursor: pointer;
`

const StyledAddNoteBox = styled.div`
    position:absolute;
    left:50%;
    transform:translateX(-50%);
    width:500px;
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

const Home = () => {
    const [username, setUsername] = useState(undefined);
    const [noteName, setNoteName] = useState("");
    const [notes, setNotes] = useState([]);
    const [addNoteErrorMessage, setAddNoteErrorMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [activeNoteOptionsId, setActiveNoteOptionsId] = useState(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteNameErrorMessage, setNoteNameErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleFetchNotes = async () => {
        setErrorMessage("");
        const res = await getAllNotes();
        if (res.errorCode)
            setErrorMessage(res.message);
        else {
            const sorted = [...res.notes].sort((a, b) => {
                const dateA = new Date(a.lastEdited ?? 0);
                const dateB = new Date(b.lastEdited ?? 0);
                return dateB - dateA;
            });
            setNotes(sorted);
        }
    }

    const handleAddNote = async () => {
        setErrorMessage("");
        const result = await addNote(noteName);
        if (result.errorCode)
            setAddNoteErrorMessage(result.message);
        else {
            setIsAddingNote(false);
            navigate(`/dokument/${result.id}`)
        }
        setNoteName("");
    }

    const handleDeleteNote = async (id) => {
        setErrorMessage("");
        const result = await deleteNote(id);
        if (result.errorCode)
            setErrorMessage(result.message);
        else
            handleFetchNotes();
    }

    useEffect(() => {
        let jwt = sessionStorage.getItem("token");
        if (jwt) {
            let tokenContent = parseJwt(jwt);
            setUsername(tokenContent?.sub);
            handleFetchNotes();
        }
    }, [])

    return (
        <StyledContainer onClick={() => {
            setActiveNoteOptionsId(null);
            setIsAddingNote(false);
        }}>
            <StyledHeader>
                <StyledName>Witaj, {username}!</StyledName>
                <SubmitButton style={{ width: "fit-content" }} color="dark" text="Wyloguj" path="/wyloguj" light />
            </StyledHeader>
            {errorMessage &&
                <Text color="danger" text={errorMessage} />}
            <NotesContainer>
                {notes.map((d) => {
                    const dateObj = new Date(d.lastEdited);
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
            </NotesContainer>
            <StyledAddNoteButton onClick={(e) => {
                e.stopPropagation();
                setIsAddingNote(!isAddingNote)
            }}>
                +
            </StyledAddNoteButton>

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
        </StyledContainer>
    )
}

export default Home;
