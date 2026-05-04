import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton';
import Text from '../components/atoms/Text';
import Input from '../components/atoms/Input';
import { 
    addCard, deleteCard, editCard, addFlashcardSet, getAllFlashcardSets, editFlashcardSet, deleteFlashcardSet, 
    resetFlashcardSetProgress,
    getAllDeletedFlashcardSets, restoreFlashcardSet, hardDeleteFlashcardSet, clearFlashcardSetsTrash,
    addFlashcardTag, removeFlashcardTag,
    addListOfCardsToSet,
    getFlashcardSetStats,
    getFlashcardSet,
    getSocialGroup
} from '../api';
import { getToken } from '../token';
import Flashcard from '../components/organisms/Flashcard';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '../components/organisms/Layout';
import FlashcardEditor from '../components/editor/FlashcardEditor';

const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

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
    background-color: #f4f5f7;
    border: 1px solid transparent;
    border-radius: 20px;
    padding: 8px 16px;
    gap: 8px;
    transition: all 0.2s;

    border-color: ${({ theme }) => theme.colors?.secondary };
    
    &:focus-within {
        background-color: ${({ theme }) => theme.colors?.white || '#fff'};
        border-color: ${({ theme }) => theme.colors?.secondary || '#00b894'};
    }
    
    > input {
        border: none;
        background: transparent;
        outline: none;
        color: ${({ theme }) => theme.colors?.text};
        font-size: 0.95rem;
        width: 200px;
        
        &::placeholder {
            color: #a0a0a0;
        }
    }
    
    > svg {
        color: #a0a0a0;
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
    grid-template-columns: repeat(auto-fit, 350px);
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
    z-index: ${({ $isActive }) => $isActive ? 50 : 1};
`;

const SetIconContainer = styled.div`
    position: relative;
    width: 140px;
    height: 100px;
    margin: 0 auto 10px auto;
    color: ${({ theme }) => theme.colors?.black };
`;

const StyledItemHeaderWrapper = styled.div`
    text-align: center;
    word-wrap: break-word;
    word-break: break-word;
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
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

const StyledToolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 1px solid #d1d5db;
    padding-bottom: 15px;
    flex-wrap: wrap;
    gap: 15px;
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

    white-space: nowrap; 
    display: inline-flex;
    
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
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 10px;
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

const StyledTabsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 25px;
`;

const StyledTab = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ $active, theme }) => $active ? (theme.colors?.secondary || '#00b894') : '#6c757d'};
    transition: color 0.15s;
    
    &:hover {
        color: ${({ theme }) => theme.colors?.secondary || '#00b894'};
    }

    > svg {
        width: 16px;
        height: 16px;
    }
`;

const SortSelectContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const SortSelect = styled.select`
    appearance: none;
    padding: 8px 32px 8px 16px;
    border-radius: 8px;
    border: 1px solid #ced4da;
    background-color: white;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
    outline: none;
    cursor: pointer;
    
    &:hover {
        background-color: #f8f9fa;
    }
`;

const SortIconWrapper = styled.div`
    position: absolute;
    right: 12px;
    pointer-events: none;
    color: #495057;
    display: flex;
    align-items: center;
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

const ToolbarActions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ToolbarButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: inherit;
    cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
    opacity: ${({ disabled }) => disabled ? 0.8 : 1};
    transition: all 0.2s;
    
    &.primary {
        background-color: ${({ theme }) => theme.colors?.secondary || '#00b894'};
        color: white;
        border: 1px solid ${({ theme }) => theme.colors?.secondary || '#00b894'};
    }
    
    &.outline {
        background-color: white;
        color: #495057;
        border: 1px solid #ced4da;
    }
`;

const FilterContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const FilterDropdown = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0; 
    background: white;
    border: 1px solid #ced4da;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    padding: 15px;
    z-index: 100;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: default;
`;

const FilterTag = styled.div`
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    background-color: ${({ $active, theme }) => $active ? (theme.colors?.secondary || '#00b894') : '#f4f5f7'};
    color: ${({ $active }) => $active ? 'white' : '#495057'};
    transition: all 0.2s;

    &:hover {
        background-color: ${({ $active, theme }) => $active ? (theme.colors?.secondary || '#00b894') : '#e2e6ea'};
        opacity: ${({ $active }) => $active ? 0.8 : 1};
    }
`;

const ActiveFilterBadge = styled.span`
    background-color: ${({ theme }) => theme.colors?.secondary || '#00b894'};
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    margin-left: 6px;
`;

const HelpIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background-color: #e2e6ea;
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 10px;

    &:hover {
        background-color: #ced4da;
        color: #343a40;
        transform: scale(1.1);
    }
`;

const ModeCard = styled.div`
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    text-align: left;

    h3 {
        margin-top: 0;
        margin-bottom: 8px;
        color: #212529;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.1rem;
    }

    p {
        margin: 0;
        color: #495057;
        font-size: 0.95rem;
        line-height: 1.5;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    
    &:hover {
        color: #333;
        transform: scale(1.1);
    }
    
    svg {
        width: 24px;
        height: 24px;
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

    const socialId = new URLSearchParams(location.search).get('socialId');

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

    const [setSortOption, setSetSortOption] = useState(() => {
        return localStorage.getItem("flashcardSetsSortOption") || "oldest";
    });

    const [cardSortOption, setCardSortOption] = useState(() => {
        return localStorage.getItem("flashcardsSortOption") || "oldest";
    });

    //zapisywanie w localstorage ostatniego wyboru sortowania
    useEffect(() => {
        localStorage.setItem("flashcardSetsSortOption", setSortOption);
    }, [setSortOption]);
    useEffect(() => {
        localStorage.setItem("flashcardsSortOption", cardSortOption);
    }, [cardSortOption]);

    const [isExitAddModeModalOpen, setIsExitAddModeModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [globalSearchResults, setGlobalSearchResults] = useState({ sets: [], cards: [] });
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const [setToDelete, setSetToDelete] = useState(null);
    const [cardToDelete, setCardToDelete] = useState(null);

    const [isConfirmingTrashClear, setIsConfirmingTrashClear] = useState(false);

    const [selectedTagsFilter, setSelectedTagsFilter] = useState([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    const [duplicateWarning, setDuplicateWarning] = useState(null);

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    
    // stany dla kopiowania
    const [isBulkCopyModalOpen, setIsBulkCopyModalOpen] = useState(false);
    const [bulkTargetSetId, setBulkTargetSetId] = useState("");
    const [bulkNewSetName, setBulkNewSetName] = useState("");
    const [bulkApplyTags, setBulkApplyTags] = useState(false);

    const [isLearningInfoModalOpen, setIsLearningInfoModalOpen] = useState(false);

    const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState(null); //fast lub fsrs

    const [groupRole, setGroupRole] = useState(null);

    const fetchData = async () => {
        setErrorMessage("");
        
        const setsRes = isTrashView ? await getAllDeletedFlashcardSets() : await getAllFlashcardSets();
        
        let safeSets = [];
        if (!setsRes.errorCode) {
            safeSets = Array.isArray(setsRes.sets) ? [...setsRes.sets] : (Array.isArray(setsRes) ? [...setsRes] : []);
        } else {
            if (setsRes.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            else setErrorMessage(setsRes.message);
        }

        if (setId && !isTrashView) {
            const parsedId = parseInt(setId);
            let targetSet = safeSets.find(s => s.id === parsedId);

            if (!targetSet) {
                const sId = new URLSearchParams(location.search).get('socialId');
                if (sId) {
                    const singleRes = await getFlashcardSet(parsedId, sId);
                    
                    if (!singleRes.errorCode && singleRes.id) {
                        safeSets = [...safeSets, singleRes]; 
                        targetSet = singleRes; 

                        const groupRes = await getSocialGroup(sId);
                        if (!groupRes.errorCode) {
                            setGroupRole(groupRes.userRole);
                        }
                    } else {
                        setErrorMessage(singleRes.message || "Brak dostępu do zestawu grupowego.");
                    }
                }
            }
            else {
                setGroupRole(null);
            }

            if (targetSet) {
                setActiveSetId(targetSet.id);
            } else {
                setActiveSetId(null);
            }
        } else {
            setActiveSetId(null);
            setIsLearningMenuOpen(false);
            setIsAddingMode(false);
        }

        setSets(safeSets);
    };

    useEffect(() => {
        if (!getToken()) { navigate("/", { replace: true }); return; }
        fetchData();
    }, [isTrashView, setId, location.search]);

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

    const isReadOnly = socialId ? (groupRole !== 'ADMIN' && groupRole !== 'EDITOR') : false;

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
        let sorted = [...sets];

        //LOGIKA FILTROWANIA PO TAGACH (zakładamy że zestaw musi mieć WSZYSTKIE wybrane tagi)
        if (selectedTagsFilter.length > 0) {
            sorted = sorted.filter(set =>
                selectedTagsFilter.every(tag => set.tags?.includes(tag))
            );
        }

        //LOGIKA SORTOWANIA
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

    const handleSaveNewCards = async (ignoreDuplicates = false) => {
        setErrorMessage("");
        
        if (!ignoreDuplicates) {
            let duplicates = [];
            
            for (const newCard of newCards) {
                const rawStripped = stripHtml(newCard.question).trim();
                const plainNewQuestion = rawStripped.toLowerCase();
                
                if (!plainNewQuestion) continue;

                sets.forEach(set => {
                    if (set.cards && Array.isArray(set.cards)) {
                        set.cards.forEach(existingCard => {
                            const plainExistingQuestion = stripHtml(existingCard.contentFirstSide || existingCard.question || "").trim().toLowerCase();
                            
                            if (plainNewQuestion === plainExistingQuestion) {
                                duplicates.push({ 
                                    question: rawStripped,
                                    setName: set.name 
                                });
                            }
                        });
                    }
                });
            }

            if (duplicates.length > 0) {
                setDuplicateWarning(duplicates);
                return; 
            }
        }

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
            setSuccessMessage("Zapisano!");
            setDuplicateWarning(null); 
            
            setTimeout(() => {
                fetchData();
                setIsAddingMode(false);
                setNewCards([{ question: "", answer: "" }]);
                setSuccessMessage("");
            }, 1000);
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
            setSuccessMessage("Zapisano!");
            setTimeout(() => {
                fetchData();
                setIsCardEditModalOpen(false);
                setSuccessMessage("");
            }, 1000);
        }
    };

    const confirmDeleteCard = (id) => {
        setCardToDelete(id);
    };

    const executeDeleteCard = async () => {
        if (!cardToDelete) return;
        
        const res = await deleteCard(cardToDelete);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            setErrorMessage(res.message);
        } else {
            fetchData();
        }
        setCardToDelete(null);
    };

    const handleInlineCardTagAdd = async (card, tagToAdd) => {
        if (card.tags?.includes(tagToAdd)) return; 
        
        const res = await addFlashcardTag(card.id, tagToAdd);
        if (!res.errorCode) {
            fetchData();
        } else {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(res.message);
        }
    };

    const handleInlineCardTagRemove = async (card, tagToRemove) => {
        const res = await removeFlashcardTag(card.id, tagToRemove);
        if (!res.errorCode) {
            fetchData();
        } else {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(res.message);
        }
    };

    const handleRenameSetInline = async (set, newName) => {
        if (!newName.trim() || newName === set.name) return;
        const res = await editFlashcardSet(set.id, newName, set.tags || [], socialId);
        if (!res.errorCode) fetchData();
        else setErrorMessage(res.message);
    };

    const handleInlineSetTagAdd = async (set, tagToAdd) => {
        if (set.tags?.includes(tagToAdd)) return; 
        const updatedTags = [...(set.tags || []), tagToAdd];
        const res = await editFlashcardSet(set.id, set.name, updatedTags, socialId); 
        if (!res.errorCode) fetchData();
    };

    const handleInlineSetTagRemove = async (set, tagToRemove) => {
        const updatedTags = (set.tags || []).filter(t => t !== tagToRemove);
        const res = await editFlashcardSet(set.id, set.name, updatedTags, socialId);
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
        
        const res = isTrashView 
            ? await hardDeleteFlashcardSet(setToDelete) 
            : await deleteFlashcardSet(setToDelete, socialId);
            
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") { navigate("/", { replace: true }); return; }
            setErrorMessage(res.message);
        } else {
            fetchData();
        }
        setSetToDelete(null);
    };

    const handleRestoreSet = async (id) => {
        setErrorMessage("");
        const res = await restoreFlashcardSet(id);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(res.message);
        } else {
            fetchData();
        }
    };

    const handleClearTrash = async () => {
        setErrorMessage("");
        
        const safeSetsForTrash = Array.isArray(sets) ? sets : [];
        const idsToDelete = safeSetsForTrash.map(s => s.id);
        
        if (idsToDelete.length === 0) {
            setIsConfirmingTrashClear(false);
            return;
        }

        const res = await clearFlashcardSetsTrash(idsToDelete);
        
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(res.message);
        } else {
            setIsConfirmingTrashClear(false);
            fetchData();
        }
    };

    const handleSaveNewSet = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!setName.trim()) {
            setErrorMessage("Nazwa zestawu jest wymagana!");
            return;
        }

        const tagsArray = setTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        const res = await addFlashcardSet(setName, tagsArray);

        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            else setErrorMessage(res.message);
        } else {
            setSuccessMessage("Zapisano!");
            setTimeout(() => {
                fetchData();
                setIsSetModalOpen(false);
                setSuccessMessage("");
            }, 1000);
        }
    };

    const handleStartNewFastLearning = (id) => {
        setErrorMessage("");
        navigate(`/learning/fast/${id}`);
    };

    const allAvailableTags = [...new Set(sets.flatMap(set => set.tags || []))].sort();


    const getCardsCountWord = (count) => {
        if (count === 1) return 'fiszka';
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
            return 'fiszki';
        }
        return 'fiszek';
    };

    const toggleCardSelection = (card) => {
        setSelectedCards(prev => {
            const isAlreadySelected = prev.some(c => c.id === card.id);
            if (isAlreadySelected) return prev.filter(c => c.id !== card.id);
            return [...prev, card];
        });
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Czy na pewno chcesz trwale usunąć zaznaczone fiszki (${selectedCards.length})?`)) return;
        
        await Promise.all(selectedCards.map(c => deleteCard(c.id)));
        
        setIsSelectMode(false);
        setSelectedCards([]);
        fetchData();
        setSuccessMessage("Usunięto!");
        setTimeout(() => setSuccessMessage(""), 2000);
    };

    const handleBulkCopy = async () => {
        setErrorMessage("");
        let targetId = bulkTargetSetId;
        let targetTags = [];

        if (!targetId) { setErrorMessage("Wybierz zestaw docelowy"); return; }

        if (targetId === "NEW") {
            if (!bulkNewSetName.trim()) { setErrorMessage("Podaj nazwę nowego zestawu"); return; }
            const res = await addFlashcardSet(bulkNewSetName.trim(), [], "/");
            if (res.errorCode) { setErrorMessage(res.message); return; }
            targetId = res.id;
        } else if (bulkApplyTags) {
            const targetSet = sets.find(s => s.id === parseInt(targetId));
            if (targetSet && targetSet.tags) targetTags = targetSet.tags;
        }

        const cardRequests = selectedCards.map(card => {
            const finalTags = bulkApplyTags ? [...new Set([...(card.tags || []), ...targetTags])] : (card.tags || []);
            return {
                contentFirstSide: card.contentFirstSide || card.question,
                contentFlipSide: card.contentFlipSide || card.answer,
                setId: parseInt(targetId),
                cardTags: finalTags,
                isForced: false
            };
        });

        const res = await addListOfCardsToSet(targetId, cardRequests);
        if (res.errorCode) {
            setErrorMessage(res.message);
        } else {
            setIsBulkCopyModalOpen(false);
            setIsSelectMode(false);
            setSelectedCards([]);
            fetchData();
            setSuccessMessage("Skopiowano pomyślnie!");
            setTimeout(() => setSuccessMessage(""), 2000);
        }
    };

    const handleModeSelection = async (mode) => {
        setIsLearningMenuOpen(false);
        setPendingMode(mode);

        // sprawdzamy po statystykach czy sesja nauki trwa 
        const res = await getFlashcardSetStats(currentSet.id);
        
        // jesli uzytkownik juz cos umie czyli learnedCards > 0, pytamy o reset
        if (!res.errorCode && res.stats > 0) {
            setIsResetConfirmModalOpen(true);
        } else {
            // jesli nie, po prostu wchodzimy do nauki
            goToLearning(mode);
        }
    };

    const goToLearning = (mode) => {
        if (mode === 'fast') {
            navigate(`/learning/fast/${currentSet.id}`);
        } else {
            navigate(`/learning/fsrs/${currentSet.id}`);
        }
    };

    const handleResetAndStart = async () => {
        const res = await resetFlashcardSetProgress(currentSet.id);
        if (!res.errorCode) {
            setIsResetConfirmModalOpen(false);
            goToLearning(pendingMode);
        } else {
            setErrorMessage("Nie udało się zresetować zestawu.");
        }
    };

    return (
        <Layout>
            <StyledContainer onClick={() => {
                setActiveMenuId(null);
                setIsSearchFocused(false);
                setIsFilterMenuOpen(false);
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

                {/* ZAKŁADKI I TOOLBAR U GÓRY */}
                {!activeSetId && (
                    <StyledToolbar>
                        <StyledTabsContainer>
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
                        </StyledTabsContainer>

                        <ToolbarActions>
                            {!isTrashView && (
                                <FilterContainer>
                                    {!isReadOnly && (
                                        <ToolbarButton 
                                            className="outline" 
                                            disabled={!currentSet?.cards || currentSet.cards.length === 0}
                                            onClick={() => { 
                                                if (!currentSet?.cards || currentSet.cards.length === 0) return;
                                                setIsSelectMode(!isSelectMode); 
                                                setSelectedCards([]); 
                                            }}
                                            title={(!currentSet?.cards || currentSet.cards.length === 0) ? "Brak fiszek do zaznaczenia" : ""}
                                        >
                                            <svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14" style={{ opacity: (!currentSet?.cards || currentSet.cards.length === 0) ? 0.5 : 1 }}>
                                                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                                <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                            </svg>
                                            {isSelectMode ? "Anuluj zaznaczanie" : "Zaznacz fiszki"}
                                        </ToolbarButton>
                                    )}

                                    {/* MENU FILTRÓW */}
                                    {isFilterMenuOpen && (
                                        <FilterDropdown onClick={e => e.stopPropagation()}>
                                            <Text bold="true" text="Filtruj po tagach" style={{ fontSize: '0.95rem', margin: '0 0 5px 5px' }} />
                                            
                                            {allAvailableTags.length === 0 ? (
                                                <Text text="Brak tagów w Twoich zestawach." style={{ fontSize: '0.85rem', color: '#888', marginLeft: '5px' }} />
                                            ) : (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {allAvailableTags.map(tag => {
                                                        const isActive = selectedTagsFilter.includes(tag);
                                                        return (
                                                            <FilterTag
                                                                key={tag}
                                                                $active={isActive}
                                                                onClick={() => {
                                                                    if (isActive) {
                                                                        setSelectedTagsFilter(prev => prev.filter(t => t !== tag));
                                                                    } else {
                                                                        setSelectedTagsFilter(prev => [...prev, tag]);
                                                                    }
                                                                }}
                                                            >
                                                                {tag}
                                                            </FilterTag>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {selectedTagsFilter.length > 0 && (
                                                <div 
                                                    style={{ fontSize: '0.8rem', color: '#e74c3c', cursor: 'pointer', marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}
                                                    onClick={() => setSelectedTagsFilter([])}
                                                >
                                                    Wyczyść filtry
                                                </div>
                                            )}
                                        </FilterDropdown>
                                    )}
                                </FilterContainer>
                            )}

                            {sets.length > 0 && !isTrashView && (
                                <SortSelectContainer>
                                    <SortSelect value={setSortOption} onChange={e => setSetSortOption(e.target.value)}>
                                        <option value="oldest">↑ Sortuj: Od najstarszych</option>
                                        <option value="newest">↓ Sortuj: Od najnowszych</option>
                                        <option value="alphabetical">↓ Sortuj: Alfabetycznie (A-Z)</option>
                                    </SortSelect>
                                    <SortIconWrapper>
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                        </svg>
                                    </SortIconWrapper>
                                </SortSelectContainer>
                            )}
                        </ToolbarActions>
                    </StyledToolbar>
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

                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <StartLearningButton onClick={(e) => { e.stopPropagation(); setIsLearningMenuOpen(!isLearningMenuOpen); }}>
                                        Rozpocznij naukę
                                        <svg style={{ marginLeft: '8px' }} width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                        </svg>
                                    </StartLearningButton>

                                    <HelpIcon onClick={(e) => { e.stopPropagation(); setIsLearningInfoModalOpen(true); }} title="Jak działają tryby nauki?">
                                        ?
                                    </HelpIcon>

                                    {isLearningMenuOpen && (
                                        <StyledItemOptions style={{ top: 'calc(100% + 5px)', left: 'auto', right: '0', transform: 'none' }}>
                                            <StyledItemOption onClick={() => handleModeSelection('fast')}>
                                                Szybka nauka
                                            </StyledItemOption>
                                            <StyledItemOption onClick={() => handleModeSelection('fsrs')}>
                                                Trwała nauka
                                            </StyledItemOption>
                                        </StyledItemOptions>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
                                    
                                    <ToolbarButton 
                                        className="outline" 
                                        disabled={!currentSet?.cards || currentSet.cards.length === 0}
                                        onClick={() => { 
                                            if (!currentSet?.cards || currentSet.cards.length === 0) return;
                                            setIsSelectMode(!isSelectMode); 
                                            setSelectedCards([]); 
                                        }}
                                        title={(!currentSet?.cards || currentSet.cards.length === 0) ? "Brak fiszek do zaznaczenia" : ""}
                                    >
                                        <svg fill="currentColor" viewBox="0 0 16 16" width="14" height="14" style={{ opacity: (!currentSet?.cards || currentSet.cards.length === 0) ? 0.5 : 1 }}>
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                        </svg>
                                        {isSelectMode ? "Anuluj zaznaczanie" : "Zaznacz fiszki"}
                                    </ToolbarButton>

                                    {currentSet?.cards && currentSet.cards.length > 0 && (
                                        <SortSelectContainer>
                                            <SortSelect value={cardSortOption} onChange={e => setCardSortOption(e.target.value)}>
                                                <option value="oldest">↑ Sortuj: Od najstarszych</option>
                                                <option value="newest">↓ Sortuj: Od najnowszych</option>
                                                <option value="alphabetical">↓ Sortuj: Alfabetycznie (A-Z)</option>
                                            </SortSelect>
                                            <SortIconWrapper>
                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                                </svg>
                                            </SortIconWrapper>
                                        </SortSelectContainer>
                                    )}
                                </div>
                            </SetHeaderControls>
                        )}
                    </>
                )}

                {errorMessage && !isSetModalOpen && !isCardEditModalOpen && <Text color="danger" text={errorMessage} />}

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
                                    $isActive={activeMenuId === set.id}
                                    onClick={() => {
                                        if (!isTrashView) navigate(`/learning/set/${set.id}`);
                                    }}
                                >
                                    <SetIconContainer>
                                        <StackedCardsIcon />
                                    </SetIconContainer>
                                    <StyledItemHeaderWrapper>
                                        <Text as="h4" bold="true" text={set.name} style={{ marginBottom: '10px' }} />

                                        <Text 
                                            text={`${set.cards?.length || 0} ${getCardsCountWord(set.cards?.length || 0)}`} 
                                            style={{ color: '#888', fontSize: '0.85rem', fontWeight: '500' }} 
                                        />
                                        
                                        {!isReadOnly && (
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
                                                            maxLength={55}
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
                                        )}
                                    </StyledItemHeaderWrapper>
                                    
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
                                    onDelete={() => confirmDeleteCard(card.id)}
                                    onTagAdd={handleInlineCardTagAdd}
                                    onTagRemove={handleInlineCardTagRemove}
                                    
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedCards.some(c => c.id === card.id)}
                                    onToggleSelect={() => toggleCardSelection(card)}
                                    isReadOnly={isReadOnly}
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
                                    <FlashcardEditor 
                                        maxLength={1020}
                                        value={card.question}
                                        placeholder="Wprowadź pytanie lub wpisz /"
                                        onChange={(htmlContent) => updateNewCard(index, 'question', htmlContent)}
                                    />
                                </CardInputSide>
                                <CardInputSide>
                                    <SideLabel>Tył:</SideLabel>
                                    <FlashcardEditor 
                                        maxLength={1020}
                                        value={card.answer}
                                        placeholder="Wprowadź odpowiedź lub wpisz /"
                                        onChange={(htmlContent) => updateNewCard(index, 'answer', htmlContent)}
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

                {!isTrashView && !isReadOnly && (
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
                            <FlashcardEditor
                                maxLength={1020}
                                value={editQuestion}
                                placeholder="Wpisz pytanie..."
                                onChange={(htmlContent) => setEditQuestion(htmlContent)}
                            />

                            <Text text="Odpowiedź:" style={{ marginTop: '20px' }} />
                            <FlashcardEditor
                                maxLength={1020}
                                value={editAnswer}
                                placeholder="Wpisz odpowiedź..."
                                onChange={(htmlContent) => setEditAnswer(htmlContent)}
                            />

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                                <SubmitButton 
                                    text={successMessage ? "✔ Zapisano!" : "Zapisz zmiany"} 
                                    color={successMessage ? "secondary" : "dark"} 
                                    onClick={handleEditSingleCard} 
                                />
                            </div>
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

                            <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                                <Input
                                    autoFocus
                                    type="text"
                                    name="setName"
                                    placeholder="Nazwa zestawu"
                                    value={setName}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 55) {
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

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <SubmitButton 
                                    text={successMessage ? "✔ Zapisano!" : (editingSetId ? "Zapisz zmiany" : "Utwórz zestaw")} 
                                    color={successMessage ? "secondary" : "dark"} 
                                    onClick={handleSaveNewSet} 
                                />
                            </div>
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
                                text="Czy na pewno chcesz usunąć ten zestaw?" 
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

                {/* MODAL OSTRZEGAJĄCY O DUPLIKATACH */}
                {duplicateWarning && (
                    <>
                        <ModalOverlay onClick={() => setDuplicateWarning(null)} />
                        <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <Text bold="true" as="h2" text="Uwaga: Znaleziono duplikaty!" />
                            <Text text="Fiszki z takimi pytaniami już istnieją w Twoich zestawach:" style={{ margin: '15px 0', color: '#666' }} />

                            <div style={{ textAlign: 'left', background: '#f4f5f7', padding: '15px', borderRadius: '10px', maxHeight: '150px', overflowY: 'auto', marginBottom: '25px' }}>
                                {duplicateWarning.map((dup, index) => (
                                    <div key={index} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <strong>{dup.question}</strong> <span style={{ color: '#888' }}>(w: {dup.setName})</span>
                                    </div>
                                ))}
                            </div>

                            <Text text="Czy na pewno chcesz dodać je ponownie?" style={{ marginBottom: '20px', fontWeight: '600' }} />

                            <div style={{ display: "flex", justifyContent: 'center', gap: "15px" }}>
                                <ModalButton type="button" onClick={() => setDuplicateWarning(null)}>
                                    Anuluj
                                </ModalButton>
                                <ModalButton type="button" $danger onClick={() => handleSaveNewCards(true)}>
                                    Zapisz mimo to
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

                {/* PŁYWAJĄCY PASEK ZAZNACZENIA */}
                {isSelectMode && selectedCards.length > 0 && (
                    <div style={{
                        position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                        backgroundColor: 'white', color: 'rgb(112, 122, 115)', padding: '15px 30px',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 1000
                    }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Zaznaczono: {selectedCards.length}</span>
                        <ModalButton style={{ background: '#00b894', color: 'white' }} onClick={() => setIsBulkCopyModalOpen(true)}>Kopiuj do...</ModalButton>
                        <ModalButton $danger onClick={handleBulkDelete}>Usuń</ModalButton>
                        
                        <ModalButton 
                            style={{ background: 'transparent', color: '#ccc', padding: '12px 10px' }} 
                            onClick={() => {
                                setIsSelectMode(false);
                                setSelectedCards([]);
                            }}
                        >
                            Anuluj
                        </ModalButton>
                    </div>
                )}

                {/* MODAL KOPIOWANIA FISZEK */}
                {isBulkCopyModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsBulkCopyModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()}>
                            <Text bold="true" as="h2" text={`Kopiowanie ${selectedCards.length} fiszek`} />
                            {errorMessage && <Text color="danger" text={errorMessage} style={{ marginBottom: '10px' }} />}
                            
                            <Text text="Wybierz zestaw docelowy:" style={{ marginTop: '20px', marginBottom: '10px' }} />
                            <SortSelect 
                                style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc' }}
                                value={bulkTargetSetId} 
                                onChange={e => setBulkTargetSetId(e.target.value)}
                            >
                                <option value="" disabled>-- Wybierz zestaw --</option>
                                <option value="NEW" style={{ fontWeight: 'bold' }}>+ Utwórz nowy zestaw</option>
                                {sets.filter(s => s.id !== activeSetId).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </SortSelect>

                            {bulkTargetSetId === "NEW" && (
                                <Input
                                    autoFocus
                                    placeholder="Nazwa nowego zestawu"
                                    value={bulkNewSetName}
                                    onChange={e => setBulkNewSetName(e.target.value)}
                                    style={{ marginBottom: '20px' }}
                                />
                            )}

                            {bulkTargetSetId && bulkTargetSetId !== "NEW" && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '30px', fontWeight: '500' }}>
                                    <input 
                                        type="checkbox" 
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        checked={bulkApplyTags} 
                                        onChange={(e) => setBulkApplyTags(e.target.checked)} 
                                    />
                                    Dodaj tagi docelowego zestawu jako tagi fiszki
                                </label>
                            )}

                            <div style={{ display: "flex", justifyContent: 'center', gap: "15px", marginTop: '20px' }}>
                                <ModalButton type="button" onClick={handleBulkCopy} style={{ background: '#00b894', color: 'white' }}>
                                    Skopiuj fiszki
                                </ModalButton>
                                <ModalButton type="button" onClick={() => setIsBulkCopyModalOpen(false)}>
                                    Anuluj
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

                {/* MODAL USUWANIA FISZKI */}
                {cardToDelete && (
                    <>
                        <ModalOverlay onClick={() => setCardToDelete(null)} />
                        <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <Text bold="true" as="h2" text="Usuń fiszkę" />
                            <Text 
                                text="Czy na pewno chcesz usunąć tę fiszkę?" 
                                style={{ margin: '20px 0 30px 0', color: '#666' }} 
                            />

                            <div style={{ display: "flex", justifyContent: 'center', gap: "15px" }}>
                                <ModalButton type="button" $danger onClick={executeDeleteCard}>
                                    Usuń
                                </ModalButton>
                                <ModalButton type="button" onClick={() => setCardToDelete(null)}>
                                    Anuluj
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

                {/* PRZYCISK WYCZYSZCZENIA KOSZA */}
                {isTrashView && sets.length > 0 && (
                    <FloatingActionButton 
                        style={{ backgroundColor: '#e74c3c' }} 
                        title="Wyczyść kosz permanentnie" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsConfirmingTrashClear(true);
                        }}
                    >
                        <svg viewBox="0 0 16 16" fill="white" width="32" height="32">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                        </svg>
                    </FloatingActionButton>
                )}

                {/* MODAL POTWIERDZENIA CZYSZCZENIA KOSZA */}
                {isConfirmingTrashClear && (
                    <>
                        <ModalOverlay onClick={() => setIsConfirmingTrashClear(false)} />
                        <StyledPopup onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            <Text bold="true" as="h2" text="Wyczyścić kosz?" />
                            <Text text="Czy na pewno chcesz usunąć wszystkie zestawy wraz z ich fiszkiami z kosza? Tej operacji nie można cofnąć." style={{ margin: '20px 0', color: '#666' }} />
                            
                            <div style={{ display: "flex", justifyContent: 'center', gap: "15px", marginTop: "30px" }}>
                                <ModalButton type="button" $danger onClick={handleClearTrash}>
                                    Wyczyść kosz
                                </ModalButton>
                                <ModalButton type="button" onClick={() => setIsConfirmingTrashClear(false)}>
                                    Anuluj
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

                {/* MODAL INFORMACYJNY O TRYBACH NAUKI */}
                {isLearningInfoModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsLearningInfoModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center', width: '650px' }}>
                            <Text bold="true" as="h2" text="Jak chcesz się uczyć?" style={{ marginBottom: '25px' }} />
                            
                            <ModeCard>
                                <h3>
                                    Szybka nauka
                                </h3>
                                <p>
                                    Idealna przed jutrzejszym kolokwium! Przeglądasz wszystkie fiszki w zestawie jedną po drugiej. Fiszki, których "nie umiesz", będą wracać na koniec kolejki, aż zaliczysz wszystkie.
                                </p>
                            </ModeCard>

                            <ModeCard>
                                <h3>
                                    Trwała nauka (FSRS)
                                </h3>
                                <p>
                                    Zbuduj swoją pamięć! Inteligentny algorytm sam decyduje, kiedy powinieneś powtórzyć daną fiszkę, tuż zanim zdążysz ją zapomnieć. <b>Oceniasz poziom trudności fiszki, a system optymalizuje Twój harmonogram nauki.</b>
                                </p>
                            </ModeCard>

                            <div style={{ display: "flex", justifyContent: 'center', marginTop: "30px" }}>
                                <ModalButton type="button" onClick={() => setIsLearningInfoModalOpen(false)}>
                                    Rozumiem
                                </ModalButton>
                            </div>
                        </StyledPopup>
                    </>
                )}

                {/* RESET SESJI */}
                {isResetConfirmModalOpen && (
                    <>
                        <ModalOverlay onClick={() => setIsResetConfirmModalOpen(false)} />
                        <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                            
                            <CloseButton type="button" onClick={() => setIsResetConfirmModalOpen(false)} title="Zamknij">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </CloseButton>
                            <Text bold="true" as="h2" text="Trwająca sesja" />
                            <Text text="Masz już rozpoczętą sesję nauki w tym zestawie. Co chcesz zrobić?" style={{ margin: '20px 0 30px 0', color: '#666' }} />

                            <div style={{ display: "flex", flexDirection: 'column', gap: "15px", alignItems: 'center' }}>
                                <ModalButton 
                                    type="button"
                                    style={{ width: '85%', padding: '14px', fontSize: '1.05rem' }}
                                    onClick={() => { setIsResetConfirmModalOpen(false); goToLearning(pendingMode); }} 
                                >
                                    Kontynuuj naukę
                                </ModalButton>
                                <ModalButton 
                                    type="button"
                                    style={{ width: '85%', padding: '14px', background: 'transparent', border: '2px solid #e74c3c', color: '#e74c3c', fontSize: '1.05rem' }}
                                    onClick={handleResetAndStart}
                                >
                                    Zacznij od nowa (zresetuj postępy)
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