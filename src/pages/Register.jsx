import styled from "styled-components";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import EmailStep from "../components/organisms/register/EmailStep";
import AccountDataStep from "../components/organisms/register/AccountDataStep";
import VerificationStep from "../components/organisms/register/VerificationStep";
import EmailVerifiedStep from "../components/organisms/register/EmailVerifiedStep";
import Logo from "../components/atoms/Logo";
import Text from "../components/atoms/Text";
import LegalModal from "../components/organisms/LegalModal";

const StyledContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  height: 100%;

  position: relative;
`;

const StyledContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledBox = styled.div`
  width: 600px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 30px 80px 54px;
  margin-bottom: 15px;
  text-align: center;
  cursor: default;
  @media (max-width: 768px) {
    width: 100%;
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

const StyledLoginButton = styled.div`
  font-size: 0.9rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  > p {
    margin-right: 5px;
    cursor: default;
  }
`;

const StyledLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9em;
`;

const SuccessPopup = styled.div`
  position: fixed;
  top: 20px;
  width: 600px;
  left: 50%;
  transform: translate(-50%, ${({ $visible }) => ($visible ? "0" : "-180%")});
  transition: transform 0.4s ease;
  border: 2px solid ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 24px;
  text-align: center;
  border-radius: 5px;
  z-index: 100;
  @media (max-width: 768px) {
    width: 90%;
  }
`;

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(1000px, 90vw);
  max-height: 85vh;
  overflow-y: auto;
  padding: 60px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.white};
  text-align: center;
  z-index: 1000;
  .closeButton {
    position: sticky;
    top: 0;
    float: right;
    width: 30px;
    height: 30px;
    border-radius: 100%;
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.dark};
    > svg {
      width: 100%;
      height: 100%;
      color: ${({ theme }) => theme.colors.white};
    }
  }
  @media (max-width: 768px) {
    padding: 40px 24px;
    border: 1px solid black;
  }
`;

const Register = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [emailError, setEmailError] = useState(false);

  const [successPopupActive, setSuccessPopupActive] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState("");

  const [termsOfServiceOpen, setTermsOfServiceOpen] = useState(false);
  const [privacyStatementOpen, setPrivacyStatementOpen] = useState(false);

  return (
    <StyledContainer
      onClick={(e) => {
        setTermsOfServiceOpen(false);
        setPrivacyStatementOpen(false);
      }}
    >
      <SuccessPopup $visible={successPopupActive}>
        {successPopupMessage}
      </SuccessPopup>
      <StyledContent>
        <StyledBox>
          <Logo size="small" />
          <StyledTitleImage src="/icons/UniON.PNG" alt="UniON" />
          {step == 1 && (
            <EmailStep
              email={email}
              regex={emailRegex}
              setStep={(e) => setStep(e)}
              setEmail={(e) => setEmail(e)}
              emailError={emailError}
              setEmailError={(e) => setEmailError(e)}
              emailErrorMessage={emailErrorMessage}
              setEmailErrorMessage={(e) => setEmailErrorMessage(e)}
            />
          )}
          {step == 2 && (
            <AccountDataStep
              email={email}
              emailRegex={emailRegex}
              username={username}
              setStep={(e) => setStep(e)}
              setEmailError={(e) => setEmailError(e)}
              setUsername={(e) => setUsername(e)}
              password={password}
              setPassword={(e) => setPassword(e)}
              confirmPassword={confirmPassword}
              setConfirmPassword={(e) => setConfirmPassword(e)}
              setTermsOfServiceOpen={(e) => setTermsOfServiceOpen(e)}
              setPrivacyStatementOpen={(e) => setPrivacyStatementOpen(e)}
              termsOfServiceOpen={termsOfServiceOpen}
              privacyStatementOpen={privacyStatementOpen}
            />
          )}
          {step == 3 && (
            <VerificationStep
              setStep={(e) => setStep(e)}
              email={email}
              setSuccessPopupActive={(e) => setSuccessPopupActive(e)}
              setSuccessPopupMessage={(e) => setSuccessPopupMessage(e)}
            />
          )}
          {step == 4 && <EmailVerifiedStep />}
        </StyledBox>
        <StyledLoginButton>
          <p>Masz już konto?</p>
          <StyledLink to="/login">Zaloguj się</StyledLink>
        </StyledLoginButton>
      </StyledContent>
      {termsOfServiceOpen && (
        <LegalModal type="terms" onClose={() => setTermsOfServiceOpen(false)} />
      )}
      {privacyStatementOpen && (
        <LegalModal type="privacy" onClose={() => setPrivacyStatementOpen(false)} />
      )}
    </StyledContainer>
  );
};

export default Register;
