import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { generateCardsFromNote, addListOfCardsToSet, getAllFlashcardSets, addFlashcardSet } from '../../api';

const NEW_SET = '__new__';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, calc(-50% + 8px)); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1100;
`;

const ModalBox = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1101;
  width: min(860px, 94vw);
  max-height: 85vh;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalHeader = styled.div`
  padding: 18px 24px 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1.4rem;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  &:hover { background: ${({ theme }) => theme.colors.lightGrey}; color: ${({ theme }) => theme.colors.text}; }
`;


const ActionBar = styled.div`
  padding: 14px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
`;

const SetSelectorArea = styled.div`
  flex: 1;
  position: relative;
`;

const SetSelect = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.secondary}; }
  svg { width: 12px; height: 12px; flex-shrink: 0; color: ${({ theme }) => theme.colors.textLight}; }
`;

const SetDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  padding: 3px;
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
`;

const SetDropdownItem = styled.button`
  width: 100%;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  padding: 8px 12px;
  text-align: left;
  font-size: 0.88rem;
  font-weight: ${({ $new }) => $new ? '700' : '500'};
  color: ${({ $new, theme }) => $new ? theme.colors.secondary : theme.colors.text};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.white};
  font-family: inherit;
  &:hover { background: ${({ theme }) => theme.colors.primary}; }
`;

const SetNameInput = styled.input`
  width: 100%;
  margin-top: 8px;
  border: 1px solid ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.darkGrey};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.88rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.secondary}; }
`;

const ErrorMsg = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.danger};
  margin: 4px 0 0 0;
`;

const SaveBtn = styled.button`
  white-space: nowrap;
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  background: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.white};
  transition: opacity 0.15s;
  align-self: flex-start;
`;


const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CenteredState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.95rem;
  text-align: center;
`;

const SpinnerSvg = styled.svg`
  animation: ${spin} 0.8s linear infinite;
  width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.95rem;
  margin: 0;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const CloseAfterDoneBtn = styled.button`
  margin-top: 8px;
  padding: 9px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.white};
`;

const CardEntry = styled.div`
  border: 1.5px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 12px;
  padding: 14px;
  background: ${({ theme }) => theme.colors.white};
`;

const CardRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const CardSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const CardTextarea = styled.textarea`
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.88rem;
  resize: vertical;
  min-height: 68px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  line-height: 1.4;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.secondary}; background: ${({ theme }) => theme.colors.white}; }
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.darkGrey};
  font-size: 1.3rem;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  align-self: flex-start;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.danger}; }
`;

function AIFlashcardModal({ isOpen, onClose, noteId }) {
  const [phase, setPhase] = useState('idle'); // idle | loading | ready | saving | done | error
  const [cards, setCards] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [setName, setSetName] = useState('');
  const [debouncedSetName, setDebouncedSetName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) { setPhase('idle'); return; }
    setPhase('loading');
    setCards([]);
    setErrorMessage('');
    setSelectedSetId(null);
    setSetName('');

    getAllFlashcardSets().then(r => { if (!r.errorCode) setSets(r.sets || []); });

    generateCardsFromNote(noteId).then(result => {
      if (result.errorCode) {
        setPhase('error');
        setErrorMessage(result.message);
      } else {
        setCards((result.cards || []).map(c => ({
          front: c.contentFirstSide || '',
          back: c.contentFlipSide || '',
        })));
        setPhase('ready');
      }
    });
  }, [isOpen, noteId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSetName(setName), 400);
    return () => clearTimeout(t);
  }, [setName]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const updateCard = (index, field, value) =>
    setCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));

  const removeCard = (index) =>
    setCards(prev => prev.filter((_, i) => i !== index));

  const setNameConflict = selectedSetId === NEW_SET && !!debouncedSetName.trim() &&
    sets.some(s => s.name.toLowerCase() === debouncedSetName.trim().toLowerCase());

  const isReady =
    (selectedSetId !== null && selectedSetId !== NEW_SET) ||
    (selectedSetId === NEW_SET && !!setName.trim() && !setNameConflict);

  const validCards = cards.filter(c => c.front.trim() && c.back.trim());

  const handleSave = async () => {
    if (!isReady || validCards.length === 0) return;
    setPhase('saving');

    let setId = selectedSetId;
    if (selectedSetId === NEW_SET) {
      const result = await addFlashcardSet(setName.trim());
      if (result.errorCode) {
        setPhase('ready');
        setErrorMessage(result.message);
        return;
      }
      setId = result.id;
    }

    const cardRequests = validCards.map(c => ({
      contentFirstSide: c.front.trim(),
      contentFlipSide: c.back.trim(),
      setId: 0,
      cardTags: [],
      isForced: false,
    }));

    const result = await addListOfCardsToSet(setId, cardRequests);
    if (result.errorCode) {
      setPhase('ready');
      setErrorMessage(result.message);
    } else {
      setPhase('done');
    }
  };

  const selectedLabel =
    selectedSetId === null ? 'Wybierz zestaw...' :
      selectedSetId === NEW_SET ? '+ Nowy zestaw' :
        (sets.find(s => s.id === selectedSetId)?.name || 'Wybierz zestaw...');

  if (!isOpen) return null;

  const showActionBar = phase === 'ready' || phase === 'saving';

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalBox>

        <ModalHeader>
          <ModalTitle>Wygenerowane fiszki AI</ModalTitle>
          <CloseBtn onClick={onClose} aria-label="Zamknij">×</CloseBtn>
        </ModalHeader>

        {showActionBar && (
          <ActionBar>
            <SetSelectorArea ref={dropdownRef}>
              <SetSelect onClick={() => setDropdownOpen(o => !o)}>
                {selectedLabel}
                <svg fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
                </svg>
              </SetSelect>

              {dropdownOpen && (
                <SetDropdown>
                  <SetDropdownItem
                    $new
                    $active={selectedSetId === NEW_SET}
                    onClick={() => { setSelectedSetId(NEW_SET); setDropdownOpen(false); }}
                  >
                    + Nowy zestaw
                  </SetDropdownItem>
                  {sets.map(s => (
                    <SetDropdownItem
                      key={s.id}
                      $active={selectedSetId === s.id}
                      onClick={() => { setSelectedSetId(s.id); setDropdownOpen(false); }}
                    >
                      {s.name}
                    </SetDropdownItem>
                  ))}
                </SetDropdown>
              )}

              {selectedSetId === NEW_SET && (
                <>
                  <SetNameInput
                    placeholder="Nazwa nowego zestawu"
                    value={setName}
                    onChange={e => setSetName(e.target.value)}
                    $error={setNameConflict}
                  />
                  {setNameConflict && <ErrorMsg>Zestaw o tej nazwie już istnieje</ErrorMsg>}
                </>
              )}
              {errorMessage && <ErrorMsg>{errorMessage}</ErrorMsg>}
            </SetSelectorArea>

            <SaveBtn
              disabled={!isReady || validCards.length === 0 || phase === 'saving'}
              onClick={handleSave}
            >
              {phase === 'saving' ? 'Zapisywanie...' : `Dodaj ${validCards.length} fiszek`}
            </SaveBtn>
          </ActionBar>
        )}

        <ModalContent>
          {phase === 'loading' && (
            <CenteredState>
              <SpinnerSvg fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
              </SpinnerSvg>
              Generowanie fiszek z dokumentu...
            </CenteredState>
          )}

          {phase === 'error' && (
            <CenteredState>
              <ErrorText>{errorMessage || 'Wystąpił błąd podczas generowania fiszek.'}</ErrorText>
            </CenteredState>
          )}

          {phase === 'done' && (
            <CenteredState>
              <SuccessText>Fiszki zostały dodane do zestawu!</SuccessText>
              <CloseAfterDoneBtn onClick={onClose}>Zamknij</CloseAfterDoneBtn>
            </CenteredState>
          )}

          {(phase === 'ready' || phase === 'saving') && cards.map((card, index) => (
            <CardEntry key={index}>
              <CardRow>
                <CardSide>
                  <CardLabel>Przód:</CardLabel>
                  <CardTextarea
                    value={card.front}
                    placeholder="Przód fiszki"
                    onChange={e => updateCard(index, 'front', e.target.value)}
                  />
                </CardSide>
                <CardSide>
                  <CardLabel>Tył:</CardLabel>
                  <CardTextarea
                    value={card.back}
                    placeholder="Tył fiszki"
                    onChange={e => updateCard(index, 'back', e.target.value)}
                  />
                </CardSide>
                <RemoveBtn onClick={() => removeCard(index)} aria-label="Usuń fiszkę">
                  <svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                  </svg>
                </RemoveBtn>
              </CardRow>
            </CardEntry>
          ))}
        </ModalContent>

      </ModalBox>
    </>
  );
}

export default AIFlashcardModal;
