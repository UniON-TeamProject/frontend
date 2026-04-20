import styled from "styled-components";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import EmailStep from "../components/organisms/register/EmailStep";
import AccountDataStep from "../components/organisms/register/AccountDataStep";
import VerificationStep from "../components/organisms/register/VerificationStep";
import EmailVerifiedStep from "../components/organisms/register/EmailVerifiedStep";
import Logo from "../components/atoms/Logo";
import Text from "../components/atoms/Text";

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
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const StyledBox = styled.div`
  width: 600px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 30px 80px;
  margin-bottom: 15px;
  text-align: center;
  cursor: default;
  @media (max-width: 600px) {
    width: 100%;
    padding: 30px 40px;
    background-color: ${({ theme }) => theme.colors.pageBg};
  }
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
  @media (max-width: 600px) {
    width: 90%;
  }
`;

const StyledPopup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1000px;
  min-height: 80vh;
  padding: 60px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.white};
  text-align: center;
  .closeButton {
    position: absolute;
    top: 40px;
    right: 40px;
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
    width: 90%;
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
          <Text as="h2" bold="true" text="UniON" />
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
        <StyledPopup onClick={(e) => e.stopPropagation()}>
          <div
            className="closeButton"
            onClick={() => setTermsOfServiceOpen(false)}
          >
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
          </div>
          <Text bold="true" as="h2" text="Regulamin" />
          <p>Tu wpiszemy regulamin</p>
        </StyledPopup>
      )}
      {privacyStatementOpen && (
        <StyledPopup onClick={(e) => e.stopPropagation()}>
          <div
            className="closeButton"
            onClick={() => setPrivacyStatementOpen(false)}
          >
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
          </div>
          <Text bold="true" as="h2" text="Polityka prywatności" />
          <p>Tu wpiszemy politykę prywatności</p>
        </StyledPopup>
      )}
    </StyledContainer>
  );
};

export default Register;
