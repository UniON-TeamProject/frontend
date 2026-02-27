import React, { useState } from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
    perspective: 1000px;
    width: 350px;
    height: 350px;
    position: relative;
    margin: 10px;
`;

const CardInner = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;
    transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'none'};
    cursor: pointer;
`;

const CardFace = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background-color: white;
    border: 1px solid #eee;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-size: 1.1rem;
    color: #333;
    text-align: center;
`;

const CardBack = styled(CardFace)`
    transform: rotateY(180deg);
`;

const GearButton = styled.div`
    position: absolute;
    top: 5px; 
    right: 5px;
    width: 28px;
    height: 28px;

    border-radius: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 10;
    
    transition: transform 0.2s;
    
    &:hover { transform: scale(1.1); }
    img { width: 35px; height: 35px; opacity: 0.6; transition: opacity 0.2s; }
    &:hover img { opacity: 1; }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 25px; 
    right: -10px; 
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 5px 0;
    z-index: 20;
    min-width: 70px;
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
    &:hover { background-color: #f5f5f5; }
`;

const InvisibleOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 15;
`;

export default function Flashcard({ question, answer, onEdit, onDelete }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <CardWrapper>
            <CardInner $isFlipped={isFlipped} onClick={() => setIsFlipped(!isFlipped)}>
                <CardFace>{question}</CardFace>
                <CardBack>{answer}</CardBack>
            </CardInner>

            <GearButton onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
            }}>
                <img src="/icons/gear.png" alt="Opcje" />
            </GearButton>

            {isMenuOpen && (
                <>
                    <InvisibleOverlay onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                    <DropdownMenu onClick={(e) => e.stopPropagation()}>
                        <DropdownItem onClick={() => { setIsMenuOpen(false); onEdit(); }}>
                            Edytuj
                        </DropdownItem>
                        <DropdownItem onClick={() => { setIsMenuOpen(false); onDelete(); }}>
                            Usuń
                        </DropdownItem>
                    </DropdownMenu>
                </>
            )}
        </CardWrapper>
    );
}