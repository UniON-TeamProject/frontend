import styled, { keyframes } from "styled-components";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Text from "../components/atoms/Text";
import Logo from "../components/atoms/Logo";
import Box from "../components/atoms/Box";
import AppTitle from "../components/atoms/AppTitle";

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`; 

const SplashContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({theme})=> theme.colors.white};
  overflow: hidden;
  animation: ${({ $isClosing }) => ($isClosing ? fadeOut : "none")} 0.5s ease forwards;
`;

const SplashVideo = styled.video`
  width: 320px;
  height: 320px;
  object-fit: cover; 
  transform: scale(1.02) translateY(-40px);
`;

const StyledContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  text-align: center;
  position: relative;
  animation: ${fadeIn} 0.5s ease;
`;

const StyledBox = styled(Box)`
  width: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px 80px 50px 80px;
  cursor: default;
  @media (max-width: 768px) {
    width: 100%;
    margin: 0 auto;
    padding: 30px 40px;
    background-color: ${({ theme }) => theme.colors.pageBg};
    box-shadow: unset;
  }
`;

const StyledSubmitButton = styled(Button)`
  width: 100%;
  margin: 5px 0;
  @media (max-width: 768px) {
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

const StyledInfoBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.lightPrimary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const LOGOUT_MESSAGES = {
  session_expired: "Twoja sesja wygasła. Zaloguj się ponownie.",
};

const WelcomePage = () => {
  const navigate = useNavigate();
  const [infoBanner, setInfoBanner] = useState("");
  
  const [showSplash, setShowSplash] = useState(() => {
    //użytkownik bedzie widział intro tylko raz w jednej sesji
    return sessionStorage.getItem("splashSeen") !== "true";
  });
  const [isClosingSplash, setIsClosingSplash] = useState(false);

  useEffect(() => {
    const reason = sessionStorage.getItem("logout_reason");
    if (reason) {
      sessionStorage.removeItem("logout_reason");
      setInfoBanner(LOGOUT_MESSAGES[reason] ?? "Zostałeś wylogowany.");
      setShowSplash(false); 
    }
  }, []);

  //odpalane gdy wideo sie skonczy
  const handleSplashEnd = () => {
    setIsClosingSplash(true);
    setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("splashSeen", "true");
    }, 400);
  };

  //jeśli by się zacięło to po 7 sekundach przechodzimy dalej jakby nigdy nic
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        handleSplashEnd();
      }, 7000); 
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) {
    return (
      <SplashContainer $isClosing={isClosingSplash}>
        <SplashVideo 
          src="/icons/Final.mp4" 
          autoPlay
          muted 
          playsInline 
          onEnded={handleSplashEnd}
        />
      </SplashContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledBox>
        <Logo />
        <AppTitle />
        <Text
          as="h3"
          style={{ padding: "15px 0", fontWeight: "600"}}
          text="Włącz się do nauki!"
        />
        {infoBanner && <StyledInfoBanner>{infoBanner}</StyledInfoBanner>}
        <StyledSubmitButton $variant="grey" onClick={() => navigate("/login")}>
          Logowanie
        </StyledSubmitButton>
        <StyledSubmitButton
          $variant="grey"
          onClick={() => navigate("/register")}
        >
          Stwórz konto
        </StyledSubmitButton>
      </StyledBox>
    </StyledContainer>
  );
};

export default WelcomePage;
