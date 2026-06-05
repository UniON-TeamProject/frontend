import styled from "styled-components";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SubmitButton from "../components/atoms/SubmitButton";
import Input from "../components/atoms/Input";
import Text from "../components/atoms/Text";
import Logo from "../components/atoms/Logo";
import Box from "../components/atoms/Box";
import { loginRequest } from "../api";
import { getToken, saveToken } from "../token";

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
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledBox = styled(Box)`
  width: 600px;
  padding: 30px 80px 54px;
  margin-bottom: 15px;
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

const StyledRegisterButton = styled.div`
  font-size: 0.9rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  > p {
    margin-right: 5px;
    cursor: default;
  }
`;

const StyledLine = styled.div`
  width: 100%;
  position: relative;
  text-align: center;
  padding: 20px 0;
  > span {
    position: relative;
    margin: auto;
    padding: 0 15px;
    background-color: ${({ theme }) => theme.colors.white};
    z-index: 1;
  }
  &:after {
    content: "";
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.darkGrey};
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  @media (max-width: 768px) {
    > span {
      background-color: ${({ theme }) => theme.colors.pageBg};
    }
  }
`;

const StyledRememberMeAndForgotPassword = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 20px 0;
`;

const StyledCheckbox = styled.label`
  > input {
    margin-right: 7px;
  }
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const StyledRedirectButton = styled(SubmitButton)`
  @media (max-width: 768px) {
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) navigate("/home");
  }, []);

  const handleSubmit = () => {
    const loginEmpty = !login;
    const passwordEmpty = !password;

    if (loginEmpty) setLoginErrorMessage("Wypełnij pole");
    if (passwordEmpty) setPasswordErrorMessage("Wypełnij pole");

    if (!loginEmpty && !passwordEmpty) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setSubmitting(true);
    const result = await loginRequest(login, password);
    if (result.errorCode === "EMAIL_NOT_VERIFIED") {
      navigate("/register", { state: true });
    } else if (result.errorCode) {
      setErrorMessage(result.message);
      setSubmitting(false);
    } else {
      saveToken(result.token, rememberMe);
      navigate("/home");
    }
  };

  return (
    <StyledContainer>
      <StyledContent>
        <StyledBox>
          <Logo size="small" />
          <StyledTitleImage src="/icons/UniON.PNG" alt="UniON" />
          <Text
            as="h3"
            bold="true"
            style={{ margin: "20px 0 5px 0" }}
            text="Zaloguj się"
          />
          {errorMessage && <Text color="danger" text={errorMessage} />}

          {[loginErrorMessage, passwordErrorMessage]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((error, idx) => (
              <Text key={idx} color="danger" text={error} />
            ))}
          <Input
            label="Wpisz swój login i hasło, aby się zalogować"
            type="text"
            name="login"
            placeholder="Email lub nazwa użytkownika"
            value={login}
            mode={loginErrorMessage ? "error" : "normal"}
            onChange={(e) => {
              setLogin(e.target.value);
              setLoginErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <Input
            type="password"
            name="password"
            placeholder="Hasło"
            mode={passwordErrorMessage ? "error" : "normal"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <StyledRememberMeAndForgotPassword>
            <StyledCheckbox>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />{" "}
              Zapamiętaj mnie
            </StyledCheckbox>
            <StyledLink to="/reset-password">Nie pamiętasz hasła?</StyledLink>
          </StyledRememberMeAndForgotPassword>
          <SubmitButton
            text={submitting ? "Logowanie..." : "Kontynuuj"}
            color="dark"
            disabled={submitting}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          />
          {/* <StyledLine>
            <span>lub</span>
          </StyledLine>
          <StyledRedirectButton
            text="Kontynuuj z Google"
            path="/"
            imgPath="./icons/google.png"
            color="light"
          />
          <StyledRedirectButton
            text="Kontynuuj z Apple"
            path="/"
            imgPath="./icons/apple.png"
            color="light"
          /> */}
        </StyledBox>
        <StyledRegisterButton>
          <p>Nie masz konta?</p>
          <StyledLink to="/register">Zarejestruj się</StyledLink>
        </StyledRegisterButton>
      </StyledContent>
    </StyledContainer>
  );
};

export default Login;
