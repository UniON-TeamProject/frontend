import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Layout from "../components/organisms/Layout";
import {
  getProfile,
  changeUsername,
  changeEmail,
  confirmEmailChange,
  changePassword,
  changeTheme,
  deleteAccount,
} from "../api";
import { removeToken } from "../token";
import { PASSWORD_REGEX } from "../helpers/validation";
import PasswordRequirements from "../components/atoms/PasswordRequirements";
import Input from "../components/atoms/Input";
import VerificationInput from "react-verification-input";
import { setThemeColor } from "../store/themeSlice";
import { THEME_COLORS, buildTheme } from "../styles/theme";

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
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 1.7rem;
  font-weight: 800;
  margin: 0;
`;

const LogoutButton = styled.button`
  padding: 9px 18px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightPrimary};
  }
`;

const TabsBar = styled.div`
  display: flex;
  gap: 4px;
  margin: 8px 0 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
`;

const TabButton = styled.button`
  padding: 10px 18px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.veryDarkPrimary : theme.colors.takiSmiesznyZielony};
  border-bottom: 3px solid
    ${({ $active, theme }) => ($active ? theme.veryDarkPrimary : "transparent")};
  transition: 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
`;

const EmptyTabState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielonyAleJasny};
  font-size: 0.9rem;
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
  background-color: ${({ theme }) => theme.colors.darkPageBg};
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
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
  &::after {
    content: "Zmień";
    position: absolute;
    inset: 0;
    background: rgba(18, 40, 24, 0.55);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0;
    transition: opacity 0.15s;
    border-radius: 50%;
  }
  &:hover::after {
    opacity: 1;
  }
`;

const IdentityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const IdentityName = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IdentityEmail = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 14px 0;
`;


const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 9px 16px;
  background-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.2s;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightPrimary};
  }
`;

const FeedbackText = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
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
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
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
  background-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
`;

const DangerCard = styled(CardBox)`
  border: 1px solid rgba(239, 68, 68, 0.35);
`;

const DangerTitle = styled(SectionTitle)`
  color: ${({ theme }) => theme.colors.dangerDark};
`;

const DangerText = styled.p`
  margin: 0 0 14px 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
  line-height: 1.4;
`;

const DangerButton = styled.button`
  padding: 9px 16px;
  background-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerDark};
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
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.takiSmiesznyZielony};
`;

const LegalLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
`;

const THEME_LABELS = {
  GREEN: "Zielony",
  RED: "Czerwony",
  ORANGE: "Pomarańczowy",
  YELLOW: "Żółty",
  BLUE: "Niebieski",
  NAVY: "Granatowy",
  PURPLE: "Fioletowy",
};

/* ── Miniaturka UI ── */
const MiniGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const MiniPreview = styled.button`
  width: 80px;
  height: 60px;
  border-radius: 10px;
  border: 3px solid ${({ $active, $dark }) => ($active ? $dark : "transparent")};
  background-color: ${({ theme }) => theme.colors.pageBg};
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  display: flex;
  transition: transform 0.15s, box-shadow 0.2s;
  box-shadow: ${({ $active }) =>
    $active ? "0 3px 10px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.08)"};
  &:hover { transform: scale(1.06); }
`;

const MiniSidebar = styled.div`
  width: 18px;
  height: 100%;
  background-color: ${({ $color }) => $color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const MiniDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

const MiniContent = styled.div`
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MiniCard = styled.div`
  flex: 1;
  border-radius: 4px;
  background-color: white;
  border: 1px solid ${({ $color }) => $color};
`;

const MiniBar = styled.div`
  height: 5px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
`;

const ThemeFeedback = styled.p`
  margin: 12px 0 0;
  font-size: 0.85rem;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
`;

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.color);
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

  const [emailStep, setEmailStep] = useState("request"); // request/confirm
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
  const [passwordRegexVisible, setPasswordRegexVisible] = useState(false);

  const [themeSaving, setThemeSaving] = useState(false);
  const [themeFeedback, setThemeFeedback] = useState({ message: "", error: false });

  useEffect(() => {
    (async () => {
      const res = await getProfile();
      if (!res.errorCode) {
        setUsername(res.username || "");
        setEmail(res.email || "");
        if (res.themeColor) dispatch(setThemeColor(res.themeColor));
      }
      setLoading(false);
    })();
  }, [dispatch]);

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
    if (!PASSWORD_REGEX.test(passwordForm.newPassword)) {
      setPasswordRegexVisible(true);
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
    setPasswordRegexVisible(false);
    setPasswordFeedback({ message: res.message, error: false });
  };

  const handleThemeChange = async (color) => {
    if (color === currentTheme || themeSaving) return;
    setThemeFeedback({ message: "", error: false });
    setThemeSaving(true);
    dispatch(setThemeColor(color));
    const res = await changeTheme(color);
    setThemeSaving(false);
    if (res.errorCode) {
      dispatch(setThemeColor(currentTheme));
      setThemeFeedback({
        message: res.message || "Nie udało się zmienić motywu.",
        error: true,
      });
      return;
    }
    setThemeFeedback({ message: res.message, error: false });
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
            <SectionTitle>Kolor motywu</SectionTitle>

            <MiniGrid>
                {THEME_COLORS.map((color) => {
                  const p = buildTheme(color).colors;
                  const active = color === currentTheme;
                  return (
                    <MiniPreview
                      key={color}
                      $active={active}
                      $dark={p.veryDarkPrimary}
                      onClick={() => handleThemeChange(color)}
                      disabled={themeSaving}
                      title={THEME_LABELS[color]}
                    >
                      <MiniSidebar $color={p.lightPrimary}>
                        <MiniDot $color={p.secondary} />
                        <MiniDot $color={p.secondary} />
                        <MiniDot $color={p.secondary} />
                      </MiniSidebar>
                      <MiniContent>
                        <MiniCard $color={p.border} />
                        <MiniBar $color={p.secondary} />
                      </MiniContent>
                    </MiniPreview>
                  );
                })}
              </MiniGrid>

            {themeFeedback.message && (
              <ThemeFeedback $error={themeFeedback.error}>
                {themeFeedback.message}
              </ThemeFeedback>
            )}
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
                <Input
                  label="Nowa nazwa użytkownika"
                  name="profile-nick-field"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={username || "Nowa nazwa użytkownika"}
                  autoComplete="off"
                />
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
                  <Input
                    label="Nowy adres e-mail"
                    name="profile-mail-field"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={email || "Nowy adres e-mail"}
                    autoComplete="off"
                  />
                  <ActionButton type="submit" disabled={emailSubmitting}>
                    {emailSubmitting
                      ? "Wysyłanie..."
                      : "Wyślij kod weryfikacyjny"}
                  </ActionButton>
                </form>
              ) : (
                <form onSubmit={handleEmailConfirmSubmit}>
                  <Input
                    label="Nowy adres e-mail"
                    type="email"
                    value={newEmail}
                    placeholder="Nowy adres e-mail"
                    disabled
                  />
                  <label style={{ fontSize: "0.8rem", fontWeight: 400, display: "block", margin: "20px 0 6px" }}>Kod weryfikacyjny</label>
                  <VerificationInput
                    validChars="0-9"
                    inputProps={{ inputMode: "numeric" }}
                    classNames={{
                      container: "container",
                      character: "character",
                      characterSelected: "character--selected",
                    }}
                    containerProps={{ style: { margin: "0 0 20px 0" } }}
                    onChange={(val) => setEmailCode(val)}
                  />
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
                <Input
                  label="Obecne hasło"
                  name="profile-pass-current"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="Obecne hasło"
                  autoComplete="new-password"
                />
                <Input
                  label="Nowe hasło"
                  name="profile-pass-new"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Nowe hasło"
                  autoComplete="new-password"
                />
                {passwordRegexVisible && (
                  <PasswordRequirements password={passwordForm.newPassword} />
                )}
                <Input
                  label="Powtórz nowe hasło"
                  name="profile-pass-confirm"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Powtórz nowe hasło"
                  autoComplete="new-password"
                />
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
                <Input
                  name="profile-delete-pass"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Obecne hasło"
                  autoComplete="new-password"
                  autoFocus
                />
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
