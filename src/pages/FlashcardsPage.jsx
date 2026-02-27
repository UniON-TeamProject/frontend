import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton';
import Text from '../components/atoms/Text';
import Input from '../components/atoms/Input';
import { addCard, deleteCard, editCard, addFlashcardSet, getAllFlashcardSets, editFlashcardSet, deleteFlashcardSet, resetFlashcardSetProgress } from '../api';
import { getToken } from '../token';
import Flashcard from '../components/organisms/Flashcard';
import { useNavigate, useParams } from 'react-router-dom';

const StyledContainer = styled.div`
   width: 100%;
   min-height: 100vh;
   padding: 40px 60px; 
   position: relative;
   background-color: #fafafa; 
`;

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

const SubTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: #000;
    text-align: left;
    margin-bottom: 40px;
    display: flex;
    align-items: center;
    gap: 15px;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: 700;
    cursor: pointer;
    color: #555;
    transition: color 0.2s;
    display: flex;
    align-items: center;

    &:hover {
        color: #000;
    }
`;

const SetHeaderControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
    width: 100%;
`;

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

const StartLearningButton = styled.button`
    background-color: #d1d4c9;
    border: none;
    border-radius: 10px;
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    color: #333;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #c2c5ba;
    }
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

const CardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 50px 50px; 
    justify-items: center;
`;

const SetItemWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 220px;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover { transform: translateY(-5px); }
`;

const SetIconContainer = styled.div`
    position: relative;
    width: 140px;
    height: 100px;
    margin-bottom: 15px;
`;

const GearButton = styled.div`
    position: absolute;
    bottom: -5px;
    right: -20px;
    width: 28px;
    height: 28px;
    
    border-radius: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 11;
    
    transition: transform 0.2s;

    &:hover { transform: scale(1.1); }
    img { width: 29px; height: 29px; opacity: 0.6; transition: opacity 0.2s; }
    &:hover img { opacity: 1; }
`;

const SetTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
    color: #000;
    margin-bottom: 10px;
    line-height: 1.3;
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
`;

const TagPill = styled.span`
    background-color: #f4f4f4;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.75rem;
    color: #555;
    font-weight: 500;
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
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 12px 40px;
    font-size: 15px;
    color: #555;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.5 : 1};
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    transition: all 0.2s;
    
    &:hover {
        box-shadow: ${props => props.disabled ? '0 2px 5px rgba(0,0,0,0.02)' : '0 4px 10px rgba(0,0,0,0.08)'};
        background: ${props => props.disabled ? 'white' : '#fafafa'};
    }
`;


const FloatingActionButton = styled.button`
    position: fixed;
    bottom: 40px;
    right: 40px;
    width: 70px;
    height: 70px;
    background-color: white;
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
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
`;

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

const EmptyStateContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 50vh; 
    text-align: center; 
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

const StyledModalTextArea = styled.textarea`
    width: 100%;
    padding: 10px;
    margin: 10px 0 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
`;

// TO SIE POTEM ZMIENI NA PRAWDZIWE GRAFICZKI OKEEJ
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
            setIsAddingMode(false); // wyjdz z trybu dodawania jesli wracamy do menu DO POPRAWY I GUESS?
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
        setSetTags(set.tags ? set.tags.join(', ') : "");
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
        <StyledContainer>
            <TopSection>
                <MainTitle>Nauka</MainTitle>
            </TopSection>

            <Divider />

            {/* NAGŁÓWEK */}
            {!activeSetId ? (
                <SubTitle>Twoje zestawy fiszek...</SubTitle>
            ) : (
                <>
                    <SubTitle style={{ marginBottom: '20px' }}>
                        <BackButton onClick={() => {
                            if (isAddingMode) setIsAddingMode(false);
                            else navigate('/learning');
                        }}>
                            &#8592;
                        </BackButton>
                        {currentSet?.name}
                        {currentSet?.tags && currentSet.tags.length > 0 && !isAddingMode && (
                            <TagsContainer style={{ marginLeft: '20px' }}>
                                {currentSet.tags.map((tag, i) => (
                                    <TagPill key={i}>{tag}</TagPill>
                                ))}
                            </TagsContainer>
                        )}
                    </SubTitle>

                    {!isAddingMode && (
                        <SetHeaderControls>
                            <ContinueLearningBanner
                                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                                onClick={() => navigate(`/learning/fast/${currentSet?.id}`)}
                                title="Wznów od miejsca, w którym skończyłeś"
                            >
                                Chcesz kontynuować ostatnią naukę? (Wznów sesję)
                            </ContinueLearningBanner>

                            <div style={{ position: 'relative' }}>
                                <StartLearningButton onClick={() => setIsLearningMenuOpen(!isLearningMenuOpen)}>
                                    Rozpocznij naukę ▼
                                </StartLearningButton>

                                {isLearningMenuOpen && (
                                    <>
                                        <InvisibleOverlay onClick={() => setIsLearningMenuOpen(false)} />
                                        <LearningDropdown>
                                            <LearningDropdownItem onClick={() => {
                                                setIsLearningMenuOpen(false);
                                                navigate(`/learning/fast/${currentSet?.id}`);
                                            }}>
                                                Szybka nauka
                                            </LearningDropdownItem>

                                            <LearningDropdownItem onClick={() => {
                                                setIsLearningMenuOpen(false);
                                                navigate(`/learning/fsrs/${currentSet?.id}`);
                                            }}>
                                                Trwała nauka
                                            </LearningDropdownItem>
                                        </LearningDropdown>
                                    </>
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
                <>
                    {sets.length === 0 && !errorMessage ? (
                        <EmptyStateContainer>
                            <Text text="Brak zestawów. Utwórz swój pierwszy pusty zestaw!" />
                        </EmptyStateContainer>
                    ) : (
                        <CardsGrid>
                            {sets.map((set, idx) => (
                                <SetItemWrapper key={set.id || idx} onClick={() => navigate(`/learning/set/${set.id}`)}>
                                    <SetIconContainer>
                                        <StackedCardsIcon />

                                        <GearButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === set.id ? null : set.id);
                                            }}
                                        >
                                            <img src="/icons/gear.png" alt="Opcje" />
                                        </GearButton>

                                        {activeMenuId === set.id && (
                                            <>
                                                <InvisibleOverlay onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                                <DropdownMenu onClick={(e) => e.stopPropagation()}>
                                                    <DropdownItem onClick={() => {
                                                        setActiveMenuId(null);
                                                        openEditSetModal(set);
                                                    }}>
                                                        Zmień nazwę
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => {
                                                        setActiveMenuId(null);
                                                        handleDeleteSet(set.id);
                                                    }}>
                                                        Usuń
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </SetIconContainer>

                                    <SetTitle>{set.name}</SetTitle>
                                    {set.tags && set.tags.length > 0 && (
                                        <TagsContainer>
                                            {set.tags.map((tag, i) => (
                                                <TagPill key={i}>{tag}</TagPill>
                                            ))}
                                        </TagsContainer>
                                    )}
                                </SetItemWrapper>
                            ))}
                        </CardsGrid>
                    )}
                </>
            )}

            {/* WNETRZE ZESTAWU */}
            {activeSetId && !isAddingMode && (
                <>
                    {(!currentSet?.cards || currentSet.cards.length === 0) && !errorMessage ? (
                        <EmptyStateContainer>
                            <Text text="Ten zestaw jest pusty. Kliknij + w prawym dolnym rogu, aby dodać fiszkę!" />
                        </EmptyStateContainer>
                    ) : (
                        <CardsGrid>
                            {currentSet.cards.map((card) => (
                                <Flashcard
                                    key={card.id}
                                    question={card.contentFirstSide || card.question}
                                    answer={card.contentFlipSide || card.answer}
                                    onEdit={() => openEditCardModal(card)}
                                    onDelete={() => handleDeleteCard(card.id)}
                                />
                            ))}
                        </CardsGrid>
                    )}
                </>
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
                    <StyledModalBox>
                        <Text bold="true" as="h2" text="Edytuj fiszkę" />
                        {errorMessage && <Text color="danger" text={errorMessage} />}
                        <Text text={`Edytujesz fiszkę z zestawu: ${currentSet?.name}`} style={{ marginBottom: '20px', color: '#555' }} />

                        <Text text="Pytanie:" />
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
                    </StyledModalBox>
                </>
            )}

            {/* DODAWANIE/EDYCJA ZESTAWU */}
            {isSetModalOpen && (
                <>
                    <ModalOverlay onClick={() => setIsSetModalOpen(false)} />
                    <StyledModalBox>
                        <Text bold="true" as="h2" text={editingSetId ? "Edytuj zestaw" : "Nowy zestaw fiszek"} />
                        {errorMessage && <Text color="danger" text={errorMessage} />}
                        {successMessage && <Text style={{ color: 'green' }} text={successMessage} />}

                        <div style={{ marginTop: '20px', marginBottom: editingSetId ? '20px' : '0' }}>
                            <Input
                                type="text"
                                name="setName"
                                placeholder="Nazwa zestawu"
                                value={setName}
                                onChange={(e) => setSetName(e.target.value)}
                            />
                        </div>
                        {!editingSetId && (
                            <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                                <Input
                                    type="text"
                                    name="setTags"
                                    placeholder="Tagi (po przecinku, np. matematyka, sesja)"
                                    value={setTags}
                                    onChange={(e) => setSetTags(e.target.value)}
                                />
                            </div>
                        )}

                        <SubmitButton text={editingSetId ? "Zapisz zmiany" : "Utwórz pusty zestaw"} color="dark" onClick={handleSaveSet} />
                    </StyledModalBox>
                </>
            )}
        </StyledContainer>
    );
}

export default FlashcardsPage;



