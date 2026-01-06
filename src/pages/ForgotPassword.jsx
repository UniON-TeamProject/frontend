import styled from 'styled-components'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SubmitButton from '../components/atoms/SubmitButton'
import Input from '../components/atoms/Input'
import Logo from '../components/atoms/Logo'
import Text from '../components/atoms/Text'

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

const StyledMessage = styled.h4`
    width:100%;
    padding:0;
    margin:0;
    font-size:0.9rem;
    text-align:center;
    font-weight:400;
    color: ${({ theme, color }) => color === "danger" ? theme.colors.danger : theme.colors.success};
`

const StyledLink = styled(Link)`
    font-weight:600;
    color:${({ theme }) => theme.colors.text};
    font-size:0.9rem;
`

const ForgotPassword = () => {
    const [login, setLogin] = useState("");

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [loginErrorMessage, setLoginErrorMessage] = useState(false);

    const [sentEmailMessageActive, setSentEmailMessageActive] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setLoginErrorMessage("");
    }, [login]);


    const handleSendEmial = (e) => {
        e.preventDefault();
        fetch('https://srv49-20109.wykr.es/studyUp/forgotPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login })
        })
            .then(resp => {
                if (resp.ok)
                    navigate('/');
                else
                    setLoginErrorMessage(`Błąd serwera: ${resp.status}`);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }


    return (
        <StyledContainer>
            <StyledBox>
                <Logo size="big" />
                <Text as="h2" bold="true" text="StudyUp!" />
                <StyledTitle>Zresetuj hasło</StyledTitle>
                <Text text="Wpisz swój adres e-mail, na który ma zostać wysłane przypomnienie hasła" />
                {serverErrorMessage != "" && <StyledMessage color="danger">{serverErrorMessage}</StyledMessage>}
                {serverErrorMessage == "" && loginErrorMessage != "" && <Text color="danger" text={loginErrorMessage} />}
                {serverErrorMessage == "" && loginErrorMessage == "" && sentEmailMessageActive &&
                    <Text color="success" text="Jeśli podane dane istnieją w naszym systemie, wysłaliśmy wiadomość z instrukcjami resetu hasła" />
                }

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
                    onBlur={() => {
                        setLoginErrorMessage("");
                    }}
                />
                <SubmitButton text="Wyślij e-mail resetujący hasło" onClick={(e) => {
                    if (!login) {
                        setLoginErrorMessage("Uzupełnij pole");
                        return;
                    }
                    handleSendEmial(e);
                    setSentEmailMessageActive(true);
                }} color="dark" />
            </StyledBox>
            <StyledLink to="/logowanie">Zwóć do logowania</StyledLink>
        </StyledContainer >

    )
}

export default ForgotPassword;