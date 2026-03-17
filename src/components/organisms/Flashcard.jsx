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
    font-size: 1.1rem;
    color: #333;
    text-align: center;
`;

const CardBack = styled(CardFace)`
    transform: rotateY(180deg);
`;
/*
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
`;*/

const DropdownMenu = styled.div`
    position: absolute;
    top: 45px;
    right: 10px; 
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
    &:hover { background-color: #f5f5f5; }
`;

const InvisibleOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 15;
`;

const CardText = styled.div`
    width: 100%;
    height: 100%;
    padding: 40px;
    font-size: 1.1rem;
    color: #333;
    text-align: center;
    
    display: flex;
    align-items: center;
    justify-content: center;

    p {
        margin: 0;
        width: 100%;
        word-wrap: break-word;
        word-break: break-all;
        
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 10;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const OptionsButton = styled.div`
    position: absolute;
    top: 15px; 
    right: 15px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.2s;
    
    color: #888;
    
    &:hover { 
        background-color: #f0f0f0; 
        color: #333;
    }
    
    svg {
        width: 20px;
        height: 20px;
    }
`;


const EllipsisIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>
);

export default function Flashcard({ question, answer, onEdit, onDelete }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <CardWrapper>
            <CardInner $isFlipped={isFlipped} onClick={() => setIsFlipped(!isFlipped)}>
                <CardFace>
                    <CardText><p>{question}</p></CardText>
                </CardFace>
                <CardBack>
                    <CardText><p>{answer}</p></CardText>
                </CardBack>
            </CardInner>

            <OptionsButton onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
            }}>
                <EllipsisIcon />
            </OptionsButton>

            {isMenuOpen && (
                <>
                    <InvisibleOverlay onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                    <DropdownMenu onClick={(e) => e.stopPropagation()}>
                        <DropdownItem onClick={() => { setIsMenuOpen(false); onEdit(); }}>
                            Edytuj fiszkę
                        </DropdownItem>
                        <DropdownItem className="danger" onClick={() => { setIsMenuOpen(false); onDelete(); }}>
                            Usuń fiszkę
                        </DropdownItem>
                    </DropdownMenu>
                </>
            )}
        </CardWrapper>
    );
}