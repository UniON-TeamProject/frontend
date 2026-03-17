import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton';
import Text from '../components/atoms/Text';
import Input from '../components/atoms/Input';
import { addCard, deleteCard, editCard, addFlashcardSet, getAllFlashcardSets, editFlashcardSet, deleteFlashcardSet, resetFlashcardSetProgress } from '../api';
import { getToken } from '../token';
import Flashcard from '../components/organisms/Flashcard';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/organisms/Layout';

const StyledContainer = styled.div`
    width: 100%;
    height: 100%;
    min-height: 100vh;
    padding: 20px 40px;
    position: relative;
    background-color: transparent; 
`;
/*
const TopSection = styled.div`
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
    position: relative;
`;

const MainTitle = styled.h1`
    font-size: 3rem;
    font-weight: 600;
    color: #000;
    margin-bottom: 20px;
`;

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: #000;
    margin-bottom: 20px;
`;
*/
const StyledUserHeader = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const StyledName = styled.h2`
    color: ${({ theme }) => theme.colors?.text || '#333'};
    font-size: 2.5rem;
    cursor: default;
    @media(max-width:768px){
        font-size: 2rem;
    }
`;

const SubTitle = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.darkGrey || '#666'};
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 15px;
`;

const BackButton = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors?.darkGrey || '#666'};
    transition: color 0.2s;
    
    &:hover {
        color: ${({ theme }) => theme.colors?.text || '#000'};
    }
    
    > svg {
        margin-right: 8px;
    }
`;



const ContentContainer = styled.div`
    width: 100%; 
    padding: 20px 0;
    display: flex;
    flex-flow: row wrap;
    gap: 30px;
`;

const StartLearningButton = styled.button`
    background-color: ${({ theme }) => theme.colors?.secondary || '#555'};
    color: ${({ theme }) => theme.colors?.white || '#fff'};
    border: none;
    border-radius: 8px;
    padding: 12px 25px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
    
    &:hover { opacity: 0.8; }
`;

/*

const ContinueLearningBanner = styled.div`
    background-color: #ffffff;
    
    border-radius: 10px;
    padding: 12px 25px;
    font-size: 16px;
    color: #333;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
`;

const LearningDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 5px;
    background-color: #d1d4c9;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    width: 100%;
    z-index: 20;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const LearningDropdownItem = styled.button`
    padding: 12px 20px;
    background: transparent;
    border: none;
    text-align: left;
    font-size: 15px;
    cursor: pointer;
    color: #333;
    font-family: inherit;
    border-bottom: 1px solid rgba(0,0,0,0.05);

    &:hover {
        background-color: #c2c5ba;
    }
    &:last-child {
        border-bottom: none;
    }
`;
*/

const CardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 40px; 
    justify-items: center;
    padding: 20px 0;
    width: 100%;
    align-items: stretch;
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
`;

const SetIconContainer = styled.div`
    position: relative;
    width: 140px;
    height: 100px;
    margin: auto;
    margin-bottom: 10px;
    color: ${({ theme }) => theme.colors?.black || '#000'};
`;

const StyledItemHeaderWrapper = styled.div`
    text-align: center;
    word-break: break-word;
    width: 100%;
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
    color: ${({ theme }) => theme.colors?.text || '#333'};
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors?.lightGrey || '#f4f4f4'};
    }
    
    svg {
        width: 18px;
        height: 18px;
        color: ${({ theme }) => theme.colors?.darkGrey || '#666'};
    }
`;

const StyledItemOptions = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    // transform: translateX(-50%);
    margin-top: 8px;
    width: 200px;
    border: 2px solid ${({ theme }) => theme.colors?.darkGrey || '#ccc'};
    border-radius: 5px;
    z-index: 20;
    background-color: ${({ theme }) => theme.colors?.white || '#fff'};
    padding: 10px;
    text-align: left;
    cursor: default;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const StyledItemOption = styled.div`
    cursor: pointer;
    display: flex; 
    align-items: center;
    font-weight: 600;
    padding: 8px 0;
    color: ${({ theme }) => theme.colors?.text || '#333'};
    
    &.danger {
        color: ${({ theme }) => theme.colors?.danger || 'red'};
        > svg { color: ${({ theme }) => theme.colors?.danger || 'red'}; }
    }
    
    > svg {
        width: 16px;
        margin-right: 10px;
        flex-shrink: 0;
    }
    
    &:hover { opacity: 0.7; }
`;
/*

const SetTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
    color: #000;
    margin-bottom: 10px;
    line-height: 1.3;
`;
*/

const TagsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
`;

const StyledTag = styled.div`
    padding: 2px 10px;
    margin: 3px;
    background-color: ${({ theme, $inactive }) => $inactive ? theme.colors?.darkGrey : theme.colors?.secondary};
    border-radius: 10px;
    color: ${({ theme }) => theme.colors?.white || '#fff'};
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
`;

const CardInputSide = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

/*
const TagPill = styled.span`
    background-color: #f4f4f4;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.75rem;
    color: #555;
    font-weight: 500;
`;
*/

const SideLabel = styled.label`
    font-size: 13px;
    color: #888;
    margin-bottom: 10px;
    text-transform: uppercase;
`;

const StyledCardTextarea = styled.textarea`
    width: 100%;
    height: 220px;
    border-radius: 15px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
    padding: 30px;
    font-size: 16px;
    resize: none;
    outline: none;
    font-family: inherit;
    text-align: center;
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
        border-color: #c2c5ba;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
`;


const AddMoreRowButton = styled.button`
    background: transparent;
    border: 2px dashed ${({ theme }) => theme.colors?.darkGrey || '#ccc'};
    border-radius: 10px;
    padding: 15px 40px;
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#555'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.5 : 1};
    transition: all 0.2s;
    
    &:hover {
        background: ${({ theme, disabled }) => disabled ? 'transparent' : theme.colors?.lightGrey || '#fafafa'};
    }
`;

const FloatingActionButton = styled.button`
    position: fixed;
    bottom: 40px;
    right: 40px;
    width: 70px;
    height: 70px;
    background-color: ${({ theme }) => theme.colors?.white || '#fff'};
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    z-index: 100;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(0,0,0,0.15);
    }
    
    svg {
        width: 32px;
        height: 32px;
        color: ${({ theme }) => theme.colors?.secondary || '#555'};
    }
`;

const StyledPopup = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    min-height: 300px;
    padding: 60px;
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors?.white || '#fff'};
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 1000;
    
    @media(max-width:768px){
        width: 90%;
        padding: 40px;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 999;
`;

const EmptyStateContainer = styled.div`
    width: 100%;
    padding: 60px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: ${({ theme }) => theme.colors?.text || '#333'};
    opacity: 0.5;
`;


/*
const StyledModalBox = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    padding: 60px;
    border-radius: 15px;
    background-color: ${({ theme }) => theme.colors?.white || '#fff'};
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    z-index: 1000;
`;

const InvisibleOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 15;
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 100px;
    right: -80px; 
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 5px 0;
    z-index: 20;
    min-width: 120px;
    display: flex;
    flex-direction: column;
`;

const DropdownItem = styled.button`
    padding: 8px 15px;
    background: none;
    border: none;
    text-align: left;
    font-size: 13px;
    cursor: pointer;
    color: #333;
    font-family: inherit;
    &:hover { background-color: #f5f5f5; }
`;
*/
const StyledModalTextArea = styled.textarea`
    width: 100%;
    padding: 15px;
    margin: 10px 0 20px 0;
    border: 1px solid ${({ theme }) => theme.colors?.darkGrey || '#ccc'};
    border-radius: 5px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 100px;
    background-color: ${({ theme }) => theme.colors?.lightGrey || '#f9f9f9'};
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors?.secondary || '#888'};
    }
`;

const SetHeaderControls = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
`;

const ActionBanner = styled.div`
    background-color: ${({ theme }) => theme.colors?.lightGrey || '#f4f4f4'};
    border-radius: 8px;
    padding: 12px 25px;
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#333'};
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover { background-color: ${({ theme }) => theme.colors?.darkGrey || '#e0e0e0'}; color: ${({ theme }) => theme.colors?.white || '#000'}; }
`;






const StackedCardsIcon = () => (
    <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="15" y="10" width="115" height="75" rx="5" transform="rotate(-4 15 10)" fill="white" stroke="black" strokeWidth="2" />
        <circle cx="22" cy="18" r="3" fill="white" stroke="black" strokeWidth="1.5" transform="rotate(-4 15 10)" />
        <rect x="5" y="20" width="115" height="75" rx="5" fill="white" stroke="black" strokeWidth="2.5" />
        <circle cx="15" cy="32" r="3" fill="white" stroke="black" strokeWidth="1.5" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" width="32" height="32" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const CheckmarkIcon = () => (
    <svg viewBox="0 0 24 24" width="36" height="36" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const EllipsisIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>
);

// 
//
// 
const FlashcardsPage = () => {
    const navigate = useNavigate();
    const { setId } = useParams();

    const [activeSetId, setActiveSetId] = useState(null);

    const [sets, setSets] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [isSetModalOpen, setIsSetModalOpen] = useState(false);
    const [editingSetId, setEditingSetId] = useState(null);
    const [setName, setSetName] = useState("");
    const [setTags, setSetTags] = useState("");

    const [isCardEditModalOpen, setIsCardEditModalOpen] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editAnswer, setEditAnswer] = useState("");

    const [isLearningMenuOpen, setIsLearningMenuOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newCards, setNewCards] = useState([{ question: "", answer: "" }]);
    // sprawdza, czy w tablicy newCards jest chociaz jedna pusta fiszka zeby nie wyklikiwac w nieskonczonosc "dodaj nową"
    const hasEmptyCard = newCards.some(card => card.question.trim() === "" && card.answer.trim() === "");

    const fetchData = async () => {
        setErrorMessage("");
        const setsRes = await getAllFlashcardSets();
        if (!setsRes.errorCode) {
            setSets(setsRes.sets || []);
        } else {
            if (setsRes.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(setsRes.message);
        }
    };

    useEffect(() => {
        if (!getToken()) { navigate("/", { replace: true }); return; }
        fetchData();
    }, []);

    useEffect(() => {
        if (setId && sets.length > 0) {
            const setToOpen = sets.find(set => set.id === parseInt(setId));
            if (setToOpen) {
                setActiveSetId(setToOpen.id);
            }
        } else if (!setId) {
            setActiveSetId(null);
            setIsLearningMenuOpen(false);
            setIsAddingMode(false);
        }
    }, [setId, sets]);

    const currentSet = sets.find(s => s.id === activeSetId);

    // DODAWANIE FISZEK
    const updateNewCard = (index, field, value) => {
        const updated = [...newCards];
        updated[index][field] = value;
        setNewCards(updated);
    };

    const handleSaveNewCards = async () => {
        setErrorMessage("");
        let addedCount = 0;

        for (const card of newCards) {
            if (card.question.trim() && card.answer.trim()) {
                const res = await addCard(card.question, card.answer, parseInt(activeSetId), []);
                if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
                if (!res.errorCode) addedCount++;
            }
        }

        if (addedCount > 0) {
            setSuccessMessage(`Pomyślnie dodano!`);
            fetchData();
            setIsAddingMode(false);
            setNewCards([{ question: "", answer: "" }]);
            setTimeout(() => setSuccessMessage(""), 3000);
        } else {
            setErrorMessage("Nie dodano żadnej fiszki (puste pola).");
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
        if (!editQuestion.trim() || !editAnswer.trim()) {
            setErrorMessage("Pytanie i odpowiedź są wymagane!");
            return;
        }

        const res = await editCard(editingCardId, editQuestion, editAnswer, parseInt(activeSetId), []);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            setErrorMessage(res.message);
        } else {
            setSuccessMessage("Fiszka zaktualizowana!");
            fetchData();
            setTimeout(() => {
                setIsCardEditModalOpen(false);
                setSuccessMessage("");
            }, 1000);
        }
    };

    const handleDeleteCard = async (id) => {
        const isConfirmed = window.confirm("Czy na pewno chcesz usunąć tę fiszkę?");
        if (!isConfirmed) return;
        const res = await deleteCard(id);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            setErrorMessage(res.message);
        } else fetchData();
    };

    const openAddSetModal = () => {
        setEditingSetId(null);
        setSetName("");
        setSetTags("");
        setErrorMessage("");
        setSuccessMessage("");
        setIsSetModalOpen(true);
    };

    const openEditSetModal = (set) => {
        setEditingSetId(set.id);
        setSetName(set.name);
        setSetTags(set.tags && set.tags.length > 0 ? set.tags.join(', ') : "");
        setErrorMessage("");
        setSuccessMessage("");
        setIsSetModalOpen(true);
    };

    const handleDeleteSet = async (id) => {
        const isConfirmed = window.confirm("Czy na pewno chcesz usunąć ten zestaw wraz z fiszkami?");
        if (!isConfirmed) return;
        const res = await deleteFlashcardSet(id);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            setErrorMessage(res.message);
        } else fetchData();
    };

    const handleSaveSet = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!setName.trim()) {
            setErrorMessage("Nazwa zestawu jest wymagana!");
            return;
        }

        const tagsArray = setTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        let res;

        if (editingSetId) res = await editFlashcardSet(editingSetId, setName, tagsArray);
        else res = await addFlashcardSet(setName, tagsArray, "/");

        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else
                setErrorMessage(res.message);
        } else {
            setSuccessMessage(editingSetId ? "Zestaw zaktualizowany!" : "Zestaw utworzony!");
            fetchData();
            setTimeout(() => {
                setIsSetModalOpen(false);
                setSuccessMessage("");
            }, 1000);
        }
    };


    return (
        <Layout>
            <StyledContainer onClick={() => setActiveMenuId(null)}>
                <StyledUserHeader>
                    <StyledName>Fiszki</StyledName>
                </StyledUserHeader>

                {/* NAGŁÓWEK */}
                {!activeSetId ? (
                    <SubTitle>Twoje zestawy do nauki...</SubTitle>
                ) : (
                    <>
                        <SubTitle>
                            <BackButton onClick={() => {
                                if (isAddingMode) setIsAddingMode(false);
                                else navigate('/learning');
                            }}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                                </svg>
                                Powrót do zestawów
                            </BackButton>
                        </SubTitle>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                            <StyledName style={{ fontSize: '2rem', margin: 0 }}>{currentSet?.name}</StyledName>
                            {currentSet?.tags && currentSet.tags.length > 0 && !isAddingMode && (
                                <TagsContainer style={{ width: 'auto', marginTop: 0 }}>
                                    {currentSet.tags.map((tag, i) => (
                                        <StyledTag key={i}>{tag}</StyledTag>
                                    ))}
                                </TagsContainer>
                            )}
                        </div>

                        {!isAddingMode && (
                            <SetHeaderControls>
                                <ActionBanner onClick={() => navigate(`/learning/fast/${currentSet?.id}`)}>
                                    Wznów ostatnią sesję
                                </ActionBanner>

                                <div style={{ position: 'relative' }}>
                                    <StartLearningButton onClick={(e) => { e.stopPropagation(); setIsLearningMenuOpen(!isLearningMenuOpen); }}>
                                        Rozpocznij naukę
                                        <svg style={{ marginLeft: '8px' }} width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                        </svg>
                                    </StartLearningButton>

                                    {isLearningMenuOpen && (
                                        <StyledItemOptions style={{ top: 'calc(100% + 5px)', left: 'auto', right: '0', transform: 'none' }}>
                                            <StyledItemOption onClick={() => navigate(`/learning/fast/${currentSet?.id}`)}>
                                                Szybka nauka
                                            </StyledItemOption>
                                            <StyledItemOption onClick={() => navigate(`/learning/fsrs/${currentSet?.id}`)}>
                                                Trwała nauka
                                            </StyledItemOption>
                                        </StyledItemOptions>
                                    )}
                                </div>
                            </SetHeaderControls>
                        )}
                    </>
                )}

                {errorMessage && !isSetModalOpen && !isCardEditModalOpen && <Text color="danger" text={errorMessage} />}
                {successMessage && !isSetModalOpen && !isCardEditModalOpen && <Text style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }} text={successMessage} />}

                {/* LISTA ZESTAWÓW */}
                {!activeSetId && (
                    <ContentContainer>
                        {sets.length === 0 && !errorMessage ? (
                            <EmptyStateContainer>
                                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4z" />
                                </svg>
                                <p style={{ fontSize: '1rem', fontWeight: '600' }}>Brak zestawów. Utwórz swój pierwszy!</p>
                            </EmptyStateContainer>
                        ) : (
                            sets.map((set) => (
                                <SetItemWrapper key={set.id} onClick={() => navigate(`/learning/set/${set.id}`)}>
                                    <SetIconContainer>
                                        <StackedCardsIcon />
                                    </SetIconContainer>
                                    <StyledItemHeaderWrapper>
                                        <Text as="h4" bold="true" text={set.name} style={{ marginBottom: '10px' }} />
                                        <StyledItemHeader onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === set.id ? null : set.id);
                                        }}>
                                            <EllipsisIcon />
                                            
                                            {activeMenuId === set.id && (
                                                <StyledItemOptions onClick={e => e.stopPropagation()}>
                                                    <StyledItemOption onClick={() => { setActiveMenuId(null); openEditSetModal(set); }}>
                                                        <svg fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" /></svg>
                                                        Edytuj zestaw
                                                    </StyledItemOption>
                                                    <StyledItemOption className="danger" onClick={() => { setActiveMenuId(null); handleDeleteSet(set.id); }}>
                                                        <svg fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" /></svg>
                                                        Usuń zestaw
                                                    </StyledItemOption>
                                                </StyledItemOptions>
                                            )}
                                        </StyledItemHeader>
                                    </StyledItemHeaderWrapper>
                                    
                                    {set.tags && set.tags.length > 0 && (
                                        <TagsContainer>
                                            {set.tags.map((tag, i) => (
                                                <StyledTag key={i}>{tag}</StyledTag>
                                            ))}
                                        </TagsContainer>
                                    )}
                                </SetItemWrapper>
                            ))
                        )}
                    </ContentContainer>
                )}

                {/* WNETRZE ZESTAWU */}
                {activeSetId && !isAddingMode && (
                    <ContentContainer>
                        {(!currentSet?.cards || currentSet.cards.length === 0) && !errorMessage ? (
                            <EmptyStateContainer>
                                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                                </svg>
                                <p style={{ fontSize: '1rem', fontWeight: '600' }}>Ten zestaw jest pusty. Kliknij +, aby dodać fiszkę!</p>
                            </EmptyStateContainer>
                        ) : (
                            currentSet.cards.map((card) => (
                                <Flashcard
                                    key={card.id}
                                    question={card.contentFirstSide || card.question}
                                    answer={card.contentFlipSide || card.answer}
                                    onEdit={() => openEditCardModal(card)}
                                    onDelete={() => handleDeleteCard(card.id)}
                                />
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
                                    <StyledCardTextarea
                                        placeholder="Wprowadź pytanie..."
                                        value={card.question}
                                        onChange={(e) => updateNewCard(index, 'question', e.target.value)}
                                    />
                                </CardInputSide>
                                <CardInputSide>
                                    <SideLabel>Tył:</SideLabel>
                                    <StyledCardTextarea
                                        placeholder="Wprowadź odpowiedź..."
                                        value={card.answer}
                                        onChange={(e) => updateNewCard(index, 'answer', e.target.value)}
                                    />
                                </CardInputSide>
                            </CardInputRow>
                        ))}

                        <AddMoreRowButton
                            disabled={hasEmptyCard}
                            onClick={() => setNewCards([...newCards, { question: "", answer: "" }])}
                        >
                            + Dodaj nową fiszkę...
                        </AddMoreRowButton>
                    </CardsFormContainer>
                )}

                <FloatingActionButton onClick={() => {
                    if (isAddingMode) {
                        handleSaveNewCards();
                    } else if (activeSetId) {
                        setIsAddingMode(true);
                        setNewCards([{ question: "", answer: "" }]);
                    } else {
                        openAddSetModal();
                    }
                }}>
                    {isAddingMode ? <CheckmarkIcon /> : <PlusIcon />}
                </FloatingActionButton>


                {/* EDYCJA POJEDYNCZEJ FISZKI */}
                {isCardEditModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsCardEditModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()}>
                            <Text bold="true" as="h2" text="Edytuj fiszkę" />
                            {errorMessage && <Text color="danger" text={errorMessage} />}
                            
                            <Text text="Pytanie:" style={{ marginTop: '20px' }} />
                            <StyledModalTextArea
                                placeholder="Wpisz pytanie..."
                                value={editQuestion}
                                onChange={(e) => setEditQuestion(e.target.value)}
                            />

                            <Text text="Odpowiedź:" />
                            <StyledModalTextArea
                                placeholder="Wpisz odpowiedź..."
                                value={editAnswer}
                                onChange={(e) => setEditAnswer(e.target.value)}
                            />

                            <SubmitButton text="Zapisz zmiany" color="dark" onClick={handleEditSingleCard} />
                        </StyledPopup>
                    </>
                )}

                {/* DODAWANIE/EDYCJA ZESTAWU */}
                {isSetModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsSetModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()}>
                            <Text bold="true" as="h2" text={editingSetId ? "Edytuj zestaw" : "Nowy zestaw fiszek"} />
                            {errorMessage && <Text color="danger" text={errorMessage} />}
                            {successMessage && <Text style={{ color: 'green' }} text={successMessage} />}

                            <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                                <Input
                                    autoFocus
                                    type="text"
                                    name="setName"
                                    placeholder="Nazwa zestawu"
                                    value={setName}
                                    onChange={(e) => setSetName(e.target.value)}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '30px' }}>
                                <Input
                                    type="text"
                                    name="setTags"
                                    placeholder="Tagi (po przecinku, np. matematyka, sesja)"
                                    value={setTags}
                                    onChange={(e) => setSetTags(e.target.value)}
                                />
                            </div>

                            <SubmitButton text={editingSetId ? "Zapisz zmiany" : "Utwórz pusty zestaw"} color="dark" onClick={handleSaveSet} />
                        </StyledPopup>
                    </>
                )}
            </StyledContainer>
        </Layout>
    );
}

export default FlashcardsPage;



