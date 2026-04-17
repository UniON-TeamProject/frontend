import styled from "styled-components";
import React from "react";
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
  @media (max-width: 600px) {
    width: 100%;
    margin: 0 auto;
    padding: 30px 40px;
    background-color: ${({ theme }) => theme.colors.pageBg};
  }
`;

const StyledTitle = styled.h2`
  width: 100%;
  padding: 0;
  margin: 20px 0 5px 0;
  font-size: 2rem;
  text-align: center;
`;

const MobileButtonWrapper = styled.div`
  @media (max-width: 600px) {
    a {
      background-color: ${({ theme }) => theme.colors.white};
    }
  }
`;

const WelcomePage = () => {
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
        <MobileButtonWrapper>
          <SubmitButton text="Logowanie" path="/login" light />
          <SubmitButton text="Stwórz konto" path="/register" light />
        </MobileButtonWrapper>
      </StyledBox>
    </StyledContainer>
  );
};

export default WelcomePage;
