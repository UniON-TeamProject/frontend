import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import Layout from "../components/organisms/Layout";
import LegalModal from "../components/organisms/LegalModal";
import {
  getProfile,
  changeUsername,
  changeEmail,
  confirmEmailChange,
  changePassword,
  changeAvatar,
  deleteAccount,
} from "../api";
import { removeToken } from "../token";
import { PASSWORD_REGEX } from "../helpers/validation";
import PasswordRequirements from "../components/atoms/PasswordRequirements";
import Input from "../components/atoms/Input";
import VerificationInput from "react-verification-input";
import { setThemeColor } from "../store/themeSlice";
import {CardBox} from '../components/profile/CardBox'
import { AvatarModal } from '../components/profile/AvatarModal'
import { DeleteAccountModal } from '../components/profile/DeleteAccountModal'
import { LogoutButton } from '../components/profile/LogoutButton'
import { ThemeSelector } from '../components/profile/ThemeSelector'
import { UniversitySelector } from '../components/profile/UniversitySelector'
import { ProfileCard } from '../components/profile/ProfileCard'

const StyledContainer = styled.div`
  max-width: 640px;
  padding: 30px 20px 27px;
  margin: 0 auto;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PageHeader = styled.h2`
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 1.7rem;
  font-weight: 800;
`;

const TabsBar = styled.div`
  display: flex;
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
    $active ? theme.colors.veryDarkPrimary : theme.colors.tertiary};
  border-bottom: 3px solid
    ${({ $active, theme }) => ($active ? theme.veryDarkPrimary : "transparent")};
  transition: 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
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
  &:hover{
    background-color: ${({ theme }) => theme.colors.darkPrimary};
  }
`;

const OutlineButton = styled(ActionButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightPrimary};
  }
`;

const DangerButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.danger};
  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerDark};
  }
`;

const LegalFooter = styled.div`
  margin-top: 4px;
  padding: 8px 4px 0;
  text-align: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.tertiary};
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


const Profile = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const highlightUniversity = locationState?.highlightUniversity ?? false;
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarId, setAvatarId] = useState(0);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(locationState?.tab ?? "account");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteFeedback, setDeleteFeedback] = useState({message: "", error: false});
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

  const [initialUniversity, setInitialUniversity] = useState("");

  useEffect(() => {
    (async () => {
      const profileRes = await getProfile();
      if (!profileRes.errorCode) {
        setUsername(profileRes.username || "");
        setEmail(profileRes.email || "");
        if (profileRes.avatarId) setAvatarId(profileRes.avatarId);
        if (profileRes.themeColor) dispatch(setThemeColor(profileRes.themeColor));
        if (profileRes.universityName) setInitialUniversity(profileRes.universityName);
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

  const handleAvatarSelect = async (id) => {
    if (id === avatarId) return;
    const res = await changeAvatar(id);
    if (!res.errorCode) setAvatarId(id);
  };

  return (
    <Layout>
      <StyledContainer>
        <HeaderRow>
          <PageHeader>Profil</PageHeader>
          <LogoutButton />
        </HeaderRow>

        <ProfileCard
          username={username}
          email={email}
          avatarId={avatarId}
          loading={loading}
          onAvatarClick={() => setAvatarModalOpen(true)}
        />

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

        {activeTab === "preferences" && <ThemeSelector />}
        {activeTab === "preferences" && (
          <UniversitySelector
            initialUniversity={initialUniversity}
            highlightUniversity={highlightUniversity}
          />
        )}

        {activeTab === "account" && (
          <>
            <CardBox title="Zmiana nazwy użytkownika" feedbackMessage={usernameFeedback.message} feedbackError={usernameFeedback.error}>
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

            <CardBox title="Zmiana adresu e-mail" feedbackMessage={emailFeedback.message} feedbackError={emailFeedback.error}>
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
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 400,
                      display: "block",
                      margin: "20px 0 6px",
                    }}
                  >
                    Kod weryfikacyjny
                  </label>
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
                    <OutlineButton
                      type="button"
                      onClick={cancelEmailChange}
                      disabled={emailSubmitting}
                    >
                      Anuluj
                    </OutlineButton>
                  </ButtonsRow>
                </form>
              )}
            </CardBox>

            <CardBox title="Zmiana hasła" feedbackMessage={passwordFeedback.message} feedbackError={passwordFeedback.error}>
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

            <CardBox
              title="Usunięcie konta"
              danger
              text="Usunięcie konta jest nieodwracalne. Wszystkie Twoje notatki, fiszki i wydarzenia zostaną trwale usunięte."
            >
              <DangerButton type="button" onClick={openDeleteModal}>
                Usuń konto
              </DangerButton>
            </CardBox>

            <CardBox
              title="Kontakt z zespołem"
              text={<>Zauważyłeś błąd lub masz sugestię? Napisz do nas na:{" "}<a href="mailto:unionteamproject@gmail.com" style={{ color: "inherit", fontWeight: 600 }}>unionteamproject@gmail.com</a></>}
            />
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
          <AvatarModal
            onClose={() => setAvatarModalOpen(false)}
            avatarId={avatarId}
            onSelect={handleAvatarSelect}
          />
        )}

        {termsOpen && (
          <LegalModal type="terms" onClose={() => setTermsOpen(false)} />
        )}

        {privacyOpen && (
          <LegalModal type="privacy" onClose={() => setPrivacyOpen(false)} />
        )}

        {deleteModalOpen && (
          <DeleteAccountModal
            onClose={closeDeleteModal}
            onSubmit={handleDeleteAccount}
            password={deletePassword}
            onPasswordChange={(e) => setDeletePassword(e.target.value)}
            feedback={deleteFeedback}
            submitting={deleteSubmitting}
          />
        )}
      </StyledContainer>
    </Layout>
  );
};

export default Profile;