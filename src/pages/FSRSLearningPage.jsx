import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { getFsrsCards, sendFsrsAnswer, editCard, getCardDues } from "../api";
import { getToken } from "../token";
import SubmitButton from "../components/atoms/SubmitButton";
import Input from "../components/atoms/Input";
import Text from "../components/atoms/Text";

const fadeIn = keyframes` 
  from { 
    opacity: 0; 
    transform: scale(0.95); 
  } 
  to { 
    opacity: 1; 
    transform: scale(1); 
  } 
`;

const overlayFadeIn = keyframes` 
  from { 
    opacity: 0; 
    backdrop-filter: blur(0px); 
  } 
  to { 
    opacity: 1; 
    backdrop-filter: blur(5px); 
  } 
`;

const PageContainer = styled.div` 
  margin: 0; 
  font-family: inherit; 
  background: #f4f6f8; 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  position: relative;
`;

const TopBar = styled.div` 
  width: 100%; 
  max-width: 1560px; 
  display: flex; 
  margin-top: 20px; 
`;

const ExitButton = styled.button`
  background: none; 
  border: none; 
  font-size: 1.1rem; 
  font-weight: 600; 
  color: #555; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  transition: color 0.2s;

  &:hover { 
    color: #111; 
  }

  svg { 
    width: 24px; 
    height: 24px; 
  }
`;

const AppContainer = styled.div` 
  width: 100%; 
  max-width: 700px; 
  text-align: center; 
  position: relative; 
  display: flex; 
  flex-direction: column; 
  align-items: center;
`;

const CardContainer = styled.div`
  perspective: 1000px;
  width: 150%;
  height: 700px;
  position: relative;
  margin-bottom: 20px;
`;

const CardWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  cursor: ${(props) => (props.$isFlipped ? "default" : "pointer")};
  transform: ${(props) => (props.$isFlipped ? "rotateY(180deg)" : "none")};
`;

const CardFace = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 24px;
  background-color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  padding: 40px;
  
  .content {
    font-size: 1.7rem;
    font-weight: 600;
    color: #222;
    overflow-wrap: break-word;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 15;
    overflow: hidden;
  }
`;

const SeeAnswerHint = styled.div` 
  position: absolute; 
  bottom: 25px; 
  font-size: 0.95rem; 
  color: #aaa; 
  font-weight: 500; 
`;

const CardBack = styled(CardFace)` 
  transform: rotateY(180deg); 
  background: white; 
  overflow: hidden; 
`;

const FlipBackButton = styled.button`
  position: absolute; 
  top: 20px; 
  left: 20px; 
  background: rgba(0,0,0,0.05); 
  border: none; 
  border-radius: 50%; 
  width: 40px; 
  height: 40px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  cursor: pointer; 
  z-index: 10; 
  transition: background 0.2s;

  &:hover { 
    background: rgba(0,0,0,0.1); 
  }

  svg { 
    width: 20px; 
    height: 20px; 
    color: #555; 
  }
`;

const Counter = styled.div` 
  font-size: 1.2rem; 
  font-weight: 650; 
  color: #666; 
  margin-bottom: 25px; 
`;

const PillMenu = styled.div` 
  display: flex; 
  align-items: center; 
  background: white; 
  border-radius: 30px; 
  padding: 8px 18px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.06); 
  border: 1px solid #f0f0f0; 
  gap: 15px; 
`;

const PillButton = styled.button` 
  background: none; 
  border: none; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  cursor: pointer; 
  color: #888; 
  padding: 8px; 
  border-radius: 50%; 
  transition: color 0.2s, background 0.2s; 

  &:hover { 
    color: #333; 
    background: #f4f4f4; 
  } 

  svg { 
    width: 22px; 
    height: 22px; 
  } 
`;

const PillDivider = styled.div` 
  width: 1px; 
  height: 24px; 
  background: #eee; 
`;

const RatingScaleContainer = styled.div`
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  position: absolute; 
  bottom: 40px; 
  left: 80px; 
  right: 80px;

  &::before { 
    content: ''; 
    position: absolute; 
    top: 13px; 
    left: 20px; 
    right: 20px; 
    height: 3px;
    background: #e0e0e0; 
    z-index: 0; 
    border-radius: 2px;
  }
`;

const RatingNode = styled.div` 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  cursor: pointer; 
  z-index: 1; 
  transition: transform 0.2s; 
  width: 80px;

  &:hover { 
    transform: scale(1.05); 
  } 
`;

const NodeCircle = styled.div` 
  width: 28px; 
  height: 28px; 
  border-radius: 50%; 
  background-color: ${(props) => props.$color}; 
  margin-bottom: 8px; 
  position: relative;
  z-index: 2;
  transition: box-shadow 0.3s ease;
  box-shadow: ${(props) => props.$isHovered ? `0 0 25px 12px ${props.$color}90` : 'none'};
`;

const NodeLabel = styled.span` 
  font-size: 13px; 
  font-weight: 700; 
  color: #777; 
`;

const ModalOverlay = styled.div` 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.5); 
  z-index: 999; 
`;

const StyledPopup = styled.div` 
  position: fixed; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 600px; 
  padding: 40px; 
  border-radius: 16px; 
  background: white; 
  box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
  z-index: 1000; 
  text-align: left; 
`;

const StyledTextArea = styled.textarea` 
  width: 100%; 
  padding: 15px; 
  margin: 10px 0 20px 0; 
  border: 1px solid #ccc; 
  border-radius: 8px; 
  font-family: inherit; 
  font-size: 1rem; 
  resize: vertical; 
  min-height: 100px; 
  background: #f9f9f9; 
  outline: none; 

  &:focus { 
    border-color: #888; 
  } 
`;

const EndScreenOverlay = styled.div` 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.6); 
  backdrop-filter: blur(5px); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 2000; 
  animation: ${overlayFadeIn} 0.8s ease forwards; 
`;

const EndScreenModal = styled.div` 
  background: white; 
  padding: 60px; 
  border-radius: 24px; 
  box-shadow: 0 20px 50px rgba(0,0,0,0.2); 
  text-align: center; 
  max-width: 500px; 
  width: 90%; 
  animation: ${fadeIn} 0.6s ease forwards; 

  h2 { 
    font-size: 2.5rem; 
    margin-bottom: 20px; 
    color: #222; 
  } 

  p { 
    font-size: 1.2rem; 
    color: #666; 
    margin-bottom: 40px; 
  } 
`;

const EndScreenButton = styled.button` 
  background-color: ${({ theme }) => theme.colors?.secondary || '#555'}; 
  color: white; 
  border: none; 
  padding: 15px 30px; 
  border-radius: 12px; 
  font-size: 1.1rem; 
  font-weight: 700; 
  cursor: pointer; 
  transition: opacity 0.2s, transform 0.2s; 

  &:hover { 
    opacity: 0.9; 
    transform: translateY(-2px); 
  } 
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
  
  &:hover { opacity: 0.9; transform: translateY(-2px); }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
  
  input {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors?.secondary || '#555'};
  }
`;

const NodeTime = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #aaa;
  height: 15px;
`;

export default function FsrsLearningPage() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [rememberExitChoice, setRememberExitChoice] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editTags, setEditTags] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const [cardDues, setCardDues] = useState(null);

  const [hoveredRating, setHoveredRating] = useState(null);

  useEffect(() => {
    if (!getToken()) { navigate("/", { replace: true }); return; }
    const fetchCards = async () => {
      const data = await getFsrsCards(setId);
      if (data) {
        setCards(data);
      }
      setIsLoading(false);
    };
    fetchCards();
  }, [setId]);

  useEffect(() => {
    if (cards.length > 0 && currentIndex < cards.length) {
      const fetchDues = async () => {
        setCardDues(null);
        const res = await getCardDues(cards[currentIndex].id);
        if (!res.errorCode) {
          setCardDues(res.data);
        }
      };
      fetchDues();
    }
  }, [currentIndex, cards]);

  const handleRating = async (ratingValue, e) => {
    e.stopPropagation();
    const currentCard = cards[currentIndex];
    await sendFsrsAnswer(currentCard.id, ratingValue);
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const openEditModal = (e) => {
    e.stopPropagation();
    const card = cards[currentIndex];
    setEditQ(card.contentFirstSide); setEditA(card.contentFlipSide);
    setEditTags(card.tags && card.tags.length > 0 ? card.tags.join(', ') : "");
    setModalError(""); setModalSuccess(""); setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editQ.trim() || !editA.trim()) { setModalError("Pola nie mogą być puste!"); return; }
    const currentCard = cards[currentIndex];
    const tagsArray = editTags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const res = await editCard(currentCard.id, editQ, editA, parseInt(setId), tagsArray);
    if (res.errorCode) { setModalError(res.message); } else {
      const newCards = [...cards];
      newCards[currentIndex] = { ...currentCard, contentFirstSide: editQ, contentFlipSide: editA, tags: tagsArray };
      setCards(newCards); setModalSuccess("Zapisano pomyślnie!"); setTimeout(() => setIsEditModalOpen(false), 1000);
    }
  };

  const handleExitClick = (e) => {
    e.preventDefault();
    if (localStorage.getItem("skipExitModal") === "true") {
      navigate(`/learning/set/${setId}`);
    } else {
      setIsExitModalOpen(true);
    }
  };

  const handleConfirmExit = () => {
    if (rememberExitChoice) {
      localStorage.setItem("skipExitModal", "true");
    }
    navigate(`/learning/set/${setId}`);
  };

  const currentCard = cards[currentIndex];


  const openInfoModal = async (e) => {
    e.stopPropagation();
    setIsInfoModalOpen(true);
    setCardDues(null);

    const res = await getCardDues(cards[currentIndex].id);
    if (!res.errorCode) {
        setCardDues(res.data);
    } else {
        setCardDues("Błąd pobierania danych");
    }
  };

  const formatDueTime = (timeStr) => {
    if (!timeStr) return "";
    const match = timeStr.match(/(\d+)\s*dni\s*(\d+)\s*hr\s*(\d+)\s*min/);
    if (!match) return timeStr;

    const d = parseInt(match[1], 10);
    const h = parseInt(match[2], 10);
    const m = parseInt(match[3], 10);

    if (d > 0) return d === 1 ? "1 dzień" : `${d} dni`;
    if (h > 0) return h === 1 ? "1 godz." : `${h} godz.`;
    if (m > 0) return `${m} min`;
    return "< 1 min";
  };




  if (isLoading) return <PageContainer><h3>Pobieram powtórki na dziś...</h3></PageContainer>;
  
  if (currentIndex >= cards.length || cards.length === 0) {
      return (
        <PageContainer>
            <TopBar>
              <ExitButton type="button" onClick={() => navigate(`/learning/set/${setId}`)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Wróć do zestawu
              </ExitButton>
            </TopBar>
            
            <EndScreenOverlay>
              <EndScreenModal>
                <h2>To wszystko na dziś!</h2>
                <p>{cards.length === 0 ? "Wróć niedługo po nowe powtórki!" : "Wszystko zrobione! Wróć niedługo po nowe powtórki!."}</p>
                <EndScreenButton type="button" onClick={() => navigate(`/learning/set/${setId}`)}>
                  Wróć do zestawu
                </EndScreenButton>
              </EndScreenModal>
            </EndScreenOverlay>
        </PageContainer>
      );
  }

  return (
    <PageContainer>
      <TopBar>
        <ExitButton type="button" onClick={handleExitClick}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Wróć do zestawu
        </ExitButton>
        <div style={{ width: '150px' }}></div>
      </TopBar>

      <AppContainer>
        <div style={{ height: '32px' }}></div> 

        <CardContainer>
          <CardWrapper $isFlipped={isFlipped} onClick={() => { if (!isFlipped) setIsFlipped(true); }}>
            
            <CardFace>
              <div className="content" dangerouslySetInnerHTML={{ __html: currentCard.contentFirstSide }} />
              <SeeAnswerHint>Kliknij, aby zobaczyć odpowiedź</SeeAnswerHint>
            </CardFace>

            <CardBack $hoveredRating={hoveredRating}>
              <FlipBackButton type="button" onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} title="Odwróć z powrotem">
                <svg fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/></svg>
              </FlipBackButton>

              <div className="content" style={{marginBottom: '60px'}} dangerouslySetInnerHTML={{ __html: currentCard.contentFlipSide}} />

              {isFlipped && (
                <RatingScaleContainer onClick={e => e.stopPropagation()}>
                  <RatingNode 
                    onClick={(e) => handleRating(1, e)}
                    onMouseEnter={() => setHoveredRating(1)}
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    <NodeCircle $color="#e74c3c" $isHovered={hoveredRating === 1} />
                    <NodeLabel>Trudne</NodeLabel>
                    <NodeTime>{cardDues ? formatDueTime(cardDues.again) : "..."}</NodeTime>
                  </RatingNode>

                  <RatingNode 
                    onClick={(e) => handleRating(2, e)}
                    onMouseEnter={() => setHoveredRating(2)}
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    <NodeCircle $color="#e67e22" $isHovered={hoveredRating === 2} />
                    <NodeLabel>Średnie</NodeLabel>
                    <NodeTime>{cardDues ? formatDueTime(cardDues.hard) : "..."}</NodeTime>
                  </RatingNode>

                  <RatingNode 
                    onClick={(e) => handleRating(3, e)}
                    onMouseEnter={() => setHoveredRating(3)}
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    <NodeCircle $color="#f1c40f" $isHovered={hoveredRating === 3} />
                    <NodeLabel>Łatwe</NodeLabel>
                    <NodeTime>{cardDues ? formatDueTime(cardDues.good) : "..."}</NodeTime>
                  </RatingNode>

                  <RatingNode 
                    onClick={(e) => handleRating(4, e)}
                    onMouseEnter={() => setHoveredRating(4)}
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    <NodeCircle $color="#2ecc71" $isHovered={hoveredRating === 4} />
                    <NodeLabel>Umiem!</NodeLabel>
                    <NodeTime>{cardDues ? formatDueTime(cardDues.easy) : "..."}</NodeTime>
                  </RatingNode>
                </RatingScaleContainer>
              )}
            </CardBack>
          </CardWrapper>
        </CardContainer>

        <Counter>{currentIndex + 1} / {cards.length}</Counter>

        <PillMenu>
          <PillButton type="button" onClick={openEditModal} title="Edytuj fiszkę">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </PillButton>
          <PillDivider />
          <PillButton type="button" onClick={openInfoModal} title="Tagi / Informacje">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </PillButton>
        </PillMenu>
      </AppContainer>

      {/* MODAL WYJŚCIA */}
      {isExitModalOpen && (
          <>
              <ModalOverlay onClick={() => setIsExitModalOpen(false)} />
              <StyledPopup onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                  <Text bold="true" as="h2" text="Zakończyć powtórki?" />
                  <Text text="Twój dotychczasowy postęp został zapisany. Możesz wznowić sesję w dowolnej chwili." style={{ margin: '20px 0 30px 0', color: '#666' }} />

                  <CheckboxContainer>
                      <input 
                          type="checkbox" 
                          checked={rememberExitChoice}
                          onChange={(e) => setRememberExitChoice(e.target.checked)}
                      />
                      Nie pytaj ponownie (zapamiętaj mój wybór)
                  </CheckboxContainer>

                  <div style={{ display: "flex", justifyContent: 'center', gap: "15px" }}>
                      <ModalButton type="button" $danger onClick={handleConfirmExit}>
                          Zakończ
                      </ModalButton>
                      <ModalButton type="button" onClick={() => setIsExitModalOpen(false)}>
                          Zostań
                      </ModalButton>
                  </div>
              </StyledPopup>
          </>
      )}

      {/* MODAL EDYCJI Z TAGAMI */}
      {isEditModalOpen && (
          <>
              <ModalOverlay onClick={() => setIsEditModalOpen(false)} />
              <StyledPopup style={{ textAlign: 'left' }}>
                  <h2 style={{marginBottom: '20px'}}>Edytuj fiszkę</h2>
                  {modalError && <p style={{color: 'red'}}>{modalError}</p>}
                  {modalSuccess && <p style={{color: 'green'}}>{modalSuccess}</p>}
                  
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Przód:</p>
                  <StyledTextArea maxLength={1020} value={editQ} onChange={e => setEditQ(e.target.value)} />
                  
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>Tył:</p>
                  <StyledTextArea maxLength={1020} value={editA} onChange={e => setEditA(e.target.value)} />
                  
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#555', marginTop: '10px' }}>Tagi tej fiszki (po przecinku):</p>
                  <Input 
                      type="text" 
                      value={editTags} 
                      onChange={e => setEditTags(e.target.value)} 
                      placeholder="np. kolokwium1, referat" 
                      style={{ marginBottom: '30px' }}
                  />

                  <div style={{ textAlign: 'center' }}>
                      <ModalButton type="button" onClick={handleEditSubmit}>Zapisz zmiany</ModalButton>
                  </div>
              </StyledPopup>
          </>
      )}

      {/* MODAL INFORMACJI O FISZCE */}
      {isInfoModalOpen && (
          <>
              <ModalOverlay onClick={() => setIsInfoModalOpen(false)} />
              <StyledPopup style={{ textAlign: 'center' }}>
                  <h2 style={{marginBottom: '30px'}}>Tagi tej fiszki</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    {!currentCard.tags || currentCard.tags.length === 0 ? (
                        <p style={{ color: '#888' }}>Brak przypisanych tagów.</p>
                    ) : (
                        currentCard.tags.map((t, i) => (
                            <span key={i} style={{ background: '#555', color: 'white', padding: '6px 14px', borderRadius: '15px', fontWeight: '600', fontSize: '0.9rem' }}>
                                {t}
                            </span>
                        ))
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '20px' }}>Możesz zmienić tagi używając przycisku edycji.</p>

                  <div style={{ marginTop: '20px', padding: '15px', background: '#f4f5f7', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'left' }}>
                    <strong style={{ color: '#333' }}>Kiedy ta fiszka wróci? (Symulacja ocen)</strong>
                    <p style={{ marginTop: '10px', color: '#666', fontFamily: 'monospace', wordWrap: 'break-word' }}>
                        {cardDues === null ? "Obliczam harmonogram..." : JSON.stringify(cardDues, null, 2)}
                    </p>
                </div>
              </StyledPopup>
          </>
      )}
    </PageContainer>
  );
}