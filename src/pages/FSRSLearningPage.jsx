import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getFsrsCards, sendFsrsAnswer } from "../api";
import { getToken } from "../token";


const PageContainer = styled.div`
  margin: 0;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  background: #fdfdfd;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const AppContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -60px;
  left: 0;
  font-size: 18px;
  background: white;
  padding: 8px 15px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 10px;
  color: #555;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  
  &:hover { background: #f0f0f0; }
`;

const CardContainer = styled.div`
  perspective: 1000px;
  width: 600px;
  height: 450px;
  position: relative;
  margin-bottom: 30px;
`;

const CardWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  cursor: ${(props) => (props.$isFlipped ? "default" : "pointer")};
  transform: ${(props) => (props.$isFlipped ? "rotateY(180deg)" : "none")};
`;

const CardFace = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  font-size: 28px;
  color: #111;
  padding: 40px;
  font-weight: 600;
  line-height: 1.4;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: linear-gradient(to right, #fde4f2, #e6f0e4);
  justify-content: flex-start;
  padding-top: 80px;
`;

const RatingScaleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 50px;
  left: 60px;
  right: 60px;

  /* to jest ta pozioma linia łącząca kropki !!!!!!!!!!!!!!! */
  &::before {
    content: '';
    position: absolute;
    top: 10px; 
    left: 0;
    right: 0;
    height: 2px;
    background: #444;
    z-index: 0;
  }
`;

const RatingNode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.15);
  }
`;

const NodeCircle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  margin-bottom: 12px;
  border: 2px solid ${(props) => props.$color};
`;

const NodeLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #222;
`;

const Counter = styled.div`
  font-size: 18px;
  color: #777;
  font-weight: 600;
`;


export default function SpacedLearningPage() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleRating = async (ratingValue, e) => {
    e.stopPropagation();

    const currentCard = cards[currentIndex];
    await sendFsrsAnswer(currentCard.id, ratingValue);

    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (isLoading) return <PageContainer>Ładowanie fiszek...</PageContainer>;

  if (currentIndex >= cards.length || cards.length === 0) {
    return (
      <PageContainer>
        <div style={{ textAlign: "center", fontSize: "20px" }}>
          <h2>Gratulacje!</h2>
          <p>Ukończyłeś powtórki na dziś.</p>
          <button
            onClick={() => navigate(`/learning/set/${setId}`)}
            style={{ padding: "10px 20px", marginTop: "20px", fontSize: "18px", cursor: "pointer", borderRadius: "10px", border: "1px solid #ccc" }}
          >
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
        <CloseButton onClick={() => navigate(`/learning/set/${setId}`)}>
          ✖ Wyjdź
        </CloseButton>

        <CardContainer>
          <CardWrapper
            $isFlipped={isFlipped}
            onClick={() => {
              if (!isFlipped) setIsFlipped(true);
            }}
          >
            {/* PRZÓD */}
            <CardFace>
              <div>{currentCard.contentFirstSide}</div>
            </CardFace>

            {/* TYŁ */}
            <CardBack>
              <div>{currentCard.contentFlipSide}</div>

              {isFlipped && (
                <RatingScaleContainer>
                  <RatingNode onClick={(e) => handleRating(1, e)}>
                    <NodeCircle $color="#4a2c40" />
                    <NodeLabel>Bardzo trudne</NodeLabel>
                  </RatingNode>

                  <RatingNode onClick={(e) => handleRating(2, e)}>
                    <NodeCircle $color="#8b4b72" />
                    <NodeLabel>Trudne</NodeLabel>
                  </RatingNode>

                  <RatingNode onClick={(e) => handleRating(3, e)}>
                    <NodeCircle $color="#658254" />
                    <NodeLabel>Łatwe</NodeLabel>
                  </RatingNode>

                  <RatingNode onClick={(e) => handleRating(4, e)}>
                    <NodeCircle $color="#2c5234" />
                    <NodeLabel>Bardzo łatwe</NodeLabel>
                  </RatingNode>
                </RatingScaleContainer>
              )}
            </CardBack>
          </CardWrapper>
        </CardContainer>

        <Counter>
          {currentIndex + 1} / {cards.length}
        </Counter>
      </AppContainer>
    </PageContainer>
  );
}