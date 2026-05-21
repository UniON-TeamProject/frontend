import React, { useState, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import Layout from "../components/organisms/Layout";
import {
  getFriends,
  getPendingInvites,
  addFriend,
  removeFriend,
  rejectFriend,
} from "../api";

const PageContainer = styled.div`
  padding: 20px 40px 100px;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 12px 12px 100px;
    min-height: calc(100dvh - 70px);
  }
`;

const StyledUserHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  min-height: 60px;

  @media (max-width: 768px) {
    margin-bottom: 10px;
    min-height: auto;
  }
`;

const BackButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.darkGrey};
  transition: color 0.2s;
  user-select: none;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  > svg {
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;

    > svg {
      margin-right: 4px;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;

  @media (max-width: 950px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  padding: 25px;
  display: flex;
  flex-direction: column;
  height: fit-content;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Badge = styled.span`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
`;

const StyledTabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightGrey};
  margin-bottom: 25px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const StyledTab = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  padding: 15px 0;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.darkGrey};
  border-bottom: 3px solid
    ${({ $active, theme }) => ($active ? theme.colors.text : "transparent")};
  transition: color 0.15s;
  margin-bottom: -2px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

const StyledSearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f4f5f7;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 10px 16px;
  margin-bottom: 20px;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;

  &:focus-within {
    background-color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  > input {
    border: none;
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    width: 100%;

    &::placeholder {
      color: #a0a0a0;
    }
  }

  > svg {
    color: #a0a0a0;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    > input {
      font-size: 16px;
    }
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.lightGrey};
    border-radius: 4px;
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.lightGrey};
  border: 1px solid transparent;
  transition: border-color 0.2s;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $bg, theme }) => $bg || theme.colors.lightGrey};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
`;

const UserName = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const ActionBtn = styled.button`
  background: ${({ $variant, theme }) =>
    $variant === "primary"
      ? theme.colors.secondary
      : $variant === "danger"
      ? theme.colors.danger
      : theme.colors.lightGrey};
  color: ${({ $variant, theme }) =>
    $variant === "primary" || $variant === "danger"
      ? "#ffffff"
      : theme.colors.text};
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: ${({ theme }) => theme.colors.darkGrey};
  font-size: 0.95rem;
`;

const AddFriendBox = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const AddFriendInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border-radius: 10px;
  border: 3px solid ${({ theme }) => theme.colors.lightGrey};
  background: #fdfdfc;
  color: ${({ theme }) => theme.colors.dark};
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
`;

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  padding: 40px 50px;
  border-radius: 25px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 90%;
    padding: 30px;
  }
`;

const ModalTitle = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 800;
`;

const Friends = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");

  const [friends, setFriends] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteFriendModal, setDeleteFriendModal] = useState({
    isOpen: false,
    friendId: null,
    username: "",
  });

  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);

    const [friendsRes, invitesRes] = await Promise.all([
      getFriends(),
      getPendingInvites(),
    ]);

    if (!friendsRes.errorCode) {
      setFriends(Array.isArray(friendsRes) ? friendsRes : []);
    } else if (friendsRes.errorCode === "TOKEN_UNDEFINED") {
      navigate("/", { replace: true });
      return;
    }

    if (!invitesRes.errorCode) {
      setPendingInvites(Array.isArray(invitesRes) ? invitesRes : []);
    }

    setIsLoading(false);
  };

  const handleAcceptInvite = async (invite) => {
    const res = await addFriend(invite.username);
    if (!res.errorCode) {
      fetchAllData();
    }
  };

  const handleRejectInvite = async (invite) => {
    const res = await rejectFriend(invite.friendId);
    if (!res.errorCode) {
      fetchAllData();
    }
  };

  const handleRemoveFriend = async (friendId) => {
    const res = await removeFriend(friendId);
    if (!res.errorCode) {
      fetchAllData();
    }
  };

  const handleSendInvite = async (userId) => {
    const res = await addFriend(userId);
    if (!res.errorCode) {
      setInfoModal({
        isOpen: true,
        message: "Wysłano zaproszenie!",
        isError: false,
      });
      setSearchQuery("");
    } else {
      setInfoModal({
        isOpen: true,
        message: res.message || "Błąd podczas wysyłania zaproszenia.",
        isError: true,
      });
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLeftContent = () => {
    if (isLoading) return <EmptyState>Ładowanie...</EmptyState>;

    //zakladka "moi znajomi"
    if (activeTab === "friends") {
      if (filteredFriends.length > 0) {
        return filteredFriends.map((friend) => (
          <UserItem key={friend.id}>
            <UserInfo>
              <Avatar>
                {friend.avatarId > 0 ? (
                  <img
                    src={`/icons/avatar${friend.avatarId}.png`}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : friend.username ? (
                  friend.username.charAt(0).toUpperCase()
                ) : (
                  "?"
                )}
              </Avatar>
              <UserName>{friend.username}</UserName>
            </UserInfo>
            <ActionBtn
              $variant="danger"
              onClick={() =>
                setDeleteFriendModal({
                  isOpen: true,
                  friendId: friend.friendId,
                  username: friend.username,
                })
              }
            >
              Usuń
            </ActionBtn>
          </UserItem>
        ));
      }
      return (
        <EmptyState>
          Brak znajomych. Przejdź do zakładki "Szukaj osób", by kogoś zaprosić!
        </EmptyState>
      );
    }

    //ZAKLADKA "DODAJ"
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <p
          style={{
            color: "#707a73",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Podaj dokładną nazwę (username) swojego znajomego, aby wysłać mu
          zaproszenie.
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <ActionBtn
            $variant="primary"
            style={{ width: "100%" }}
            disabled={!searchQuery.trim()}
            onClick={() => handleSendInvite(searchQuery.trim())}
          >
            Wyślij zaproszenie
          </ActionBtn>
        </div>
      </div>
    );
  };

  const renderRightContent = () => {
    if (isLoading) return <EmptyState>Ładowanie...</EmptyState>;

    if (pendingInvites.length > 0) {
      return pendingInvites.map((invite) => (
        <UserItem
          key={invite.id}
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "15px",
          }}
        >
          <UserInfo>
            <Avatar>
              {invite.avatarId > 0 ? (
                <img
                  src={`/icons/avatar${invite.avatarId}.png`}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : invite.username ? (
                invite.username.charAt(0).toUpperCase()
              ) : (
                "?"
              )}
            </Avatar>
            <UserName>{invite.username}</UserName>
          </UserInfo>
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <ActionBtn
              $variant="primary"
              style={{ flex: 1 }}
              onClick={() => handleAcceptInvite(invite)}
            >
              Akceptuj
            </ActionBtn>
            <ActionBtn
              $variant="secondary"
              style={{ flex: 1 }}
              onClick={() => handleRejectInvite(invite)}
            >
              Odrzuć
            </ActionBtn>
          </div>
        </UserItem>
      ));
    }

    return (
      <EmptyState style={{ padding: "10px" }}>
        Brak nowych zaproszeń.
      </EmptyState>
    );
  };

  return (
    <Layout>
      <PageContainer>
        <StyledUserHeader>
          <BackButton onClick={() => navigate("/social")}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Społeczności
          </BackButton>
        </StyledUserHeader>

        <ContentGrid>
          {/* LEWA KOLUMNA: znajomi/szukaj */}
          <SectionCard>
            <StyledTabsContainer>
              <StyledTab
                $active={activeTab === "friends"}
                onClick={() => {
                  setActiveTab("friends");
                  setSearchQuery("");
                }}
              >
                Moi znajomi ({friends.length})
              </StyledTab>
              <StyledTab
                $active={activeTab === "search"}
                onClick={() => {
                  setActiveTab("search");
                  setSearchQuery("");
                }}
              >
                Szukaj osób
              </StyledTab>
            </StyledTabsContainer>

            {activeTab === "friends" ? (
              <StyledSearchInput>
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  width="16"
                  height="16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
                <input
                  placeholder="Szukaj na liście znajomych..."
                  value={searchQuery}
                  type="text"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </StyledSearchInput>
            ) : (
              <AddFriendBox>
                <AddFriendInput
                  placeholder="Wpisz nazwę znajomego..."
                  value={searchQuery}
                  type="text"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </AddFriendBox>
            )}

            <UsersList>{renderLeftContent()}</UsersList>
          </SectionCard>

          {/* PRAWA KOLUMNA: zaproszenia oczekujace */}
          <SectionCard>
            <SectionTitle>
              Oczekujące zaproszenia
              {pendingInvites.length > 0 && (
                <Badge>{pendingInvites.length}</Badge>
              )}
            </SectionTitle>

            <UsersList>{renderRightContent()}</UsersList>
          </SectionCard>
        </ContentGrid>

        {/* MODAL USUWANIA ZNAJOMEGO */}
        {deleteFriendModal.isOpen && (
          <>
            <ModalOverlay
              onClick={() =>
                setDeleteFriendModal({ ...deleteFriendModal, isOpen: false })
              }
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <ModalTitle>Potwierdź usunięcie</ModalTitle>
              <p
                style={{
                  color: "#666",
                  marginBottom: "30px",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Czy na pewno chcesz usunąć użytkownika{" "}
                <b style={{ color: "#122818" }}>{deleteFriendModal.username}</b>{" "}
                ze swoich znajomych?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <ActionBtn
                  onClick={() =>
                    setDeleteFriendModal({
                      ...deleteFriendModal,
                      isOpen: false,
                    })
                  }
                >
                  Anuluj
                </ActionBtn>
                <ActionBtn
                  $variant="danger"
                  onClick={async () => {
                    await handleRemoveFriend(deleteFriendModal.friendId);
                    setDeleteFriendModal({
                      ...deleteFriendModal,
                      isOpen: false,
                    });
                  }}
                >
                  Usuń znajomego
                </ActionBtn>
              </div>
            </StyledPopup>
          </>
        )}

        {/* MODAL INFO O WYSŁANIU ZAPROSZENIA */}
        {infoModal.isOpen && (
          <>
            <ModalOverlay
              onClick={() =>
                setInfoModal({ isOpen: false, message: "", isError: false })
              }
            />
            <StyledPopup
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center" }}
            >
              <ModalTitle>{infoModal.isError ? "Błąd" : "Sukces"}</ModalTitle>
              <p
                style={{
                  color: infoModal.isError
                    ? theme.colors.danger || "#e74c3c"
                    : theme.colors.secondary || "#00b894",
                  marginBottom: "30px",
                  fontSize: "1.05rem",
                  fontWeight: "600",
                }}
              >
                {infoModal.message}
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ActionBtn
                  onClick={() =>
                    setInfoModal({ isOpen: false, message: "", isError: false })
                  }
                >
                  Zamknij
                </ActionBtn>
              </div>
            </StyledPopup>
          </>
        )}
      </PageContainer>
    </Layout>
  );
};

export default Friends;
