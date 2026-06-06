import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Text from "../../atoms/Text";
import { registerRequest, usernameVerificationRequest } from "../../../api";
import { PASSWORD_REGEX } from "../../../helpers/validation";
import PasswordRequirements from "../../atoms/PasswordRequirements";

const StyledTermsClause = styled.h4`
  width: 100%;
  padding-top: 25px;
  font-size: 0.7rem;
  text-align: center;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textLight};
  > a {
    color: ${({ theme }) => theme.colors.textLight};
  }
  > p {
    display: inline-block;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const ReturnButton = styled.div`
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  cursor: pointer;
  svg {
    height: 16px;
    color: ${({ theme }) => theme.colors.dark};
  }
  p {
    font-size: 0.9rem;
    margin-left: 5px;

    color: ${({ theme }) => theme.colors.dark};
  }
`;


const AccountDataStep = ({
  username,
  password,
  email,
  emailRegex,
  setStep,
  confirmPassword,
  setUsername,
  setPassword,
  setConfirmPassword,
  setEmailError,
  setTermsOfServiceOpen,
  setPrivacyStatementOpen,
  termsOfServiceOpen,
  privacyStatementOpen,
}) => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{1,55}$/;

  const usernameTimeout = useRef(null);
  const [passwordRegexVisible, setPasswordRegexVisible] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState("");

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUsernameValid(false);
    setErrorMessage("");
    setUsernameErrorMessage("");
    setUsernameError(false);
    if (usernameTimeout.current) clearTimeout(usernameTimeout.current);
    if (username) {
      usernameTimeout.current = setTimeout(() => {
        if (validateUsername()) {
          handleSubmitUsername();
        }
      }, 1000);
    }
  }, [username]);

  const validateUsername = () => {
    if (!username) {
      setUsernameErrorMessage("Wypełnij pole");
      setUsernameError(true);
      return false;
    }
    if (username.length <= 1) {
      setUsernameErrorMessage(
        "Nazwa musi składać się z przynajmniej dwóch znaków"
      );
      setUsernameError(true);
      return false;
    }
    if (username.length > 55) {
      setUsernameErrorMessage("Nazwa musi składać się maksymalnie 55 znaków");
      setUsernameError(true);
      return false;
    }
    if (!/^[a-zA-Z]/.test(username)) {
      setUsernameErrorMessage("Nazwa musi rozpoczynać się od litery");
      setUsernameError(true);
      return false;
    }
    if (!usernameRegex.test(username)) {
      setUsernameErrorMessage(
        "Nazwa nie może zawierać spacji ani znaków specjalnych"
      );
      setUsernameError(true);
      return false;
    }
    return true;
  };

  const validatePassword = () => {
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

  const handleSubmitUsername = async () => {
    setErrorMessage("");
    const result = await usernameVerificationRequest(username);
    if (result.errorCode) {
      if (result.errorCode != "USERNAME_AVAILABLE")
        setErrorMessage(result.message);

      if (result.errorCode == "USERNAME_TAKEN") setUsernameError(true);

      if (result.errorCode == "USERNAME_AVAILABLE") setUsernameValid(true);
    }
  };

  const handleSubmit = () => {
    const userOk = validateUsername();
    const passOk = validatePassword();
    const confirmOk = validateConfirmPassword();

    if (userOk && passOk && confirmOk && usernameValid) {
      if (!emailRegex.test(email)) {
        setEmailErrorMessage("Niepoprawny adres e-mail");
        setStep(1);
        return;
      }
      handleRegister();
    }
    if (!passOk) setPasswordRegexVisible(true);
    if (!userOk) setUsernameError(true);
  };

  const handleRegister = async () => {
    setErrorMessage("");
    setSubmitting(true);
    const result = await registerRequest(
      email,
      username,
      password,
      confirmPassword
    );
    setSubmitting(false);
    if (result.errorCode) {
      setErrorMessage(result.message);
      if (result.errorCode == "USERNAME_TAKEN") setUsernameError(true);
      else if (result.errorCode == "USERNAME_AVAILABLE") setUsernameValid(true);
      else if (result.errorCode == "EMAIL_NOT_VERIFIED") setStep(3);
      else if (result.errorCode == "EMAIL_TAKEN") setEmailError(true);
    } else setStep(3);
  };

  return (
    <>
      <ReturnButton onClick={() => setStep(1)}>
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path
            fillRule="evenodd"
            d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
          />
        </svg>
        <p>Wróć</p>
      </ReturnButton>
      <Text
        as="h3"
        bold="true"
        style={{ margin: "20px 0 5px 0" }}
        text="Zarejestruj się"
      />
      {errorMessage && <Text color="danger" text={errorMessage} />}

      {[
        emailErrorMessage,
        usernameErrorMessage,
        passwordErrorMessage,
        confirmPasswordErrorMessage,
      ]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((error, idx) => (
          <Text key={idx} color="danger" text={error} />
        ))}

      <Input
        label="Uzupełnij pozostałe dane, aby się zarejestrować"
        autoFocus
        placeholder="Nazwa użytkownika"
        type="text"
        name="username"
        autoComplete="off"
        mode={usernameError ? "error" : usernameValid ? "success" : "normal"}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Hasło"
        name="password"
        autoComplete="new-password"
        value={password}
        mode={passwordError ? "error" : "normal"}
        onChange={(e) => {
          setPasswordErrorMessage("");
          setPassword(e.target.value);
        }}
      />
      <Input
        type="password"
        placeholder="Powtórz hasło"
        name="confirmPassword"
        autoComplete="new-password"
        mode={confirmPasswordError ? "error" : "normal"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      {passwordRegexVisible && (
        <PasswordRequirements password={password} />
      )}
      <Button
        $variant="dark"
        type="button"
        disabled={submitting}
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{ width: "100%"}}
      >
        {submitting ? "Rejestrowanie..." : "Kontynuuj"}
      </Button>
      <StyledTermsClause>
        Klikając “Kontynuuj” akceptujesz nasz{" "}
        <p
          onClick={(e) => {
            e.stopPropagation();
            setTermsOfServiceOpen(!termsOfServiceOpen);
          }}
        >
          Regulamin
        </p>{" "}
        oraz{" "}
        <p
          onClick={(e) => {
            e.stopPropagation();
            setPrivacyStatementOpen(!privacyStatementOpen);
          }}
        >
          Politykę prywatności
        </p>
        .
      </StyledTermsClause>
    </>
  );
};

export default AccountDataStep;
