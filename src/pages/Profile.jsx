import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Layout from "../components/organisms/Layout";
import {
  getProfile,
  changeUsername,
  changeEmail,
  confirmEmailChange,
  changePassword,
  deleteAccount,
} from "../api";
import { removeToken } from "../token";

const StyledContainer = styled.div`
  padding: 30px 20px 27px;
  min-height: 100vh;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
`;

const PageHeader = styled.h2`
  color: #122818;
  font-size: 1.7rem;
  font-weight: 800;
  margin: 0;
`;

const LogoutButton = styled.button`
  padding: 9px 18px;
  background-color: ${({ theme }) => theme.colors.white};
  color: #122818;
  border: 1px solid #d1d4c9;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #e9ece1;
  }
`;

const TabsBar = styled.div`
  display: flex;
  gap: 4px;
  margin: 8px 0 18px;
  border-bottom: 1px solid #d1d4c9;
`;

const TabButton = styled.button`
  padding: 10px 18px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.92rem;
  color: ${({ $active, theme }) =>
    $active ? "#122818" : theme.colors.takiSmiesznyZielony};
  border-bottom: 3px solid
    ${({ $active }) => ($active ? "#122818" : "transparent")};
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
  &:hover {
    color: #122818;
  }
`;

const EmptyTabState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #${({ theme }) => theme.colors.takiSmiesznyZielonyAleJasny};
  font-size: 0.95rem;
`;

const CardBox = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 16px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const AvatarButton = styled.button`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background-color: #dbe0d0;
  color: #122818;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.6rem;
  font-weight: 800;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  }
  &:hover > div {
    opacity: 1;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(18, 40, 24, 0.55);
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0;
  transition: opacity 0.15s;
`;

const IdentityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const IdentityName = styled.span`
  font-size: 1.15rem;
  font-weight: 700;
  color: #122818;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IdentityEmail = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SectionTitle = styled.h3`
  color: #122818;
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 14px 0;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: #122818;
`;

const TextInput = styled.input`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d1d4c9;
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  &:focus {
    border-color: #122818;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 9px 16px;
  background-color: #122818;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;

  &:hover {
    background-color: #1f3a28;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background-color: transparent;
  color: #122818;
  border: 1px solid #d1d4c9;
  &:hover {
    background-color: #f0f2ea;
  }
`;

const FeedbackText = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.88rem;
  color: ${({ $error }) => ($error ? "rgb(239, 68, 68)" : "rgb(92, 184, 92)")};
`;

const PasswordRequirementsList = styled.ul`
  text-align: left;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  margin: 6px 0 12px;
  padding-left: 4px;
  list-style: none;
`;

const PasswordRequirementsHeader = styled.div`
  font-size: 0.82rem;
  color: #122818;
  font-weight: 600;
  margin-bottom: 4px;
`;

const PasswordRequirement = styled.li`
  margin-left: 10px;
  text-decoration: ${({ $crossedOut }) =>
    $crossedOut ? "line-through" : "none"};
  color: ${({ $crossedOut, theme }) =>
    $crossedOut ? "rgb(92, 184, 92)" : theme.colors.takiSmiesznyZielony};
  &::before {
    content: "${({ $crossedOut }) => ($crossedOut ? "✓" : "•")}";
    display: inline-block;
    width: 14px;
    margin-right: 4px;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;

const ModalTitle = styled.h3`
  color: #122818;
  margin: 0 0 10px 0;
  font-size: 1.15rem;
`;

const ModalText = styled.p`
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  margin: 0 0 20px 0;
  font-size: 0.9rem;
`;

const ModalClose = styled.button`
  padding: 8px 18px;
  background-color: #122818;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  &:hover {
    background-color: #1f3a28;
  }
`;

const DangerCard = styled(CardBox)`
  border: 1px solid rgba(239, 68, 68, 0.35);
`;

const DangerTitle = styled(SectionTitle)`
  color: rgb(185, 28, 28);
`;

const DangerText = styled.p`
  margin: 0 0 14px 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  line-height: 1.4;
`;

const DangerButton = styled.button`
  padding: 9px 16px;
  background-color: rgb(239, 68, 68);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;

  &:hover {
    background-color: rgb(220, 38, 38);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LegalFooter = styled.div`
  margin-top: 4px;
  padding: 8px 4px 0;
  text-align: center;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
`;

const LegalLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #122818;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: #1f3a28;
  }
`;

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteFeedback, setDeleteFeedback] = useState({
    message: "",
    error: false,
  });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [usernameFeedback, setUsernameFeedback] = useState({
    message: "",
    error: false,
  });
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);

  // 2-etapowa zmiana emaila: najpierw request z nowym adresem (backend wysyla kod),
  // potem potwierdzenie z kodem
  const [emailStep, setEmailStep] = useState("request"); // 'request' | 'confirm'
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailFeedback, setEmailFeedback] = useState({
    message: "",
    error: false,
  });
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState({
    message: "",
    error: false,
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordReqVisible, setPasswordReqVisible] = useState(false);

  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  useEffect(() => {
    (async () => {
      const res = await getProfile();
      if (!res.errorCode) {
        setUsername(res.username || "");
        setEmail(res.email || "");
      }
      setLoading(false);
    })();
  }, []);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameFeedback({ message: "", error: false });
    if (!newUsername) {
      setUsernameFeedback({
        message: "Podaj nową nazwę użytkownika.",
        error: true,
      });
      return;
    }
    setUsernameSubmitting(true);
    const res = await changeUsername(newUsername);
    setUsernameSubmitting(false);
    if (res.errorCode) {
      setUsernameFeedback({
        message: res.message || "Nie udało się zmienić nazwy użytkownika.",
        error: true,
      });
      return;
    }
    setUsername(res.username || newUsername);
    setNewUsername("");
    setUsernameFeedback({ message: res.message, error: false });
  };

  const handleEmailRequestSubmit = async (e) => {
    e.preventDefault();
    setEmailFeedback({ message: "", error: false });
    if (!newEmail) {
      setEmailFeedback({ message: "Podaj nowy adres e-mail.", error: true });
      return;
    }
    setEmailSubmitting(true);
    const res = await changeEmail(newEmail);
    setEmailSubmitting(false);
    if (res.errorCode) {
      setEmailFeedback({
        message: res.message || "Nie udało się wysłać kodu weryfikacyjnego.",
        error: true,
      });
      return;
    }
    setEmailStep("confirm");
    setEmailFeedback({ message: res.message, error: false });
  };

  const handleEmailConfirmSubmit = async (e) => {
    e.preventDefault();
    setEmailFeedback({ message: "", error: false });
    if (!emailCode) {
      setEmailFeedback({ message: "Wpisz kod weryfikacyjny.", error: true });
      return;
    }
    setEmailSubmitting(true);
    const res = await confirmEmailChange(newEmail, emailCode);
    setEmailSubmitting(false);
    if (res.errorCode) {
      setEmailFeedback({
        message: res.message || "Nie udało się potwierdzić zmiany.",
        error: true,
      });
      return;
    }
    setEmail(newEmail);
    setNewEmail("");
    setEmailCode("");
    setEmailStep("request");
    setEmailFeedback({ message: res.message, error: false });
  };

  const cancelEmailChange = () => {
    setEmailStep("request");
    setEmailCode("");
    setEmailFeedback({ message: "", error: false });
  };

  const openDeleteModal = () => {
    setDeletePassword("");
    setDeleteFeedback({ message: "", error: false });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteSubmitting) return;
    setDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteFeedback({ message: "", error: false });
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteFeedback({ message: "", error: false });
    if (!deletePassword) {
      setDeleteFeedback({
        message: "Wpisz hasło, aby potwierdzić.",
        error: true,
      });
      return;
    }
    setDeleteSubmitting(true);
    const res = await deleteAccount(deletePassword);
    if (res.errorCode) {
      setDeleteSubmitting(false);
      setDeleteFeedback({
        message: res.message || "Nie udało się usunąć konta.",
        error: true,
      });
      return;
    }
    removeToken();
    setDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteSubmitting(false);
    navigate("/", { replace: true });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ message: "", error: false });
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordFeedback({ message: "Wypełnij wszystkie pola.", error: true });
      return;
    }
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordReqVisible(true);
      setPasswordFeedback({
        message: "Nowe hasło nie spełnia wymagań.",
        error: true,
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        message: "Nowe hasła nie są zgodne.",
        error: true,
      });
      return;
    }
    setPasswordSubmitting(true);
    const res = await changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword
    );
    setPasswordSubmitting(false);
    if (res.errorCode) {
      setPasswordFeedback({
        message: res.message || "Nie udało się zmienić hasła.",
        error: true,
      });
      return;
    }
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordReqVisible(false);
    setPasswordFeedback({ message: res.message, error: false });
  };

  return (
    <Layout>
      <StyledContainer>
        <HeaderRow>
          <PageHeader>Profil</PageHeader>
          <LogoutButton
            onClick={() => {
              removeToken();
              navigate("/");
            }}
          >
            Wyloguj
          </LogoutButton>
        </HeaderRow>

        <CardBox>
          <ProfileHeader>
            <AvatarButton
              onClick={() => setAvatarModalOpen(true)}
              title="Zmień awatar"
            >
              {getInitials(username)}
              <AvatarOverlay>Zmień</AvatarOverlay>
            </AvatarButton>
            <IdentityText>
              <IdentityName>
                {loading && !username
                  ? "Ładowanie..."
                  : username || "Użytkownik"}
              </IdentityName>
              <IdentityEmail>{email}</IdentityEmail>
            </IdentityText>
          </ProfileHeader>
        </CardBox>

        <TabsBar>
          <TabButton
            $active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
          >
            Ustawienia konta
          </TabButton>
          <TabButton
            $active={activeTab === "preferences"}
            onClick={() => setActiveTab("preferences")}
          >
            Preferencje
          </TabButton>
        </TabsBar>

        {activeTab === "preferences" && (
          <CardBox>
            <EmptyTabState>Wkrótce dostępne.</EmptyTabState>
          </CardBox>
        )}

        {activeTab === "account" && (
          <>
            <CardBox>
              <SectionTitle>Zmiana nazwy użytkownika</SectionTitle>
              {usernameFeedback.message && (
                <FeedbackText $error={usernameFeedback.error}>
                  {usernameFeedback.message}
                </FeedbackText>
              )}
              <form onSubmit={handleUsernameSubmit} autoComplete="off">
                <FormRow>
                  <Label htmlFor="profile-nick-field">
                    Nowa nazwa użytkownika
                  </Label>
                  <TextInput
                    id="profile-nick-field"
                    name="profile-nick-field"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={username}
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                  />
                </FormRow>
                <ActionButton type="submit" disabled={usernameSubmitting}>
                  {usernameSubmitting
                    ? "Zapisywanie..."
                    : "Zapisz nazwę użytkownika"}
                </ActionButton>
              </form>
            </CardBox>

            <CardBox>
              <SectionTitle>Zmiana adresu e-mail</SectionTitle>
              {emailFeedback.message && (
                <FeedbackText $error={emailFeedback.error}>
                  {emailFeedback.message}
                </FeedbackText>
              )}
              {emailStep === "request" ? (
                <form onSubmit={handleEmailRequestSubmit} autoComplete="off">
                  <FormRow>
                    <Label htmlFor="profile-mail-field">
                      Nowy adres e-mail
                    </Label>
                    <TextInput
                      id="profile-mail-field"
                      name="profile-mail-field"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={email}
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute("readonly")}
                    />
                  </FormRow>
                  <ActionButton type="submit" disabled={emailSubmitting}>
                    {emailSubmitting
                      ? "Wysyłanie..."
                      : "Wyślij kod weryfikacyjny"}
                  </ActionButton>
                </form>
              ) : (
                <form onSubmit={handleEmailConfirmSubmit}>
                  <FormRow>
                    <Label>Nowy adres e-mail</Label>
                    <TextInput type="email" value={newEmail} disabled />
                  </FormRow>
                  <FormRow>
                    <Label htmlFor="emailCode">Kod weryfikacyjny</Label>
                    <TextInput
                      id="emailCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="6-cyfrowy kod"
                      autoComplete="one-time-code"
                    />
                  </FormRow>
                  <ButtonsRow>
                    <ActionButton type="submit" disabled={emailSubmitting}>
                      {emailSubmitting
                        ? "Potwierdzanie..."
                        : "Potwierdź zmianę"}
                    </ActionButton>
                    <SecondaryButton
                      type="button"
                      onClick={cancelEmailChange}
                      disabled={emailSubmitting}
                    >
                      Anuluj
                    </SecondaryButton>
                  </ButtonsRow>
                </form>
              )}
            </CardBox>

            <CardBox>
              <SectionTitle>Zmiana hasła</SectionTitle>
              {passwordFeedback.message && (
                <FeedbackText $error={passwordFeedback.error}>
                  {passwordFeedback.message}
                </FeedbackText>
              )}
              <form onSubmit={handlePasswordSubmit} autoComplete="off">
                <FormRow>
                  <Label htmlFor="profile-pass-current">Obecne hasło</Label>
                  <TextInput
                    id="profile-pass-current"
                    name="profile-pass-current"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                  />
                </FormRow>
                <FormRow>
                  <Label htmlFor="profile-pass-new">Nowe hasło</Label>
                  <TextInput
                    id="profile-pass-new"
                    name="profile-pass-new"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                  />
                </FormRow>
                {passwordReqVisible && (
                  <>
                    <PasswordRequirementsHeader>
                      Wymagania dotyczące hasła:
                    </PasswordRequirementsHeader>
                    <PasswordRequirementsList>
                      <PasswordRequirement
                        $crossedOut={passwordForm.newPassword.length >= 8}
                      >
                        co najmniej 8 znaków
                      </PasswordRequirement>
                      <PasswordRequirement
                        $crossedOut={/[a-z]/.test(passwordForm.newPassword)}
                      >
                        jedna mała litera
                      </PasswordRequirement>
                      <PasswordRequirement
                        $crossedOut={/[A-Z]/.test(passwordForm.newPassword)}
                      >
                        jedna wielka litera
                      </PasswordRequirement>
                      <PasswordRequirement
                        $crossedOut={/\d/.test(passwordForm.newPassword)}
                      >
                        jedna cyfra
                      </PasswordRequirement>
                      <PasswordRequirement
                        $crossedOut={/[#?!@$%^&*-]/.test(
                          passwordForm.newPassword
                        )}
                      >
                        jeden znak specjalny (#?!@$%^&*-)
                      </PasswordRequirement>
                    </PasswordRequirementsList>
                  </>
                )}
                <FormRow>
                  <Label htmlFor="profile-pass-confirm">
                    Powtórz nowe hasło
                  </Label>
                  <TextInput
                    id="profile-pass-confirm"
                    name="profile-pass-confirm"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                  />
                </FormRow>
                <ActionButton type="submit" disabled={passwordSubmitting}>
                  {passwordSubmitting ? "Zapisywanie..." : "Zapisz nowe hasło"}
                </ActionButton>
              </form>
            </CardBox>

            <DangerCard>
              <DangerTitle>Usunięcie konta</DangerTitle>
              <DangerText>
                Usunięcie konta jest nieodwracalne. Wszystkie Twoje notatki,
                fiszki i wydarzenia zostaną trwale usunięte.
              </DangerText>
              <DangerButton type="button" onClick={openDeleteModal}>
                Usuń konto
              </DangerButton>
            </DangerCard>
          </>
        )}

        <LegalFooter>
          <LegalLink type="button" onClick={() => setTermsOpen(true)}>
            Regulamin
          </LegalLink>
          {" · "}
          <LegalLink type="button" onClick={() => setPrivacyOpen(true)}>
            Polityka prywatności
          </LegalLink>
        </LegalFooter>

        {avatarModalOpen && (
          <ModalBackdrop onClick={() => setAvatarModalOpen(false)}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Zmiana awatara</ModalTitle>
              <ModalText>Wkrótce dostępne.</ModalText>
              <ModalClose onClick={() => setAvatarModalOpen(false)}>
                Zamknij
              </ModalClose>
            </ModalBox>
          </ModalBackdrop>
        )}

        {termsOpen && (
          <ModalBackdrop onClick={() => setTermsOpen(false)}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Regulamin</ModalTitle>
              <ModalText>Tu wpiszemy regulamin</ModalText>
              <ModalClose onClick={() => setTermsOpen(false)}>
                Zamknij
              </ModalClose>
            </ModalBox>
          </ModalBackdrop>
        )}

        {privacyOpen && (
          <ModalBackdrop onClick={() => setPrivacyOpen(false)}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Polityka prywatności</ModalTitle>
              <ModalText>Tu wpiszemy politykę prywatności</ModalText>
              <ModalClose onClick={() => setPrivacyOpen(false)}>
                Zamknij
              </ModalClose>
            </ModalBox>
          </ModalBackdrop>
        )}

        {deleteModalOpen && (
          <ModalBackdrop onClick={closeDeleteModal}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Usunąć konto?</ModalTitle>
              <ModalText>
                Ta operacja jest nieodwracalna. Wpisz swoje obecne hasło, aby
                potwierdzić.
              </ModalText>
              <form onSubmit={handleDeleteAccount} autoComplete="off">
                <FormRow>
                  <TextInput
                    id="profile-delete-pass"
                    name="profile-delete-pass"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Obecne hasło"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(ev) => ev.target.removeAttribute("readonly")}
                    autoFocus
                  />
                </FormRow>
                {deleteFeedback.message && (
                  <FeedbackText $error={deleteFeedback.error}>
                    {deleteFeedback.message}
                  </FeedbackText>
                )}
                <ButtonsRow style={{ justifyContent: "center" }}>
                  <SecondaryButton
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleteSubmitting}
                  >
                    Anuluj
                  </SecondaryButton>
                  <DangerButton type="submit" disabled={deleteSubmitting}>
                    {deleteSubmitting ? "Usuwanie..." : "Tak, usuń konto"}
                  </DangerButton>
                </ButtonsRow>
              </form>
            </ModalBox>
          </ModalBackdrop>
        )}
      </StyledContainer>
    </Layout>
  );
};

export default Profile;
