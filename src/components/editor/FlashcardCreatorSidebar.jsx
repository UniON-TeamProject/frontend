import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { addCard, addFlashcardSet, getAllFlashcardSets, editCard, deleteCard } from '../../api';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 340px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  z-index: 200;
  transform: translateX(${({ $open }) => ($open ? '0' : '100%')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const SidebarTitle = styled.h2`
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
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
  }
  svg { width: 18px; height: 18px; }
`;

const SidebarPlaceholder = styled.p`
  color: ${({ theme }) => theme.colors.darkGrey};
  font-size: 0.85rem;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const SetSelectWrapper = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

const SetSelect = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.85rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.white};
  }
  svg { width: 12px; height: 12px; flex-shrink: 0; color: ${({ theme }) => theme.colors.textLight}; }
`;

const SetDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 10px;
  padding: 3px;
  display: flex;
  flex-direction: column;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
  z-index: 30;
  color: ${({ theme }) => theme.colors.text};
`;

const SetDropdownItem = styled.button`
  border: none;
  border-radius: 7px;
  cursor: pointer;
  padding: 7px 10px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: ${({ $new }) => $new ? '700' : '500'};
  color: ${({ $new, theme }) => $new ? theme.colors.secondary : theme.colors.text};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.white};
  width: 100%;
  &:hover { background: ${({ theme }) => theme.colors.primary}; }
`;

const SetNameInput = styled.input`
  width: 100%;
  border: 1px solid ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.darkGrey};
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.85rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  box-sizing: border-box;
  margin-bottom: 4px;
  &:focus {
    outline: none;
    border-color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.secondary};
    background: ${({ theme }) => theme.colors.white};
  }
`;

const NoSetHint = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px 20px;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.5;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.lightGrey};
  margin: 12px 0 0 0;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FlashcardEntry = styled.div`
  border: 1.5px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.colors.white};
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

const FlashcardLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex: 1;
`;

const SpinnerSvg = styled.svg`
  animation: ${spin} 0.8s linear infinite;
  width: 14px;
  height: 14px;
  color: ${({ theme }) => theme.colors.secondary};
  flex-shrink: 0;
`;

const CheckSvg = styled.svg`
  width: 14px;
  height: 14px;
  color: ${({ theme }) => theme.colors.success};
  flex-shrink: 0;
`;

const RemoveCardBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.darkGrey};
  padding: 2px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.danger}; }
  svg { width: 14px; height: 14px; }
`;

const FlashcardInput = styled.textarea`
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.85rem;
  resize: none;
  min-height: 56px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  line-height: 1.4;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.white};
  }
`;

const FieldSeparator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.lightGrey};
  margin: 2px 0;
`;

const CardErrorMessage = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.danger};
  margin: 2px 0 0 0;
`;

const AddButtonRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: 2px dashed ${({ theme }) => theme.colors.darkGrey};
  border-radius: 12px;
  margin-top: 4px;
`;

const AddCardButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.darkGrey};
  background: none;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;
  padding: 0;
  transition: border-color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
`;

const Tag = styled.div`
  padding: 2px 10px;
  margin: 3px;
  background-color: ${({ $inactive, theme }) => $inactive ? theme.colors.darkGrey : theme.colors.secondary};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  font-size: 0.8rem;
  display: flex;
  flex-flow: row nowrap;
  cursor: ${({ $inactive }) => $inactive ? 'pointer' : 'default'};
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

const TagInput = styled.input`
  padding: 2px 10px;
  margin: 3px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 80px;
  font-size: 0.8rem;
  font-family: inherit;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const AddTagBtn = styled.div`
  padding: 2px 10px;
  margin: 0 3px;
  background-color: ${({ theme }) => theme.colors.darkGrey};
  border-radius: 7px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  cursor: pointer;
`;

const TagsSection = styled.div`
  margin-bottom: 4px;
`;

const TagsSectionLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const GlobalStatus = styled.div`
  padding: 10px 20px 16px 20px;
  flex-shrink: 0;
  font-size: 0.82rem;
  color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.success};
  text-align: center;
`;

function SaveStatusIcon({ status }) {
  if (status === 'saving') {
    return (
      <SpinnerSvg fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
      </SpinnerSvg>
    );
  }
  if (status === 'saved') {
    return (
      <CheckSvg fill="none" viewBox="0 0 16 16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2.5 8.5l3.5 3.5 7-7" />
      </CheckSvg>
    );
  }
  return null;
}

const NEW_SET = '__new__';
const DEBOUNCE_MS = 1000;

function FlashcardCreatorSidebar({ isOpen, onClose, flashcards, setFlashcards, suggestedTags = [] }) {
  const [setName, setSetName] = useState('');
  const [debouncedSetName, setDebouncedSetName] = useState('');
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(NEW_SET);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cardMeta, setCardMeta] = useState([]);
  const [globalStatus, setGlobalStatus] = useState(null);
  const [globalTags, setGlobalTags] = useState([]);
  const [isAddingGlobalTag, setIsAddingGlobalTag] = useState(false);
  const [newGlobalTag, setNewGlobalTag] = useState('');
  const [cardTags, setCardTags] = useState([]);
  const [addingCardTagIndex, setAddingCardTagIndex] = useState(null);
  const [newCardTag, setNewCardTag] = useState('');

  const flashcardsRef = useRef(flashcards);
  const cardMetaRef = useRef(cardMeta);
  const selectedSetIdRef = useRef(selectedSetId);
  const setNameRef = useRef(setName);
  const resolvedSetIdRef = useRef(null);
  const saveTimeouts = useRef({});
  const dropdownRef = useRef(null);
  const globalTagsRef = useRef(globalTags);
  const cardTagsRef = useRef(cardTags);

  useEffect(() => { flashcardsRef.current = flashcards; }, [flashcards]);
  useEffect(() => { cardMetaRef.current = cardMeta; }, [cardMeta]);
  useEffect(() => {
    globalTagsRef.current = globalTags;
    // Re-save all existing cards when global tags change
    flashcardsRef.current.forEach((card, index) => {
      const meta = cardMetaRef.current[index];
      if (meta?.id && (card.front.trim() || card.back.trim())) {
        scheduleAutoSave(index);
      }
    });
  }, [globalTags]);
  useEffect(() => { cardTagsRef.current = cardTags; }, [cardTags]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSetName(setName), 600);
    return () => clearTimeout(t);
  }, [setName]);
  useEffect(() => {
    setNameRef.current = setName;
    setGlobalStatus(null);
    if (!setName.trim() || selectedSetIdRef.current !== NEW_SET) return;
    resolvedSetIdRef.current = null;
    flashcardsRef.current.forEach((card, index) => {
      const meta = cardMetaRef.current[index];
      if ((card.front.trim() || card.back.trim()) && !meta?.id)
        scheduleAutoSave(index);
    });
  }, [setName]);

  // Sync cardMeta and cardTags length with flashcards
  useEffect(() => {
    setCardMeta(prev => {
      if (prev.length === flashcards.length) return prev;
      if (flashcards.length > prev.length) {
        const extra = Array(flashcards.length - prev.length).fill(null).map(() => ({ id: null, status: 'idle', error: null }));
        return [...prev, ...extra];
      }
      return prev.slice(0, flashcards.length);
    });
    setCardTags(prev => {
      if (prev.length === flashcards.length) return prev;
      if (flashcards.length > prev.length) {
        const extra = Array(flashcards.length - prev.length).fill(() => []).map(() => []);
        return [...prev, ...extra];
      }
      return prev.slice(0, flashcards.length);
    });
  }, [flashcards.length]);

  // Trigger auto-save when flashcards change from outside (e.g. "Zapisz jako przód/tył")
  useEffect(() => {
    flashcards.forEach((card, index) => {
      if (card.front.trim() || card.back.trim()) {
        scheduleAutoSave(index);
      }
    });
  }, [flashcards]);

  // Load sets on open
  useEffect(() => {
    if (!isOpen) return;
    getAllFlashcardSets().then(result => {
      if (!result.errorCode) setSets(result.sets || []);
    });
  }, [isOpen]);

  // When switching to a different existing set — clear flashcards and reset
  const handleSelectSet = (id) => {
    if (id === selectedSetId) { setDropdownOpen(false); return; }
    Object.values(saveTimeouts.current).forEach(clearTimeout);
    saveTimeouts.current = {};
    setFlashcards([]);
    setCardMeta([]);
    setCardTags([]);
    setGlobalTags([]);
    setIsAddingGlobalTag(false);
    setNewGlobalTag('');
    resolvedSetIdRef.current = null;
    setGlobalStatus(null);
    setSelectedSetId(id);
    selectedSetIdRef.current = id;
    setDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const isSetReady = () =>
    selectedSetIdRef.current !== NEW_SET || !!setNameRef.current.trim();

  const getOrCreateSetId = async () => {
    const setId = selectedSetIdRef.current;
    if (setId !== NEW_SET) return setId;
    if (resolvedSetIdRef.current) return resolvedSetIdRef.current;
    const name = setNameRef.current.trim();
    if (!name) return null;
    const result = await addFlashcardSet(name);
    if (result.errorCode) {
      setGlobalStatus({ error: true, message: `Błąd tworzenia zestawu: ${result.message}` });
      return null;
    }
    resolvedSetIdRef.current = result.id;
    getAllFlashcardSets().then(r => { if (!r.errorCode) setSets(r.sets || []); });
    return result.id;
  };

  const scheduleAutoSave = (index) => {
    if (saveTimeouts.current[index]) clearTimeout(saveTimeouts.current[index]);
    saveTimeouts.current[index] = setTimeout(() => autoSave(index), DEBOUNCE_MS);
  };

  const autoSave = async (index) => {
    const card = flashcardsRef.current[index];
    if (!card || (!card.front.trim() && !card.back.trim())) return;
    if (!isSetReady()) return;

    const setId = await getOrCreateSetId();
    if (!setId) {
      setCardMeta(prev => prev.map((m, i) => i === index ? { ...m, status: 'idle' } : m));
      return;
    }

    setCardMeta(prev => prev.map((m, i) => i === index ? { ...m, status: 'saving', error: null } : m));

    const mergedTags = [...new Set([...globalTagsRef.current, ...(cardTagsRef.current[index] || [])])];
    const meta = cardMetaRef.current[index];
    let result;
    if (meta?.id) {
      result = await editCard(meta.id, card.front.trim(), card.back.trim(), setId, mergedTags);
    } else {
      result = await addCard(card.front.trim(), card.back.trim(), setId, mergedTags);
    }

    if (result.errorCode === 'INVALID_DATA') {
      setCardMeta(prev => prev.map((m, i) => i === index ? { ...m, status: 'error', error: 'Ta fiszka już istnieje w zestawie' } : m));
    } else if (result.errorCode) {
      setCardMeta(prev => prev.map((m, i) => i === index ? { ...m, status: 'error', error: result.message || 'Błąd zapisu' } : m));
    } else {
      const newId = result.id ?? cardMetaRef.current[index]?.id;
      setCardMeta(prev => prev.map((m, i) => i === index ? { ...m, id: newId, status: 'saved', error: null } : m));
      setGlobalStatus(null);
    }
  };

  const addEmptyCard = () => {
    setFlashcards(prev => [...prev, { front: '', back: '' }]);
    setCardMeta(prev => [...prev, { id: null, status: 'idle', error: null }]);
    setCardTags(prev => [...prev, []]);
  };

  const updateCard = (index, field, value) => {
    setFlashcards(prev => prev.map((card, i) => i === index ? { ...card, [field]: value } : card));
    setCardMeta(prev => prev.map((m, i) => i === index ? { ...m, status: 'idle', error: null } : m));
    scheduleAutoSave(index);
  };

  const removeCard = async (index) => {
    const meta = cardMeta[index];
    if (saveTimeouts.current[index]) clearTimeout(saveTimeouts.current[index]);
    if (meta?.id) await deleteCard(meta.id);
    setFlashcards(prev => prev.filter((_, i) => i !== index));
    setCardMeta(prev => prev.filter((_, i) => i !== index));
    setCardTags(prev => prev.filter((_, i) => i !== index));
  };

  const setNameConflict = selectedSetId === NEW_SET && !resolvedSetIdRef.current && !!debouncedSetName.trim() &&
    sets.some(s => s.name.toLowerCase() === debouncedSetName.trim().toLowerCase());
  const setReady = (selectedSetId !== NEW_SET || !!setName.trim()) && !setNameConflict;

  const selectedLabel = selectedSetId === NEW_SET
    ? '+ Nowy zestaw'
    : (sets.find(s => s.id === selectedSetId)?.name || 'Wybierz zestaw');

  return (
    <SidebarContainer $open={isOpen}>
      <SidebarHeader>
        <HeaderRow>
          <SidebarTitle>Kreator fiszek</SidebarTitle>
          <CloseBtn onClick={onClose} aria-label="Zamknij kreator">
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
          </CloseBtn>
        </HeaderRow>
        <SidebarPlaceholder>
          Dodaj fiszkę za pomocą +, lub zaznacz odpowiedni fragment
        </SidebarPlaceholder>

        <SetSelectWrapper ref={dropdownRef}>
          <SetSelect onClick={() => setDropdownOpen(o => !o)}>
            {selectedLabel}
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
            </svg>
          </SetSelect>
          {dropdownOpen && (
            <SetDropdownMenu>
              <SetDropdownItem
                $new
                $active={selectedSetId === NEW_SET}
                onClick={() => handleSelectSet(NEW_SET)}
              >
                + Nowy zestaw
              </SetDropdownItem>
              {sets.map(s => (
                <SetDropdownItem
                  key={s.id}
                  $active={selectedSetId === s.id}
                  onClick={() => handleSelectSet(s.id)}
                >
                  {s.name}
                </SetDropdownItem>
              ))}
            </SetDropdownMenu>
          )}
        </SetSelectWrapper>

        {selectedSetId === NEW_SET && (
          <>
            <SetNameInput
              placeholder="Nazwa nowego zestawu"
              value={setName}
              onChange={e => setSetName(e.target.value)}
              $error={setNameConflict}
            />
            {setNameConflict && (
              <CardErrorMessage style={{ marginTop: '-8px', marginBottom: '8px' }}>
                Zestaw o tej nazwie już istnieje
              </CardErrorMessage>
            )}
          </>
        )}

        <Divider />

        {setReady && (
          <TagsSection style={{ padding: '10px 20px 0 20px' }}>
            <TagsSectionLabel>Tagi wspólne (dla wszystkich fiszek)</TagsSectionLabel>
            <TagsRow style={{ marginTop: '6px' }}>
              {globalTags.map((tag, i) => (
                <Tag key={`g-${i}`}>
                  {tag}
                  <div onClick={() => setGlobalTags(prev => prev.filter((_, idx) => idx !== i))}>x</div>
                </Tag>
              ))}
              {suggestedTags.filter(t => !globalTags.includes(t)).map((tag, i) => (
                <Tag $inactive key={`s-${i}`} onClick={() => setGlobalTags(prev => [...prev, tag])}>
                  {tag}
                </Tag>
              ))}
              {isAddingGlobalTag ? (
                <TagInput
                  autoFocus
                  value={newGlobalTag}
                  onChange={e => setNewGlobalTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newGlobalTag.trim()) {
                      if (!globalTags.includes(newGlobalTag.trim())) {
                        setGlobalTags(prev => [...prev, newGlobalTag.trim()]);
                      }
                      setNewGlobalTag('');
                      setIsAddingGlobalTag(false);
                    }
                    if (e.key === 'Escape') {
                      setNewGlobalTag('');
                      setIsAddingGlobalTag(false);
                    }
                  }}
                  onBlur={() => { setNewGlobalTag(''); setIsAddingGlobalTag(false); }}
                />
              ) : (
                <AddTagBtn onClick={() => setIsAddingGlobalTag(true)}>+</AddTagBtn>
              )}
            </TagsRow>
          </TagsSection>
        )}
      </SidebarHeader>

      {!setReady ? (
        <NoSetHint>
          <svg fill="currentColor" viewBox="0 0 16 16" width="32" height="32" style={{ opacity: 0.35 }}>
            <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
            <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8m0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
          </svg>
          Wybierz istniejący zestaw lub podaj nazwę nowego, żeby zacząć dodawać fiszki.
        </NoSetHint>
      ) : (
        <ScrollArea>
          {flashcards.map((card, index) => (
            <FlashcardEntry key={index}>
              <EntryHeader>
                <FlashcardLabel>Przód fiszki</FlashcardLabel>
                <SaveStatusIcon status={cardMeta[index]?.status} />
                <RemoveCardBtn onClick={() => removeCard(index)} aria-label="Usuń fiszkę">
                  <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                  </svg>
                </RemoveCardBtn>
              </EntryHeader>
              <FlashcardInput
                value={card.front}
                placeholder="Przód fiszki"
                onChange={e => updateCard(index, 'front', e.target.value)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              />
              <FieldSeparator />
              <FlashcardLabel>Tył fiszki</FlashcardLabel>
              <FlashcardInput
                value={card.back}
                placeholder="Tył fiszki"
                onChange={e => updateCard(index, 'back', e.target.value)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              />
              <FieldSeparator />
              <TagsSectionLabel>Tagi fiszki</TagsSectionLabel>
              <TagsRow>
                {(cardTags[index] || []).map((tag, ti) => (
                  <Tag key={ti}>
                    {tag}
                    <div onClick={() => {
                      setCardTags(prev => prev.map((tags, i) => i === index ? tags.filter((_, idx) => idx !== ti) : tags));
                      scheduleAutoSave(index);
                    }}>x</div>
                  </Tag>
                ))}
                {addingCardTagIndex === index ? (
                  <TagInput
                    autoFocus
                    value={newCardTag}
                    onChange={e => setNewCardTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newCardTag.trim()) {
                        const tag = newCardTag.trim();
                        setCardTags(prev => prev.map((tags, i) => i === index ? (tags.includes(tag) ? tags : [...tags, tag]) : tags));
                        setNewCardTag('');
                        setAddingCardTagIndex(null);
                        scheduleAutoSave(index);
                      }
                      if (e.key === 'Escape') {
                        setNewCardTag('');
                        setAddingCardTagIndex(null);
                      }
                    }}
                    onBlur={() => { setNewCardTag(''); setAddingCardTagIndex(null); }}
                  />
                ) : (
                  <AddTagBtn onClick={() => { setAddingCardTagIndex(index); setNewCardTag(''); }}>+</AddTagBtn>
                )}
              </TagsRow>
              {cardMeta[index]?.error && <CardErrorMessage>{cardMeta[index].error}</CardErrorMessage>}
            </FlashcardEntry>
          ))}

          <AddButtonRow>
            <AddCardButton onClick={addEmptyCard} aria-label="Dodaj fiszkę">+</AddCardButton>
          </AddButtonRow>
        </ScrollArea>
      )}

      {globalStatus && (
        <GlobalStatus $error={globalStatus.error}>{globalStatus.message}</GlobalStatus>
      )}
    </SidebarContainer>
  );
}

export default FlashcardCreatorSidebar;
