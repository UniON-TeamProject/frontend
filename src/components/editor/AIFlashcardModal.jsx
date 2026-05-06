import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  generateCardsFromNote,
  addListOfCardsToSet,
  getAllFlashcardSets,
  addFlashcardSet,
} from "../../api";
import Text from "../atoms/Text";
import FlashcardEditor from "./FlashcardEditor";

const NEW_SET = "__new__";

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

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1101;
  width: 800px;
  max-width: 94vw;
  max-height: 85vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 40px 50px;
  border-radius: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease;

  @media (max-width: 768px) {
    padding: 30px 20px;
    width: 95%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

/*
const ModalTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;
*/

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.darkGrey};
  font-size: 1.8rem;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
  flex-shrink: 0;
  z-index: 50;
`;

const SetSelectorArea = styled.div`
  flex: 1;
  position: relative;
`;

const SetSelect = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
  }
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SetDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
`;

const SetDropdownItem = styled.button`
  width: 100%;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 10px 12px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: ${({ $new }) => ($new ? "700" : "600")};
  color: ${({ $new, theme }) =>
    $new ? theme.colors.secondary : theme.colors.text};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.lightGrey : "transparent"};
  font-family: inherit;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
  }
`;

const SetNameInput = styled.input`
  width: 100%;
  margin-top: 10px;
  border: 1px solid
    ${({ $error, theme }) =>
      $error ? theme.colors.danger : theme.colors.darkGrey};
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 0.95rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${({ $error, theme }) =>
      $error ? theme.colors.danger : theme.colors.secondary};
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
`;

const ModalButton = styled.button`
  background: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 10px 25px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: ${(props) => (props.disabled ? 0.5 : 0.9)};
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.darkGrey};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.darkGrey};
  }
`;

const CenteredState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 1rem;
  text-align: center;
`;

const SpinnerSvg = styled.svg`
  animation: ${spin} 0.8s linear infinite;
  width: 40px;
  height: 40px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const CardEntry = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 12px;
  padding: 15px;
  background: ${({ theme }) => theme.colors.white};
`;

const CardRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: flex-start;
`;

const CardSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardTextarea = styled.textarea`
  border: 1px solid ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 70px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.lightGrey};
  line-height: 1.4;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.white};
  }
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.darkGrey};
  font-size: 1.5rem;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 4px;
  align-self: flex-start;
  flex-shrink: 0;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const getCardsWord = (count) => {
  if (count === 1) return "fiszkę";

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return "fiszki";
  }

  return "fiszek";
};

function AIFlashcardModal({ isOpen, onClose, noteId }) {
  const [phase, setPhase] = useState("idle"); // idle | loading | ready | saving | done | error
  const [cards, setCards] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [setName, setSetName] = useState("");
  const [debouncedSetName, setDebouncedSetName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      return;
    }
    setPhase("loading");
    setCards([]);
    setErrorMessage("");
    setSelectedSetId(null);
    setSetName("");

    getAllFlashcardSets().then((r) => {
      if (!r.errorCode) setSets(r.sets || []);
    });

    generateCardsFromNote(noteId).then((result) => {
      if (result.errorCode) {
        setPhase("error");
        setErrorMessage(result.message);
      } else {
        setCards(
          (result.cards || []).map((c) => ({
            front: c.contentFirstSide || "",
            back: c.contentFlipSide || "",
          }))
        );
        setPhase("ready");
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
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const updateCard = (index, field, value) =>
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );

  const removeCard = (index) =>
    setCards((prev) => prev.filter((_, i) => i !== index));

  const setNameConflict =
    selectedSetId === NEW_SET &&
    !!debouncedSetName.trim() &&
    sets.some(
      (s) => s.name.toLowerCase() === debouncedSetName.trim().toLowerCase()
    );

  const isReady =
    (selectedSetId !== null && selectedSetId !== NEW_SET) ||
    (selectedSetId === NEW_SET && !!setName.trim() && !setNameConflict);

  const validCards = cards.filter((c) => c.front.trim() && c.back.trim());

  const handleSave = async () => {
    if (!isReady || validCards.length === 0) return;
    setPhase("saving");

    let setId = selectedSetId;
    if (selectedSetId === NEW_SET) {
      const result = await addFlashcardSet(setName.trim());
      if (result.errorCode) {
        setPhase("ready");
        setErrorMessage(result.message);
        return;
      }
      setId = result.id;
    }

    const cardRequests = validCards.map((c) => ({
      contentFirstSide: c.front.trim(),
      contentFlipSide: c.back.trim(),
      setId: 0,
      cardTags: [],
      isForced: false,
    }));

    const result = await addListOfCardsToSet(setId, cardRequests);
    if (result.errorCode) {
      setPhase("ready");
      setErrorMessage(result.message);
    } else {
      setPhase("done");
    }
  };

  const selectedLabel =
    selectedSetId === null
      ? "Wybierz zestaw..."
      : selectedSetId === NEW_SET
      ? "+ Nowy zestaw"
      : sets.find((s) => s.id === selectedSetId)?.name || "Wybierz zestaw...";

  if (!isOpen) return null;

  const showActionBar = phase === "ready" || phase === "saving";

  return (
    <>
      <Overlay onClick={onClose} />
      <StyledPopup>
        <ModalHeader>
          <Text
            as="h2"
            bold
            text="Wygenerowane fiszki AI"
            style={{ margin: 0, fontSize: "1.5rem" }}
          />
          <CloseBtn onClick={onClose} aria-label="Zamknij">
            ×
          </CloseBtn>
        </ModalHeader>

        {showActionBar && (
          <ActionBar>
            <SetSelectorArea ref={dropdownRef}>
              <SetSelect onClick={() => setDropdownOpen((o) => !o)}>
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
                    onClick={() => {
                      setSelectedSetId(NEW_SET);
                      setDropdownOpen(false);
                    }}
                  >
                    + Nowy zestaw
                  </SetDropdownItem>
                  {sets.map((s) => (
                    <SetDropdownItem
                      key={s.id}
                      $active={selectedSetId === s.id}
                      onClick={() => {
                        setSelectedSetId(s.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {s.name}
                    </SetDropdownItem>
                  ))}
                </SetDropdown>
              )}

              {selectedSetId === NEW_SET && (
                <>
                  <SetNameInput
                    placeholder="Wpisz nazwę nowego zestawu..."
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                    $error={setNameConflict}
                  />
                  {setNameConflict && (
                    <ErrorMsg>Zestaw o tej nazwie już istnieje</ErrorMsg>
                  )}
                </>
              )}
              {errorMessage && <ErrorMsg>{errorMessage}</ErrorMsg>}
            </SetSelectorArea>

            <ModalButton
              $primary
              disabled={
                !isReady || validCards.length === 0 || phase === "saving"
              }
              onClick={handleSave}
            >
              {phase === "saving"
                ? "Zapisywanie..."
                : `Zapisz ${validCards.length} ${getCardsWord(
                    validCards.length
                  )}`}
            </ModalButton>
          </ActionBar>
        )}

        <ModalContent>
          {phase === "loading" && (
            <CenteredState>
              <SpinnerSvg fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="40 20"
                />
              </SpinnerSvg>
              Generowanie fiszek z dokumentu...
            </CenteredState>
          )}

          {phase === "error" && (
            <CenteredState>
              <ErrorText>
                {errorMessage || "Wystąpił błąd podczas generowania fiszek."}
              </ErrorText>
            </CenteredState>
          )}

          {phase === "done" && (
            <CenteredState>
              <SuccessText>
                Fiszki zostały pomyślnie dodane do zestawu!
              </SuccessText>
              <ModalButton onClick={onClose} style={{ marginTop: "20px" }}>
                Zamknij
              </ModalButton>
            </CenteredState>
          )}

          {(phase === "ready" || phase === "saving") &&
            cards.map((card, index) => (
              <CardEntry key={index}>
                <CardRow>
                  <CardSide>
                    <CardLabel>Przód fiszki:</CardLabel>
                    <FlashcardEditor
                      value={card.front}
                      placeholder="Wpisz pytanie lub użyj '/'..."
                      onChange={(val) => updateCard(index, "front", val)}
                    />
                  </CardSide>
                  <CardSide>
                    <CardLabel>Tył fiszki:</CardLabel>
                    <FlashcardEditor
                      value={card.back}
                      placeholder="Wpisz odpowiedź lub użyj '/'..."
                      onChange={(val) => updateCard(index, "back", val)}
                    />
                  </CardSide>
                  <RemoveBtn
                    onClick={() => removeCard(index)}
                    aria-label="Usuń fiszkę"
                  >
                    ×
                  </RemoveBtn>
                </CardRow>
              </CardEntry>
            ))}
        </ModalContent>
      </StyledPopup>
    </>
  );
}

export default AIFlashcardModal;
