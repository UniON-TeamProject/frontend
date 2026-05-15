import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  acceptDirectGroupInvitation,
  declineDirectGroupInvitation,
} from "../../api";

const DropdownContainer = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  width: 420px;
  background: ${({ theme }) => theme.colors?.white};
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ theme }) => theme.colors?.lightGrey};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 450px) {
    width: 300px;
  }
`;

const Header = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.lightGrey};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors?.lightGrey}30;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors?.text};
`;

const ActionLinks = styled.div`
  display: flex;
  gap: 12px;
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors?.secondary};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationsList = styled.div`
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 4px;
  }
`;

const NotificationItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.lightGrey};
  background: ${({ $isRead, theme }) =>
    $isRead ? "transparent" : theme.colors?.lightGrey + "50"};
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  gap: 15px;

  &:hover {
    background: ${({ theme }) => theme.colors?.lightGrey};
  }
`;

const UnreadDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors?.secondary};
  flex-shrink: 0;
  margin-top: 5px;
  display: ${({ $visible }) => ($visible ? "block" : "none")};
`;

const Content = styled.div`
  flex: 1;
`;

const Message = styled.p`
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text};
  line-height: 1.4;
`;

const Time = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.darkGrey};
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors?.darkGrey};
  font-size: 0.95rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1099;
`;

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  padding: 35px 40px;
  border-radius: 25px;
  background-color: ${({ theme }) => theme.colors?.white};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 90%;
    padding: 30px;
  }
`;

const ModalTitle = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme.colors?.text};
  margin-top: 0;
  margin-bottom: 10px;
  font-weight: 800;
`;

const ModalText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors?.darkGrey};
  margin-bottom: 25px;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
`;

const ModalButton = styled.button`
  background-color: ${({ $danger, theme }) =>
    $danger ? theme.colors?.danger : "transparent"};
  color: ${({ $danger, theme }) => ($danger ? "#fff" : theme.colors?.text)};
  border: ${({ $danger, theme }) =>
    $danger ? "none" : `1px solid ${theme.colors?.darkGrey}`};
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    opacity: 0.8;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  cursor: pointer;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.darkGrey};
  font-weight: 600;
  user-select: none;
`;

const StyledCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors?.danger};
`;

const InviteActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const InviteBtn = styled.button`
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: ${({ $accept, theme }) =>
    $accept ? theme.colors?.secondary : theme.colors?.danger};
  color: white;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

const NotificationsDropdown = ({ onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const dropdownRef = useRef(null);

  const [processingInvites, setProcessingInvites] = useState({});

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (
        event.target.id === "modal-overlay" ||
        event.target.closest("#confirm-modal")
      ) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const res = await getNotifications();
    if (!res.errorCode) {
      setNotifications(res.notifications || []);
    }
    setIsLoading(false);
  };

  const handleNotificationClick = async (notif) => {
    // zaproszenia obsługujemy osobnymi guzikami
    if (notif.invitationId) return;

    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      if (onRefresh) onRefresh();
    }

    if (notif.socialGroupId) {
      navigate(`/social/${notif.socialGroupId}`);
      onClose();
    }
  };

  const handleAcceptInvite = async (e, notif) => {
    e.stopPropagation();
    setProcessingInvites((prev) => ({ ...prev, [notif.invitationId]: true }));

    const res = await acceptDirectGroupInvitation(notif.invitationId);

    if (!res.errorCode) {
      // odznacza się jako przeczytane
      await markNotificationAsRead(notif.id);
      if (onRefresh) onRefresh();

      // przekierowujemy do grupy
      navigate(`/social/${notif.socialGroupId}`);
      onClose();
    } else {
      alert(res.message || "Wystąpił błąd podczas akceptacji.");
    }
    setProcessingInvites((prev) => ({ ...prev, [notif.invitationId]: false }));
  };

  const handleDeclineInvite = async (e, notif) => {
    e.stopPropagation();
    setProcessingInvites((prev) => ({ ...prev, [notif.invitationId]: true }));

    const res = await declineDirectGroupInvitation(notif.invitationId);

    if (!res.errorCode) {
      // odrzucono - odświeżamy listę żeby powiadomienie zniknęło/oznaczyło się jako przeczytane
      fetchNotifications();
      if (onRefresh) onRefresh();
    } else {
      alert(res.message || "Wystąpił błąd podczas odrzucania.");
    }
    setProcessingInvites((prev) => ({ ...prev, [notif.invitationId]: false }));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (onRefresh) onRefresh();
  };

  const handleClearAllClick = async () => {
    const skipConfirm =
      localStorage.getItem("skipClearNotificationsConfirm") === "true";

    if (skipConfirm) {
      await clearAllNotifications();
      setNotifications([]);
    } else {
      setDontAskAgain(false);
      setIsConfirmModalOpen(true);
      if (onRefresh) onRefresh();
    }
  };

  const confirmClearAll = async () => {
    if (dontAskAgain) {
      localStorage.setItem("skipClearNotificationsConfirm", "true");
    }

    await clearAllNotifications();
    setNotifications([]);
    setIsConfirmModalOpen(false);
  };

  const cancelClearAll = () => {
    setIsConfirmModalOpen(false);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <DropdownContainer ref={dropdownRef}>
        <Header>
          <Title>Powiadomienia</Title>
          <ActionLinks>
            {notifications.some((n) => !n.isRead) && (
              <TextBtn onClick={handleMarkAllRead}>Odczytaj wszystkie</TextBtn>
            )}
            {notifications.length > 0 && (
              <TextBtn
                onClick={handleClearAllClick}
                style={{ color: "#e74c3c" }}
              >
                Wyczyść
              </TextBtn>
            )}
          </ActionLinks>
        </Header>

        <NotificationsList>
          {isLoading ? (
            <EmptyState>Ładowanie...</EmptyState>
          ) : notifications.length === 0 ? (
            <EmptyState>Brak nowych powiadomień.</EmptyState>
          ) : (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                $isRead={notif.isRead}
                $isActionable={!!notif.invitationId}
                onClick={() => handleNotificationClick(notif)}
              >
                <UnreadDot $visible={!notif.isRead} />
                <Content>
                  <Message>{notif.message}</Message>
                  <Time>{formatTime(notif.createdAt)}</Time>

                  {/* przyciski akceptacji/odrzucenia tylko jeśli jest zaproszenie i powiadomienie jest nieprzeczytane/aktywne */}
                  {notif.invitationId && !notif.isRead && (
                    <InviteActions>
                      <InviteBtn
                        $accept
                        disabled={processingInvites[notif.invitationId]}
                        onClick={(e) => handleAcceptInvite(e, notif)}
                      >
                        {processingInvites[notif.invitationId]
                          ? "..."
                          : "Zaakceptuj"}
                      </InviteBtn>
                      <InviteBtn
                        disabled={processingInvites[notif.invitationId]}
                        onClick={(e) => handleDeclineInvite(e, notif)}
                      >
                        {processingInvites[notif.invitationId]
                          ? "..."
                          : "Odrzuć"}
                      </InviteBtn>
                    </InviteActions>
                  )}
                </Content>
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </DropdownContainer>

      {isConfirmModalOpen && (
        <>
          <ModalOverlay id="modal-overlay" onClick={cancelClearAll} />
          <StyledPopup id="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Czy na pewno?</ModalTitle>
            <ModalText>
              Chcesz trwale usunąć wszystkie swoje powiadomienia? Tej akcji nie
              można cofnąć.
            </ModalText>

            <CheckboxWrapper>
              <StyledCheckbox
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
              />
              Nie pytaj ponownie
            </CheckboxWrapper>

            <ButtonGroup>
              <ModalButton onClick={cancelClearAll}>Anuluj</ModalButton>
              <ModalButton $danger onClick={confirmClearAll}>
                Tak, wyczyść
              </ModalButton>
            </ButtonGroup>
          </StyledPopup>
        </>
      )}
    </>
  );
};

export default NotificationsDropdown;
