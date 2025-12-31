import styled from 'styled-components'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SubmitButton from '../components/atoms/SubmitButton'
import Input from '../components/atoms/Input'
import Text from '../components/atoms/Text'
import Line from '../components/atoms/Line'
import Logo from '../components/atoms/Logo'
import Header from '../components/atoms/Header'

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

    const [loginError, setLoginError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setErrorMessage("");
        setLoginError(false);
    }, [login]);

    useEffect(() => {
        setErrorMessage("");
        setPasswordError(false);
    }, [password]);

    const handleLogin = (e) => {
        e.preventDefault();
        fetch('https://srv49-20109.wykr.es/studyUp/signIn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login, password: password })
        })
            .then(resp => {
                if (resp.ok)
                    navigate('/');
                else if (resp.status === 401)
                    setErrorMessage("Nieprawidłowe dane logowania. Spróbuj ponownie.");
                else
                    setErrorMessage(`Błąd serwera: ${resp.status}`);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }

    return (
        <StyledContainer>
            <StyledBox>
                <Logo size="small" />
                <Text bold="true" as="h2" text="StudyUp!" />
                <StyledTitle>Zaloguj się</StyledTitle>
                <Text text="Wpisz swój adres e-mail i hasło, aby zalogować się do konta" />
                {serverErrorMessage != "" && <Text color="danger" text={serverErrorMessage} />}
                {serverErrorMessage == "" && errorMessage != "" && <Text color="danger" text={errorMessage} />}
                <Input
                    type="text"
                    name="login"
                    placeholder="Email lub nazwa użytkownika"
                    value={login}
                    error={loginError}
                    onChange={(e) => {
                        setLogin(e.target.value);
                        setErrorMessage("");
                    }}
                    onBlur={() => {
                        setErrorMessage("");
                    }}
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Hasło"
                    error={passwordError}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage("");
                    }}
                    onBlur={() => {
                        setErrorMessage("");
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
                        setLoginError(true);
                        if (!password)
                            setPasswordError(true);
                        setErrorMessage("Dane logowania są niepoprawne");
                        return;
                    }
                    else if (!password) {
                        setPasswordError(true);
                        setErrorMessage("Dane logowania są niepoprawne");
                        return;
                    }
                    handleLogin(e);
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