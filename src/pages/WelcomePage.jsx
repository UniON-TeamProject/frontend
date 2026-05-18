import styled from "styled-components";
import React, { useState, useEffect } from "react";
import SubmitButton from "../components/atoms/SubmitButton";
import Logo from "../components/atoms/Logo";
import Text from "../components/atoms/Text";

const StyledContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  text-align: center;
  position: relative;
`;

const StyledBox = styled.div`
  width: 600px;
  border-radius: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.colors.white};
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

const StyledTitle = styled.h2`
  width: 100%;
  padding: 0;
  margin: 5px 0;
  font-size: 2rem;
  text-align: center;
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

  useEffect(() => {
    const reason = sessionStorage.getItem("logout_reason");
    if (reason) {
      sessionStorage.removeItem("logout_reason");
      setInfoBanner(LOGOUT_MESSAGES[reason] ?? "Zostałeś wylogowany.");
    }
  }, []);

  return (
    <StyledContainer>
      <StyledBox>
        <Logo size="big" />
        <StyledTitle>UniON</StyledTitle>
        <Text
          as="h3"
          style={{ padding: "20px 0" }}
          text="Notuj, ucz się, powtarzaj"
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
