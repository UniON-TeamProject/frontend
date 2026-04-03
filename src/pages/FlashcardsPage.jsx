import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton';
import Text from '../components/atoms/Text';
import Input from '../components/atoms/Input';
import { 
    addCard, deleteCard, editCard, addFlashcardSet, getAllFlashcardSets, editFlashcardSet, deleteFlashcardSet, 
    resetFlashcardSetProgress 
} from '../api';
import { getToken } from '../token';
import Flashcard from '../components/organisms/Flashcard';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '../components/organisms/Layout';

const StyledContainer = styled.div`
    width: 100%;
    height: 100%;
    min-height: 100vh;
    padding: 20px 40px;
    position: relative;
    background-color: transparent; 
`;

const StyledUserHeader = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    min-height: 60px;
`;

const StyledSearchInput = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    background-color: ${({ theme }) => theme.colors?.white };
    border: 1px solid ${({ theme }) => theme.colors?.darkGrey };
    border-radius: 8px;
    padding: 6px 12px;
    gap: 8px;
    transition: border-color 0.2s;
    
    &:focus-within {
        border-color: ${({ theme }) => theme.colors?.secondary };
    }
    
    > input {
        border: none;
        background: transparent;
        outline: none;
        color: ${({ theme }) => theme.colors?.text };
        font-size: 0.95rem;
        width: 180px;
        
        &::placeholder {
            color: ${({ theme }) => theme.colors?.darkGrey };
        }
    }
    
    > svg {
        color: ${({ theme }) => theme.colors?.darkGrey };
        flex-shrink: 0;
    }
`;

const StyledSearchDropdown = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    width: 360px;
    background: ${({ theme }) => theme.colors?.white };
    border: 1px solid ${({ theme }) => theme.colors?.darkGrey };
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    z-index: 200;
    max-height: 420px;
    overflow-y: auto;
    padding: 6px 0;
`;

const StyledSearchSectionTitle = styled.div`
    font-size: 0.7rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.textLight };
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
        background: ${({ theme }) => theme.colors?.lightGrey };
    }
    
    > svg {
        flex-shrink: 0;
        color: ${({ theme }) => theme.colors?.textLight };
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
    color: ${({ theme }) => theme.colors?.text };
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const StyledSearchResultPath = styled.span`
    font-size: 0.72rem;
    color: ${({ theme }) => theme.colors?.textLight };
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const StyledSearchEmpty = styled.div`
    padding: 16px 14px;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors?.textLight };
    text-align: center;
`;

const StyledSearchDivider = styled.div`
    height: 1px;
    background: ${({ theme }) => theme.colors?.lightGrey };
    margin: 4px 0;
`;

const StyledName = styled.h2`
    color: ${({ theme }) => theme.colors?.text };
    font-size: 2.5rem;
    margin: 0;
    cursor: default;
    @media(max-width:768px){
        font-size: 2rem;
    }
`;

const BackButton = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors?.darkGrey };
    transition: color 0.2s;
    
    &:hover {
        color: ${({ theme }) => theme.colors?.text };
    }
    
    > svg {
        margin-right: 8px;
    }
`;

const ContentContainer = styled.div`
    width: 100%; 
    padding: 20px 0 120px 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, 400px);
    gap: 30px;
    justify-content: center;
`;

const StartLearningButton = styled.button`
    background-color: ${({ theme }) => theme.colors?.secondary };
    color: ${({ theme }) => theme.colors?.white };
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
    color: ${({ theme }) => theme.colors?.black };
`;

const StyledItemHeaderWrapper = styled.div`
    text-align: center;
    word-wrap: break-word;
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
    color: ${({ theme }) => theme.colors?.text };
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors?.lightGrey };
    }
    
    svg {
        width: 18px;
        height: 18px;
        color: ${({ theme }) => theme.colors?.darkGrey };
    }
`;

const StyledItemOptions = styled.div`
    position: absolute;
    top: 45px; 
    right: 10px; 
    background: white;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    padding: 10px;
    z-index: 20;
    width: 260px; 
    display: flex;
    flex-direction: column;
    text-align: left;
    cursor: default;

    > input {
        padding: 8px 12px;
        margin: 0 10px 15px 10px;
        width: calc(100% - 20px);
        border-radius: 8px;
        border: 1px solid transparent;
        font-weight: 700;
        font-family: inherit;
        font-size: 0.95rem;
        color: ${({ theme }) => theme.colors?.text };
        background-color: ${({ theme }) => theme.colors?.lightGrey };
        outline: none;
        transition: border-color 0.2s;
        
        &:focus {
            border-color: ${({ theme }) => theme.colors?.secondary };
        }
    }
`;

const StyledTagInput = styled.input`
    padding: 4px 10px;
    border-radius: 8px;
    color: white;
    border: none;
    width: 90px;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: inherit;
    background-color: ${({ theme }) => theme.colors?.secondary };
    &:focus { outline: none; box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }
`;

const StyledAddTagButton = styled.div`
    padding: 4px 12px;
    background-color: transparent;
    border: 1px dashed #ccc;
    border-radius: 8px;
    color: #666;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover { 
        background-color: #f4f4f4; 
        color: #333;
        border-color: #333;
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
    color: #333;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    
    &.danger { color: #e74c3c; }
    &:hover { background-color: #f9f9f9; }

    svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }
`;

const DropdownSectionLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 700;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    margin-top: 5px;
`;

const TagsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
`;

const StyledTag = styled.div`
    padding: 2px 10px;
    margin: 3px;
    background-color: ${({ theme, $inactive }) => $inactive ? theme.colors?.darkGrey : theme.colors?.secondary};
    border-radius: 10px;
    color: ${({ theme }) => theme.colors?.white };
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
    border: 2px dashed ${({ theme }) => theme.colors?.darkGrey };
    border-radius: 10px;
    padding: 15px 40px;
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text };
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.5 : 1};
    transition: all 0.2s;
    
    &:hover {
        background: ${({ theme, disabled }) => disabled ? 'transparent' : theme.colors?.lightGrey };
    }
`;

const FloatingActionButton = styled.button`
    position: fixed;
    bottom: 40px;
    right: 40px;
    width: 70px;
    height: 70px;
    background-color: ${({ theme }) => theme.colors?.white };
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
        color: ${({ theme }) => theme.colors?.secondary };
    }
`;

const StyledPopup = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    min-height: 250px;
    padding: 50px;
    border-radius: 25px;
    background-color: ${({ theme }) => theme.colors?.white };
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
    color: ${({ theme }) => theme.colors?.text };
    opacity: 0.5;
`;

const StyledModalTextArea = styled.textarea`
    width: 100%;
    padding: 15px;
    margin: 10px 0 20px 0;
    border: 1px solid ${({ theme }) => theme.colors?.darkGrey };
    border-radius: 5px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 100px;
    background-color: ${({ theme }) => theme.colors?.lightGrey };
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors?.secondary };
    }
`;

const SetHeaderControls = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
`;

const ActionBanner = styled.div`
    background-color: ${({ theme }) => theme.colors?.lightGrey };
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 12px 25px;
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text };
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover { background-color: ${({ theme }) => theme.colors?.darkGrey }; color: ${({ theme }) => theme.colors?.white }; }
`;

const StyledTabs = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 2px solid ${({ theme }) => theme.colors?.darkGrey };
    margin-bottom: 30px;
    width: 100%;
`;

const StyledTab = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ $active, theme }) => $active ? theme.colors?.secondary  : theme.colors?.textLight };
    border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.colors?.secondary : 'transparent'};
    margin-bottom: -2px;
    transition: color 0.15s, border-color 0.15s;
    
    &:hover {
        color: ${({ $active, theme }) => $active ? theme.colors?.secondary : theme.colors?.text };
    }
`;

const SortSelectContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: -5px;
`;

const SortSelect = styled.select`
    padding: 7px 59px 7px 12px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors?.darkGrey };
    background-color: white;
    font-family: inherit;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors?.darkGrey };
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
`;

const ModalButton = styled.button`
    background-color: ${(props) => props.$danger ? '#e74c3c' : '#eee'};
    color: ${(props) => props.$danger ? 'white' : '#333'};
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

const FlashcardsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setId } = useParams();

    const isTrashView = location.pathname.includes('trash');

    const [activeSetId, setActiveSetId] = useState(null);

    const [editingName, setEditingName] = useState("");
    const [isAddingItemTag, setIsAddingItemTag] = useState(false);
    const [newItemTag, setNewItemTag] = useState("");

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
    const hasEmptyCard = newCards.some(card => card.question.trim() === "" && card.answer.trim() === "");

    const [setSortOption, setSetSortOption] = useState("oldest");
    const [cardSortOption, setCardSortOption] = useState("oldest");

    const [isExitAddModeModalOpen, setIsExitAddModeModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [globalSearchResults, setGlobalSearchResults] = useState({ sets: [], cards: [] });
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const [setToDelete, setSetToDelete] = useState(null);

    const fetchData = async () => {
        setErrorMessage("");
        
        if (isTrashView) {
            setSets([]);
            return;
        }

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
    }, [isTrashView]);

    useEffect(() => {
        if (setId && sets.length > 0 && !isTrashView) {
            const setToOpen = sets.find(set => set.id === parseInt(setId));
            if (setToOpen) {
                setActiveSetId(setToOpen.id);
            }
        } else if (!setId) {
            setActiveSetId(null);
            setIsLearningMenuOpen(false);
            setIsAddingMode(false);
        }
    }, [setId, sets, isTrashView]);

    const currentSet = sets.find(s => s.id === activeSetId);

    useEffect(() => {
        const q = searchQuery.trim();
        if (q.length < 2) {
            setGlobalSearchResults({ sets: [], cards: [] });
            return;
        }
        
        setIsSearchLoading(true);
        const timer = setTimeout(() => {
            const lower = q.toLowerCase();
            
            let matchedSets = [];
            let matchedCards = [];

            sets.forEach(set => {
                if (set.name.toLowerCase().includes(lower)) {
                    matchedSets.push(set);
                }
                
                if (set.cards && Array.isArray(set.cards)) {
                    set.cards.forEach(card => {
                        const textFront = (card.contentFirstSide || card.question || "").toLowerCase();
                        
                        if (textFront.includes(lower)) {
                            matchedCards.push({
                                ...card,
                                setName: set.name,
                                setId: set.id
                            });
                        }
                    });
                }
            });

            setGlobalSearchResults({ sets: matchedSets, cards: matchedCards });
            setIsSearchLoading(false);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchQuery, sets]); 

    const getSortedSets = () => {
        const sorted = [...sets];
        if (setSortOption === "oldest") {
            sorted.sort((a, b) => a.id - b.id);
        } else if (setSortOption === "newest") {
            sorted.sort((a, b) => b.id - a.id);
        } else if (setSortOption === "alphabetical") {
            sorted.sort((a, b) => {
                const textA = (a.name || "").toLowerCase();
                const textB = (b.name || "").toLowerCase();
                return textA.localeCompare(textB);
            });
        }
        return sorted;
    };

    const getSortedCards = () => {
        if (!currentSet || !currentSet.cards) return [];
        const sorted = [...currentSet.cards];
        
        if (cardSortOption === "oldest") {
            sorted.sort((a, b) => a.id - b.id);
        } else if (cardSortOption === "newest") {
            sorted.sort((a, b) => b.id - a.id);
        } else if (cardSortOption === "alphabetical") {
            sorted.sort((a, b) => {
                const textA = (a.contentFirstSide || a.question || "").toLowerCase();
                const textB = (b.contentFirstSide || b.question || "").toLowerCase();
                return textA.localeCompare(textB);
            });
        }
        return sorted;
    };

    const sortedSets = getSortedSets();
    const sortedCards = getSortedCards();

    // DODAWANIE FISZEK
    const updateNewCard = (index, field, value) => {
        const updated = [...newCards];
        updated[index][field] = value;
        setNewCards(updated);
    };

    const handleSaveNewCards = async () => {
        setErrorMessage("");
        let addedCount = 0;

        const inheritedTags = currentSet?.tags ? [...currentSet.tags] : [];

        for (const card of newCards) {
            if (card.question.trim() && card.answer.trim()) {
                const res = await addCard(card.question, card.answer, parseInt(activeSetId), inheritedTags);
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

        const currentCardData = currentSet.cards.find(c => c.id === editingCardId);
        const existingTags = currentCardData ? (currentCardData.tags || []) : [];

        const res = await editCard(editingCardId, editQuestion, editAnswer, parseInt(activeSetId), existingTags);
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

    const handleInlineCardTagAdd = async (card, tagToAdd) => {
        if (card.tags?.includes(tagToAdd)) return; 
        const updatedTags = [...(card.tags || []), tagToAdd];
        const res = await editCard(card.id, card.contentFirstSide || card.question, card.contentFlipSide || card.answer, parseInt(activeSetId), updatedTags);
        if (!res.errorCode) fetchData();
    };

    const handleInlineCardTagRemove = async (card, tagToRemove) => {
        const updatedTags = (card.tags || []).filter(t => t !== tagToRemove);
        const res = await editCard(card.id, card.contentFirstSide || card.question, card.contentFlipSide || card.answer, parseInt(activeSetId), updatedTags);
        if (!res.errorCode) fetchData();
    };

    const handleRenameSetInline = async (set, newName) => {
        if (!newName.trim() || newName === set.name) return;
        const res = await editFlashcardSet(set.id, newName, set.tags || []);
        if (!res.errorCode) fetchData();
        else setErrorMessage(res.message);
    };

    const handleInlineSetTagAdd = async (set, tagToAdd) => {
        if (set.tags?.includes(tagToAdd)) return; 
        const updatedTags = [...(set.tags || []), tagToAdd];
        const res = await editFlashcardSet(set.id, set.name, updatedTags);
        if (!res.errorCode) fetchData();
    };

    const handleInlineSetTagRemove = async (set, tagToRemove) => {
        const updatedTags = (set.tags || []).filter(t => t !== tagToRemove);
        const res = await editFlashcardSet(set.id, set.name, updatedTags);
        if (!res.errorCode) fetchData();
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

    const confirmDeleteSet = (id) => {
        setSetToDelete(id);
        setActiveMenuId(null);
    };

    const executeDeleteSet = async () => {
        if (!setToDelete) return;
        const res = await deleteFlashcardSet(setToDelete); 
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            setErrorMessage(res.message);
        } else {
            fetchData();
        }
        setSetToDelete(null);
    };

    const handleSaveNewSet = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!setName.trim()) {
            setErrorMessage("Nazwa zestawu jest wymagana!");
            return;
        }

        const tagsArray = setTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        const res = await addFlashcardSet(setName, tagsArray, "/");

        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(res.message);
        } else {
            setSuccessMessage("Zestaw utworzony!");
            fetchData();
            setTimeout(() => {
                setIsSetModalOpen(false);
                setSuccessMessage("");
            }, 1000);
        }
    };

    const handleStartNewFastLearning = async (id) => {
        setErrorMessage("");
        
        const res = await resetFlashcardSetProgress(id);
        
        if (res && res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") {
                navigate("/", { replace: true });
            } else {
                setErrorMessage(res.message);
            }
            return;
        }

        navigate(`/learning/fast/${id}`);
    };


    return (
        <Layout>
            <StyledContainer onClick={() => {
                setActiveMenuId(null);
                setIsSearchFocused(false);
            }}>
                <StyledUserHeader>
                    {!activeSetId ? (
                        <StyledName>Nauka</StyledName>
                    ) : (
                        <BackButton 
                            style={{ fontSize: '1.1rem', fontWeight: '600' }}
                            onClick={() => {
                                if (isAddingMode) {
                                    const hasChanges = newCards.some(card => card.question.trim() !== "" || card.answer.trim() !== "");
                                    if (hasChanges) {
                                        setIsExitAddModeModalOpen(true);
                                    } else {
                                        setIsAddingMode(false);
                                    }
                                } else {
                                    navigate('/learning');
                                }
                            }}
                        >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                            </svg>
                            {isAddingMode ? "Wróć do zestawu" : "Powrót do zestawów"}
                        </BackButton>
                    )}
                    
                    {/* WYSZUKIWARKA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                        <StyledSearchInput onClick={(e) => e.stopPropagation()}>
                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                            </svg>
                            <input
                                placeholder="Szukaj wszędzie..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            />
                            
                            {isSearchFocused && searchQuery.trim().length >= 2 && (
                                <StyledSearchDropdown>
                                    {isSearchLoading ? (
                                        <StyledSearchEmpty>Szukam...</StyledSearchEmpty>
                                    ) : globalSearchResults.sets.length === 0 && globalSearchResults.cards.length === 0 ? (
                                        <StyledSearchEmpty>Brak wyników dla „{searchQuery}”</StyledSearchEmpty>
                                    ) : (
                                        <>
                                            {/* Wyniki dla ZESTAWÓW */}
                                            {globalSearchResults.sets.length > 0 && (
                                                <>
                                                    <StyledSearchSectionTitle>Zestawy</StyledSearchSectionTitle>
                                                    {globalSearchResults.sets.map(s => (
                                                        <StyledSearchResultItem key={`set-${s.id}`} onClick={() => {
                                                            setSearchQuery("");
                                                            setIsSearchFocused(false);
                                                            navigate(`/learning/set/${s.id}`);
                                                        }}>
                                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                                                                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                                                                <line x1="4" y1="10" x2="20" y2="10"></line>
                                                            </svg>
                                                            <StyledSearchResultInfo>
                                                                <StyledSearchResultName>{s.name}</StyledSearchResultName>
                                                            </StyledSearchResultInfo>
                                                        </StyledSearchResultItem>
                                                    ))}
                                                </>
                                            )}

                                            {globalSearchResults.sets.length > 0 && globalSearchResults.cards.length > 0 && (
                                                <StyledSearchDivider />
                                            )}

                                            {/* Wyniki dla FISZEK */}
                                            {globalSearchResults.cards.length > 0 && (
                                                <>
                                                    <StyledSearchSectionTitle>Fiszki</StyledSearchSectionTitle>
                                                    {globalSearchResults.cards.map(c => {
                                                        const textFront = c.contentFirstSide || c.question || "";
                                                        return (
                                                            <StyledSearchResultItem key={`card-${c.id}`} onClick={() => {
                                                                setSearchQuery("");
                                                                setIsSearchFocused(false);
                                                                navigate(`/learning/set/${c.setId}`);
                                                            }}>
                                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                    <path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>
                                                                </svg>
                                                                <StyledSearchResultInfo>
                                                                    <StyledSearchResultName>{textFront}</StyledSearchResultName>
                                                                    <StyledSearchResultPath>Zestaw: {c.setName}</StyledSearchResultPath>
                                                                </StyledSearchResultInfo>
                                                            </StyledSearchResultItem>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </>
                                    )}
                                </StyledSearchDropdown>
                            )}
                        </StyledSearchInput>
                    </div>

                </StyledUserHeader>

                {/* ZAKŁADKI U GÓRY */}
                {!activeSetId && (
                    <StyledTabs>
                        <StyledTab $active={!isTrashView} onClick={() => navigate("/learning")}>
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
                            </svg>
                            Moje zestawy fiszek
                        </StyledTab>
                        <StyledTab $active={isTrashView} onClick={() => navigate("/learning/trash")}>
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                            </svg>
                            Kosz
                        </StyledTab>

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {sets.length > 0 && !isTrashView && (
                                <SortSelectContainer style={{ marginLeft: 0 }}>
                                    <Text text="Sortuj:" style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }} />
                                    <SortSelect value={setSortOption} onChange={e => setSetSortOption(e.target.value)}>
                                        <option value="oldest">Od najstarszych</option>
                                        <option value="newest">Od najnowszych</option>
                                        <option value="alphabetical">Alfabetycznie (A-Z)</option>
                                    </SortSelect>
                                </SortSelectContainer>
                            )}
                        </div>
                    </StyledTabs>
                )}

                {/* NAGŁÓWEK WIDOKU ZESTAWU */}
                {activeSetId && (
                    <>
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

                        {!isAddingMode && !isTrashView && (
                            <SetHeaderControls>
                                <ActionBanner onClick={() => navigate(`/learning/fast/${currentSet?.id}`)}>
                                    Wznów ostatnią sesję (szybka nauka)
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
                                            
                                            <StyledItemOption onClick={() => handleStartNewFastLearning(currentSet?.id)}>
                                                Szybka nauka
                                            </StyledItemOption>
                                            <StyledItemOption onClick={() => navigate(`/learning/fsrs/${currentSet?.id}`)}>
                                                Trwała nauka (FSRS)
                                            </StyledItemOption>
                                        </StyledItemOptions>
                                    )}
                                </div>

                                {currentSet?.cards && currentSet.cards.length > 0 && (
                                    <SortSelectContainer style={{ marginLeft: 'auto' }}>
                                        <Text text="Sortuj:" style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }} />
                                        <SortSelect value={cardSortOption} onChange={e => setCardSortOption(e.target.value)}>
                                            <option value="oldest">Od najstarszych</option>
                                            <option value="newest">Od najnowszych</option>
                                            <option value="alphabetical">Alfabetycznie (A-Z)</option>
                                        </SortSelect>
                                    </SortSelectContainer>
                                )}
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
                                    {isTrashView ? (
                                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                                    ) : (
                                        <>
                                            <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4z" />
                                        </>
                                    )}
                                </svg>
                                <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                                    {isTrashView ? "Kosz jest pusty." : "Brak zestawów. Utwórz swój pierwszy!"}
                                </p>
                            </EmptyStateContainer>
                        ) : (
                            sortedSets.map((set) => (
                                <SetItemWrapper 
                                    key={set.id} 
                                    $disabled={isTrashView}
                                    onClick={() => {
                                        if (!isTrashView) navigate(`/learning/set/${set.id}`);
                                    }}
                                >
                                    <SetIconContainer>
                                        <StackedCardsIcon />
                                    </SetIconContainer>
                                    <StyledItemHeaderWrapper>
                                        <Text as="h4" bold="true" text={set.name} style={{ marginBottom: '10px' }} />
                        
                                        <StyledItemHeader onClick={(e) => {
                                            e.stopPropagation();
                                            if (activeMenuId !== set.id) {
                                                setIsAddingItemTag(false);
                                                setNewItemTag('');
                                            }
                                            setActiveMenuId(activeMenuId === set.id ? null : set.id);
                                        }}>
                                            <EllipsisIcon />
                                            
                                            {activeMenuId === set.id && (
                                                <StyledItemOptions onClick={e => e.stopPropagation()}>
                                                    <div style={{ padding: '0 10px' }}>
                                                        <DropdownSectionLabel>Nazwa</DropdownSectionLabel>
                                                    </div>
                                                    <input
                                                        autoFocus
                                                        defaultValue={set.name}
                                                        maxLength={50}
                                                        onBlur={(e) => {
                                                            const newName = e.target.value;
                                                            if (newName.trim() && newName.trim() !== set.name) {
                                                                handleRenameSetInline(set, newName.trim());
                                                            }
                                                        }}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                const newName = e.target.value;
                                                                if (newName.trim() && newName.trim() !== set.name) {
                                                                    handleRenameSetInline(set, newName.trim());
                                                                }
                                                                setActiveMenuId(null);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setActiveMenuId(null);
                                                            }
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                    />

                                                    <div style={{ padding: '0 12px' }}>
                                                        <DropdownSectionLabel>Tagi</DropdownSectionLabel>
                                                        <TagsContainer style={{ justifyContent: 'flex-start', margin: '0 0 10px 0' }}>
                                                            {set.tags?.map((tag, idx) => (
                                                                <StyledTag key={idx}>
                                                                    {tag}
                                                                    <div onClick={(e) => { e.stopPropagation(); handleInlineSetTagRemove(set, tag); }}>x</div>
                                                                </StyledTag>
                                                            ))}
                                                            
                                                            {isAddingItemTag ? (
                                                                <StyledTagInput
                                                                    autoFocus
                                                                    value={newItemTag}
                                                                    onChange={e => setNewItemTag(e.target.value)}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter' && newItemTag.trim()) {
                                                                            handleInlineSetTagAdd(set, newItemTag.trim());
                                                                            setNewItemTag('');
                                                                            setIsAddingItemTag(false);
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setIsAddingItemTag(false);
                                                                            setNewItemTag('');
                                                                        }
                                                                    }}
                                                                    onBlur={() => { setIsAddingItemTag(false); setNewItemTag(''); }}
                                                                    onClick={e => e.stopPropagation()}
                                                                />
                                                            ) : (
                                                                <StyledAddTagButton onClick={(e) => { e.stopPropagation(); setIsAddingItemTag(true); }}>
                                                                    + Dodaj
                                                                </StyledAddTagButton>
                                                            )}
                                                        </TagsContainer>
                                                    </div>

                                                    <div style={{ height: '1px', background: '#eee', margin: '5px 0' }}></div>

                                                    <StyledItemOption className="danger" onClick={(e) => { e.stopPropagation(); confirmDeleteSet(set.id); }}>
                                                        <svg fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" /></svg>
                                                        Usuń zestaw
                                                    </StyledItemOption>
                                                </StyledItemOptions>
                                            )}
                                        </StyledItemHeader>
                                    </StyledItemHeaderWrapper>
                                    
                                    {set.tags && set.tags.length > 0 && (
                                        <TagsContainer style={{ marginTop: 'auto', paddingTop: '10px' }}>
                                            {set.tags.map((tag, i) => (
                                                <StyledTag key={i} $inactive>{tag}</StyledTag>
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
                            sortedCards.map((card) => (
                                <Flashcard
                                    key={card.id}
                                    card={card}
                                    question={card.contentFirstSide || card.question}
                                    answer={card.contentFlipSide || card.answer}
                                    onEdit={() => openEditCardModal(card)}
                                    onDelete={() => handleDeleteCard(card.id)}
                                    onTagAdd={handleInlineCardTagAdd}
                                    onTagRemove={handleInlineCardTagRemove}
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
                                        maxLength={1020}
                                        placeholder="Wprowadź pytanie..."
                                        value={card.question}
                                        onChange={(e) => updateNewCard(index, 'question', e.target.value)}
                                    />
                                </CardInputSide>
                                <CardInputSide>
                                    <SideLabel>Tył:</SideLabel>
                                    <StyledCardTextarea
                                        maxLength={1020}
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

                {!isTrashView && (
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
                )}


                {/* EDYCJA POJEDYNCZEJ FISZKI */}
                {isCardEditModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsCardEditModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()}>
                            <Text bold="true" as="h2" text="Edytuj fiszkę" />
                            {errorMessage && <Text color="danger" text={errorMessage} />}
                            
                            <Text text="Pytanie:" style={{ marginTop: '20px' }} />
                            <StyledModalTextArea
                                maxLength={1020}
                                placeholder="Wpisz pytanie..."
                                value={editQuestion}
                                onChange={(e) => setEditQuestion(e.target.value)}
                            />

                            <Text text="Odpowiedź:" />
                            <StyledModalTextArea
                                maxLength={1020}
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
                                    onChange={(e) => {
                                        if (e.target.value.length <= 50) {
                                            setSetName(e.target.value);
                                        }
                                    }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '30px' }}>
                                <Input
                                    type="text"
                                    name="setTags"
                                    placeholder="Tagi (po przecinku)"
                                    value={setTags}
                                    onChange={(e) => setSetTags(e.target.value)}
                                />
                            </div>

                            <SubmitButton text="Utwórz zestaw" color="dark" onClick={handleSaveNewSet} />
                        </StyledPopup>
                    </>
                )}

                {/* MODAL WYJŚCIA Z TRYBU DODAWANIA FISZEK */}
                {isExitAddModeModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsExitAddModeModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <Text bold="true" as="h2" text="Czy na pewno chcesz wyjść?" />
                            <Text text="Wprowadzone zmiany zostaną bezpowrotnie utracone." style={{ margin: '20px 0 30px 0', color: '#666' }} />

                            <div style={{ display: "flex", justifyContent: 'center', gap: "15px" }}>
                                <ModalButton type="button" $danger onClick={() => {
                                    setIsExitAddModeModalOpen(false);
                                    setIsAddingMode(false);
                                    setNewCards([{ question: "", answer: "" }]);
                                }}>
                                    Wyjdź bez zapisywania
                                </ModalButton>
                                <ModalButton type="button" onClick={() => setIsExitAddModeModalOpen(false)}>
                                    Zostań i dokończ
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

                {/* MODAL USUWANIA ZESTAWU */}
                {setToDelete && (
                    <>
                        <ModalOverlay onClick={() => setSetToDelete(null)} />
                        <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <Text bold="true" as="h2" text="Usuń zestaw" />
                            <Text 
                                text="Czy na pewno chcesz usunąć ten zestaw? Tej operacji nie można cofnąć." 
                                style={{ margin: '20px 0 30px 0', color: '#666' }} 
                            />

                            <div style={{ display: "flex", justifyContent: 'center', gap: "15px" }}>
                                <ModalButton type="button" $danger onClick={executeDeleteSet}>
                                    Usuń
                                </ModalButton>
                                <ModalButton type="button" onClick={() => setSetToDelete(null)}>
                                    Anuluj
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

            </StyledContainer>
        </Layout>
    );
}

export default FlashcardsPage;