import React, { useState, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";

const CardWrapper = styled.div`
  perspective: 1000px;
  width: 325px;
  height: 325px;
  position: relative;
  margin: 10px;
  z-index: ${({ $menuOpen }) => ($menuOpen ? 10 : 0)};
  touch-action: pan-y pinch-zoom;

  @media (max-width: 768px) {
    width: 100%;
    height: 325px;
    min-height: 200px;
    margin: 0 auto;
  }
`;

const CardInner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  transform: ${(props) => (props.$isFlipped ? "rotateY(180deg)" : "none")};
  cursor: pointer;
  -webkit-transform-style: preserve-3d;
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
`;

const CardContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 55px 35px 35px 35px;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior-y: auto;

  white-space: pre-wrap;
  overflow-wrap: anywhere;

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.secondary}
    transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    -webkit-overflow-scrolling: auto;
    touch-action: auto;
  }

  .inner-content {
    margin: auto 0;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  p {
    margin: 0.5em 0;
    word-break: break-word;
  }

  ul {
    list-style-type: disc;
    list-style-position: outside;
    padding-left: 1.5rem;
    text-align: left;
    margin: 0.5em 0;
    width: 100%;
    align-self: stretch;
  }

  ol {
    list-style-type: decimal;
    list-style-position: outside;
    padding-left: 1.5rem;
    text-align: left;
    margin: 0.5em 0;
    width: 100%;
    align-self: stretch;
  }

  li {
    display: list-item;
    margin: 0.25em 0;
    text-align: left;
  }

  li p {
    margin: 0;
  }

  code {
    background-color: ${({ theme }) => theme.colors.borderLight};
    padding: 2px 5px;
    border-radius: 4px;
    font-family: monospace;
  }
  pre {
    background-color: ${({ theme }) => theme.colors.dark};
    color: ${({ theme }) => theme.colors.white};
    padding: 10px;
    border-radius: 8px;
    text-align: left;
    width: 100%;
    overflow-x: auto;
  }
  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.secondary};
    padding-left: 10px;
    font-style: italic;
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

  color: ${({ theme }) => theme.colors.textMuted};

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 45px;
  right: 10px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 10px;
  z-index: 20;
  width: 260px;
  display: flex;
  flex-direction: column;
  text-align: left;
  cursor: default;
`;

const DropdownItem = styled.button`
  padding: 10px 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;

  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;

  &.danger {
    color: ${({ theme }) => theme.colors.danger};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const DropdownSectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
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
  justify-content: flex-start;
  gap: 6px;
  margin-bottom: 10px;
`;

const StyledTag = styled.div`
  padding: 4px 10px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  font-size: 0.8rem;
  display: flex;
  flex-flow: row nowrap;

  > div {
    cursor: pointer;
    font-weight: 700;
    margin-left: 6px;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.7;
    }
  }
`;

const StyledTagInput = styled.input`
  padding: 4px 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 90px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const StyledAddTagButton = styled.div`
  padding: 4px 12px;
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.text};
  }
`;

const SelectCircle = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.secondary : theme.colors.darkGrey};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.secondary : theme.colors.white};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    color: ${({ theme }) => theme.colors.white};
    width: 14px;
    height: 14px;
    opacity: ${({ $isSelected }) => ($isSelected ? 1 : 0)};
  }
`;

const EllipsisIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
);

export default function Flashcard({
  card,
  question,
  answer,
  onEdit,
  onDelete,
  onTagAdd,
  onTagRemove,
  isSelectMode,
  isSelected,
  onToggleSelect,
  isReadOnly
}) {
  const theme = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsAddingTag(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <CardWrapper $menuOpen={isMenuOpen}>
      {/* KÓŁKO ZAZNACZANIA */}
      {isSelectMode && (
        <SelectCircle
          $isSelected={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </SelectCircle>
      )}

      <CardInner
        $isFlipped={isFlipped}
        onClick={() =>
          isSelectMode ? onToggleSelect() : setIsFlipped(!isFlipped)
        }
      >
        <CardFace>
          <CardContent>
            <div
              className="inner-content"
              dangerouslySetInnerHTML={{ __html: question }}
            />
          </CardContent>
        </CardFace>
        <CardBack>
          <CardContent>
            <div
              className="inner-content"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </CardContent>
        </CardBack>
      </CardInner>

            {!isReadOnly && (
                <div ref={menuRef}>
                    <OptionsButton onClick={(e) => {
                        e.stopPropagation();
                        if (!isMenuOpen) {
                            setIsAddingTag(false);
                            setNewTag("");
                        }
                        setIsMenuOpen(!isMenuOpen);
                    }}>
                        <EllipsisIcon />
                    </OptionsButton>

                    {isMenuOpen && (
                        <DropdownMenu onClick={(e) => e.stopPropagation()}>
                            <DropdownItem onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit(); }}>
                                <svg fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" /></svg>
                                Edytuj fiszkę
                            </DropdownItem>

                            <div style={{ padding: '0 12px' }}>
                                <DropdownSectionLabel>Tagi</DropdownSectionLabel>
                                <TagsContainer>
                                    {card?.cardTags?.map((tag, idx) => (
                                        <StyledTag key={idx}>
                                            {tag}
                                            <div onClick={(e) => { e.stopPropagation(); onTagRemove(card, tag); }}>x</div>
                                        </StyledTag>
                                    ))}
                                    
                                    {isAddingTag ? (
                                        <StyledTagInput
                                            autoFocus
                                            value={newTag}
                                            onChange={e => setNewTag(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && newTag.trim()) {
                                                    onTagAdd(card, newTag.trim());
                                                    setNewTag('');
                                                    setIsAddingTag(false);
                                                }
                                                if (e.key === 'Escape') {
                                                    setIsAddingTag(false);
                                                    setNewTag('');
                                                }
                                            }}
                                            onBlur={() => { setIsAddingTag(false); setNewTag(''); }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        <StyledAddTagButton onClick={(e) => { e.stopPropagation(); setIsAddingTag(true); }}>
                                            + Dodaj
                                        </StyledAddTagButton>
                                    )}
                                </TagsContainer>
                            </div>

                            <div style={{ height: '1px', background: '#eee', margin: '5px 0' }}></div>

                            <DropdownItem className="danger" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete(); }}>
                                <svg fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" /></svg>
                                Usuń fiszkę
                            </DropdownItem>
                        </DropdownMenu>
                    )}
                </div>
            )}
        </CardWrapper>
    );
}
