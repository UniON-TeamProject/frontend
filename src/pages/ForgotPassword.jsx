import styled from "styled-components";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SubmitButton from "../components/atoms/SubmitButton";
import Input from "../components/atoms/Input";
import Logo from "../components/atoms/Logo";
import Text from "../components/atoms/Text";
import { sendResetPasswordCode, resetPassword } from "../api";
import { PASSWORD_REGEX } from "../helpers/validation";
import PasswordRequirements from "../components/atoms/PasswordRequirements";
import VerificationInput from "react-verification-input";

const StyledContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  height: 100%;
`;

const StyledContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
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
  cursor: default;
  @media (max-width: 600px) {
    width: 100%;
    padding: 30px 40px;
    background-color: ${({ theme }) => theme.colors.pageBg};
  }
`;

const StyledTitle = styled.h2`
  width: 100%;
  padding: 0;
  margin: 20px 0 5px 0;
  font-size: 1.1rem;
  text-align: center;
`;

const StyledMessage = styled.h4`
  width: 100%;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 400;
  color: ${({ theme, color }) =>
    color === "danger" ? theme.colors.danger : theme.colors.success};
`;

const StyledLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const ForgotPassword = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [passwordRegexVisible, setPasswordRegexVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState("");

  const [step, setStep] = useState(1);

  const [emailError, setEmailError] = useState(false);
  const [verificationCodeError, setVerificationCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSendResetPasswordCode = async () => {
    setErrorMessage("");
    setSubmitting(true);
    const result = await sendResetPasswordCode(email);
    setSubmitting(false);
    if (result.errorCode) {
      if (result.errorCode == "SUCCESS") {
        setSuccessMessage(result.errorMessage);
        setStep(2);
      } else setErrorMessage(result.errorMessage);
    }
    return;
  };

  const handleResetPassword = async () => {
    setErrorMessage("");
    setSubmitting(true);
    const result = await resetPassword(email, verificationCode, password);
    setSubmitting(false);
    if (result.errorCode) {
      setErrorMessage(result.message);
      if (result.errorCode == "INVALID_TOKEN") setVerificationCodeError(true);
      if (result.errorCode == "SUCCESS") setStep(3);
    }
    return;
  };

  const validateEmail = () => {
    setErrorMessage("");
    setEmailErrorMessage("");
    setEmailError(false);
    if (!email) {
      setEmailErrorMessage("Wypełnij pole");
      setEmailError(true);
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailErrorMessage("Niepoprawny adres e-mail");
      setEmailError(true);
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    setErrorMessage("");
    setPasswordErrorMessage("");
    setPasswordError(false);
    if (!password) {
      setPasswordErrorMessage("Wypełnij pole");
      setPasswordError(true);
      return false;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordErrorMessage("Hasło niepoprawne");
      setPasswordError(true);
      return false;
    }
    return true;
  };

  const validateConfirmPassword = () => {
    setErrorMessage("");
    setConfirmPasswordErrorMessage("");
    setConfirmPasswordError(false);
    if (!confirmPassword) {
      setConfirmPasswordErrorMessage("Wypełnij pole");
      setConfirmPasswordError(true);
      return false;
    }
    if (password != confirmPassword) {
      setConfirmPasswordErrorMessage("Hasła nie są zgodne");
      setConfirmPasswordError(true);
      return false;
    }
    return true;
  };

  return (
    <StyledContainer>
      <StyledContent>
        <StyledBox>
          <Logo size="big" />
          <Text as="h2" bold="true" text="UniON" />
          {step == 1 && (
            <>
              <StyledTitle>Zresetuj hasło</StyledTitle>
              {errorMessage && (
                <StyledMessage color="danger">{errorMessage}</StyledMessage>
              )}
              {emailErrorMessage && (
                <Text
                  as="h2"
                  id=" melo"
                  color="danger"
                  text={emailErrorMessage}
                />
              )}
              <Input
                label="Wpisz adres e-mail, na który ma zostać wysłane przypomnienie hasła"
                autoFocus
                type="text"
                name="email"
                placeholder="Email"
                value={email}
                mode={emailError ? "error" : "normal"}
                onChange={(e) => {
                  setEmailErrorMessage("");
                  setEmail(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && validateEmail())
                    handleSendResetPasswordCode();
                }}
              />
              <SubmitButton
                text={
                  submitting ? "Wysyłanie..." : "Wyślij e-mail resetujący hasło"
                }
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault();
                  if (validateEmail()) handleSendResetPasswordCode();
                }}
                color="dark"
              />
            </>
          )}
          {step == 2 && (
            <>
              <StyledTitle>Zresetuj hasło</StyledTitle>

              {errorMessage && <Text color="danger" text={errorMessage} />}
              {successMessage && <Text color="success" text={successMessage} />}
              {[passwordErrorMessage, confirmPasswordErrorMessage]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((error, idx) => (
                  <Text key={idx} color="danger" text={error} />
                ))}

              <VerificationInput
                validChars="0-9"
                inputProps={{ inputMode: "numeric" }}
                classNames={{
                  container: "container",
                  character: verificationCodeError
                    ? "character error"
                    : "character",
                  characterSelected: "character--selected",
                }}
                onChange={(e) => {
                  setVerificationCode(e);
                  setVerificationCodeError(false);
                }}
              />
              <Input
                label="Wpisz kod wysłany na podany adres e-mail oraz nowe hasło"
                type="password"
                placeholder="Hasło"
                name="password"
                value={password}
                mode={passwordError ? "error" : "normal"}
                autoComplete="new-password"
                onChange={(e) => {
                  setPasswordErrorMessage("");
                  setPassword(e.target.value);
                }}
              />
              <Input
                type="password"
                placeholder="Powtórz hasło"
                name="confirmPassword"
                mode={confirmPasswordError ? "error" : "normal"}
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const passOk = validatePassword();
                    const confirmOk = validateConfirmPassword();
                    if (passOk && confirmOk) handleResetPassword();
                    if (!passOk) setPasswordRegexVisible(true);
                  }
                }}
              />
              {passwordRegexVisible && (
                <PasswordRequirements password={password} />
              )}
              <SubmitButton
                text={submitting ? "Resetowanie..." : "Zresetuj hasło"}
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault();
                  const passOk = validatePassword();
                  const confirmOk = validateConfirmPassword();
                  if (passOk && confirmOk) handleResetPassword();
                  if (!passOk) setPasswordRegexVisible(true);
                }}
                color="dark"
              />
            </>
          )}
          {step == 3 && (
            <StyledTitle>Hasło zostało zmienione pomyślnie</StyledTitle>
          )}
        </StyledBox>
        <StyledLink to="/login">Wróć do logowania</StyledLink>
      </StyledContent>
    </StyledContainer>
  );
};

export default ForgotPassword;
