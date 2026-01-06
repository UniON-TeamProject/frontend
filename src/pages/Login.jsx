import styled from 'styled-components'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SubmitButton from '../components/atoms/SubmitButton'
import Input from '../components/atoms/Input'
import Text from '../components/atoms/Text'
import Line from '../components/atoms/Line'
import Logo from '../components/atoms/Logo'
import { loginRequest } from '../api'

const StyledContainer = styled.div`
   width:100%;
   min-height:100vh;
   text-align:center;
`

const StyledBox = styled.div`
    width:600px;
    border-radius:5px;
    background-color: ${({ theme }) => theme.colors.white};
    margin:100px auto 15px auto;
    padding:30px 80px;
    cursor:default;
    @media(max-width:600px){
        width:100%;
        margin:0 auto;
        padding:30px 40px;
    }
`

const StyledTitle = styled.h2`
    width:100%;
    padding:0;
    margin:20px 0 5px 0;
    font-size:1.1rem;
    text-align:center;
`

const StyledRegisterButton = styled.div`
    font-size:0.9rem;
    display:flex;
    flex-flow:row nowrap;
    justify-content:center;
    >p{
        margin-right:5px;
        cursor:default;
    }
`

const StyledContent = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    margin: 20px 0;
`;

const StyledCheckbox = styled.label`
    >input{
        margin-right: 7px;
    }
    font-size: 0.9rem;
    color:${({ theme }) => theme.colors.text};
`;

const StyledLink = styled(Link)`
    font-weight:600;
    color:${({ theme }) => theme.colors.text};
    font-size:0.9rem;
`

const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false);

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [loginErrorMessage, setLoginErrorMessage] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        setServerErrorMessage("");
        const result = await loginRequest(login, password);
        if (result.errorCode) {
            if (result.errorCode == "USER_NOT_FOUND")
                setLoginErrorMessage("Użytkownik nie istnieje");
            else if (result.errorCode == "EMAIL_NOT_VERIFIED")
                setLoginErrorMessage("Email nie jest zweryfikowany");
            else if (result.errorCode == "INVALID_PASSWORD")
                setServerErrorMessage("Login lub hasło są niepoprawne");
            else if (result.errorCode == "CONNECTION_ERROR")
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie");
        }
        else
            navigate('/');
    }

    return (
        <StyledContainer>
            <StyledBox>
                <Logo size="small" />
                <Text bold="true" as="h2" text="StudyUp!" />
                <StyledTitle>Zaloguj się</StyledTitle>
                <Text text="Wpisz swój login i hasło, aby zalogować się do konta" />
                {serverErrorMessage && <Text color="danger" text={serverErrorMessage} />}
                {!serverErrorMessage && loginErrorMessage && <Text color="danger" text={loginErrorMessage} />}
                {!serverErrorMessage && passwordErrorMessage && <Text color="danger" text={passwordErrorMessage} />}
                <Input
                    type="text"
                    name="login"
                    placeholder="Email lub nazwa użytkownika"
                    value={login}
                    mode={loginErrorMessage ? "error" : "normal"}
                    onChange={(e) => {
                        setLogin(e.target.value);
                        setLoginErrorMessage("");
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
                />
                <StyledContent>
                    <StyledCheckbox>
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Zapamiętaj mnie
                    </StyledCheckbox>
                    <StyledLink to="/przypomnienie-hasla">Nie pamiętasz hasła?</StyledLink>
                </StyledContent>
                <SubmitButton text="Kontynuuj" onClick={(e) => {
                    if (!login) {
                        setLoginErrorMessage("Wypełnij pole");
                        return;
                    }
                    if (!password) {
                        setPasswordErrorMessage("Wypełnij pole");
                        return;
                    }
                    if (serverErrorMessage || loginErrorMessage || passwordErrorMessage)
                        return;
                    e.preventDefault();
                    handleLogin();
                }} color="dark" />
                <Line><span>lub</span></Line>
                <SubmitButton text="Kontynuuj z Google" path="/" imgPath="./icons/google.png" color="light" />
                <SubmitButton text="Kontynuuj z Apple" path="/" imgPath="./icons/apple.png" color="light" />
            </StyledBox>
            <StyledRegisterButton>
                <p>Nie masz konta?</p>
                <StyledLink to="/rejestracja">Zarejestruj się</StyledLink>
            </StyledRegisterButton>
        </StyledContainer >

    )
}


export default Login;