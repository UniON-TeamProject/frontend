import styled, { keyframes } from "styled-components";
import React, { useState, useEffect } from "react";
import SubmitButton from "../components/atoms/SubmitButton";
import Text from "../components/atoms/Text";
import Logo from "../components/atoms/Logo";
import Box from "../components/atoms/Box";

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const SplashContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffff;
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
  animation: fadeIn 0.5s ease;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const StyledBox = styled(Box)`
  width: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px 80px 50px 80px;
  cursor: default;
  a {
    margin: 10px 0;
  }
  @media (max-width: 768px) {
    width: 100%;
    margin: 0 auto;
    padding: 30px 40px;
    background-color: ${({ theme }) => theme.colors.pageBg};
  }
`;

const StyledTitleImage = styled.img`
  height: 40px;
  width: auto;
  margin: 10px auto;
  display: block;
  object-fit: contain;
`;

const MobileButtonWrapper = styled.div`
  @media (max-width: 768px) {
    a {
      background-color: ${({ theme }) => theme.colors.white};
    }
  }
`;

const StyledInfoBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.primary}22;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 5px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const LOGOUT_MESSAGES = {
  session_expired: "Twoja sesja wygasła. Zaloguj się ponownie.",
};

const WelcomePage = () => {
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

  //jeśli by się zacięło to po 5 sekundach przechodzimy dalej jakby nigdy nic
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
        <Logo size="big" />
        <StyledTitleImage src="/icons/UniON.PNG" alt="UniON" />
        <Text
          as="h3"
          style={{ padding: "20px 0", fontWeight: "600"}}
          text="Włącz się do nauki!"

        />
        {infoBanner && <StyledInfoBanner>{infoBanner}</StyledInfoBanner>}
        <MobileButtonWrapper>
          <SubmitButton text="Logowanie" path="/login" light />
          <SubmitButton text="Stwórz konto" path="/register" light />
        </MobileButtonWrapper>
      </StyledBox>
    </StyledContainer>
  );
};

export default WelcomePage;
