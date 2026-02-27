import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getFastLearningCards, sendFastLearningAnswer } from "../api";


const PageContainer = styled.div`
  margin: 0;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  background: #fdfdfd;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AppContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  text-align: center;
  position: relative;
`;

const PreviousButton = styled.button`
  position: absolute;
  top: 49px;
  left: -80px;
  z-index: 100;
  font-size: 35px;
  background: #fdfdfd;
  padding: 8px 14px;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  
  opacity: ${(props) => (props.$isFlipped ? 1 : 0)};
  pointer-events: ${(props) => (props.$isFlipped ? "auto" : "none")};
  transition: opacity 0.9s ease;
`;

const CardHint = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  opacity: ${(props) => (props.$isFlipped ? 1 : 0)};
  transition: opacity 0.9s ease;

  .bad {
    color: #be6767;
  }
  .good {
    color: #569965;
  }
`;

const CardContainer = styled.div`
  perspective: 1000px;
  width: 100%;
  height: 600px;
  position: relative;
  margin: 20px 0;
`;

const CardWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  cursor: pointer;
  transform: ${(props) => (props.$isFlipped ? "rotateY(180deg)" : "none")};
`;

const CardFace = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  font-size: 30px;
  color: #555;
`;

const CardFront = styled(CardFace)`
  flex-direction: column;
`;

const SeeAnswer = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 17px;
  color: #888;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: ${(props) => (props.$hoverSide ? 1 : 0)};
    transition: opacity 0.2s ease;
    background: ${(props) => {
      if (props.$hoverSide === "left") {
        return `linear-gradient(to right, rgba(190, 103, 103, 0.35), rgba(190, 103, 103, 0.15), transparent 60%)`;
      }
      if (props.$hoverSide === "right") {
        return `linear-gradient(to left, rgba(86, 153, 101, 0.35), rgba(86, 153, 101, 0.15), transparent 60%)`;
      }
      return "transparent";
    }};
  }
`;

const Navigation = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 29px;
  color: #2e2e2e;
  text-shadow: 0 2px rgba(0, 0, 0, 0.15);
  margin-top: 40px;
`;

const NavButton = styled.button`
  background-color: #fdfdfd;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 40px;
  display: inline-flex;
  align-items: center;

  opacity: ${(props) => (props.$isFlipped ? 1 : 0)};
  pointer-events: ${(props) => (props.$isFlipped ? "auto" : "none")};
  transition: opacity 0.3s ease;
  color: ${(props) => (props.$color === "bad" ? "#BE6767" : "#569965")};
`;

const MenuBottom = styled.div`
  margin-top: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px 30px;
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  border-radius: 20px;

  button {
    color: #535353;
    margin: 0 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
  }
`;

//
//
//
export default function FastLearningPage() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // stan dla gradientu: left | right | null
  const [hoverSide, setHoverSide] = useState(null);
  const backRef = useRef(null);

  useEffect(() => {
    const fetchCards = async () => {
      const data = await getFastLearningCards(setId);
      if (data) {
        setCards(data);
      }
      setIsLoading(false);
    };
    fetchCards();
  }, [setId]);

  const handleMouseMove = (e) => {
    if (!backRef.current) return;
    const rect = backRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;

    if (x < half) {
      setHoverSide("left");
    } else {
      setHoverSide("right");
    }
  };

  const handleMouseLeave = () => {
    setHoverSide(null);
  };

  const handleAnswer = async (isCorrect, e) => {
    if (e) e.stopPropagation();

    const currentCard = cards[currentIndex];
    const answerCode = isCorrect ? 1 : 0; // 1 = KNOW, 0 = DONT_KNOW

    await sendFastLearningAnswer(currentCard.id, answerCode);

    setIsFlipped(false);
    setHoverSide(null);
    setCurrentIndex((prev) => prev + 1);
  };

  if (isLoading) return <PageContainer>Ładowanie fiszek...</PageContainer>;

  if (currentIndex >= cards.length || cards.length === 0) {
    return (
      <PageContainer>
        <div style={{ textAlign: "center", fontSize: "20px" }}>
          <h2>Gratulacje!</h2>
          <p>Przeszedłeś przez wszystkie fiszki z tego zestawu.</p>
          <button onClick={() => navigate(`/nauka/zestaw/${setId}`)}>
            Wróć do zestawu
          </button>
        </div>
      </PageContainer>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <PageContainer>
      <AppContainer>
        <PreviousButton
          $isFlipped={isFlipped}
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(false);
          }}
          title="Odwróć z powrotem"
        >
          ⮌
        </PreviousButton>

        <CardHint $isFlipped={isFlipped}>
          <p className="bad">Nie umiem ⭠ Kliknij w lewo</p>
          <p className="good">Kliknij w prawo ⭢ Umiem</p>
        </CardHint>

        <CardContainer>
          <CardWrapper
            $isFlipped={isFlipped}
            onClick={() => {
              if (!isFlipped) setIsFlipped(true);
            }}
          >
            {/* PRZÓD */}
            <CardFront>
              <div>{currentCard.contentFirstSide}</div>
              <SeeAnswer>Kliknij, aby zobaczyć odpowiedź</SeeAnswer>
            </CardFront>

            {/* TYŁ */}
            <CardBack
              ref={backRef}
              $hoverSide={hoverSide}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => {
                if (!backRef.current) return;
                const rect = backRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) {
                  handleAnswer(false, e);
                } else {
                  handleAnswer(true, e);
                }
              }}
            >
              <div>{currentCard.contentFlipSide}</div>
            </CardBack>
          </CardWrapper>
        </CardContainer>

        <Navigation>
          <NavButton
            $isFlipped={isFlipped}
            $color="bad"
            onClick={(e) => handleAnswer(false, e)}
          >
            ⭠
          </NavButton>
          
          <div className="counter">
            {currentIndex + 1} / {cards.length}
          </div>
          
          <NavButton
            $isFlipped={isFlipped}
            $color="good"
            onClick={(e) => handleAnswer(true, e)}
          >
            ⭢
          </NavButton>
        </Navigation>

        {/* dolne menu wyjscia */}
        <MenuBottom>
          <button onClick={() => {
              const confirmSave = window.confirm("Czy chcesz przerwać sesję nauki?\n\nTwój dotychczasowy postęp został automatycznie zapisany. Będziesz mógł wznowić tę sesję klikając 'Chcesz kontynuować ostatnią naukę'.");
              if (confirmSave) {
                  navigate(`/nauka/zestaw/${setId}`);
              }
          }}>
             ✖ Zakończ i zapisz
          </button>
        </MenuBottom>
      </AppContainer>
    </PageContainer>
  );
}