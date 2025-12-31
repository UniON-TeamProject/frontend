import styled from 'styled-components'
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SubmitButton from '../components/atoms/SubmitButton'
import Input from '../components/atoms/Input'

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

const StyledLogo = styled.img`
    width:150px;
    height:150px;
    margin:0 auto;
`

const StyledHeader = styled.h1`
    width:100%;
    padding: 0;
    margin: 0;
    font-size:1.5rem;
    text-align:center;
`

const StyledTitle = styled.h2`
    width:100%;
    padding:0;
    margin:20px 0 5px 0;
    font-size:1.1rem;
    text-align:center;
`

const StyledErrorMessage = styled.h4`
    width:100%;
    padding:0;
    margin:0;
    font-size:0.9rem;
    text-align:center;
    font-weight:400;
    color: ${({ theme }) => theme.colors.danger};
`


const StyledSubtitle = styled.h4`
    width:100%;
    padding:0;
    margin:0 0 15px 0;
    font-size:0.9rem;
    text-align:center;
    font-weight:400;
    color:${({ theme }) => theme.colors.text};
    `

const StyledLoginButton = styled.div`
    font-size:0.9rem;
    display:flex;
    flex-flow:row nowrap;
    justify-content:center;
    >p{
        margin-right:5px;
        cursor:default;
    }
`


const StyledLine = styled.div`
    width:100%;
    position:relative;
    padding: 20px 0;
    >span{
        position:relative;
        margin:auto;
        padding:0 15px;
        background-color: ${({ theme }) => theme.colors.white};
        z-index:1;
    }
    &:after{
        content: '';
        width: 100%;
        height: 1px;
        background-color:  ${({ theme }) => theme.colors.darkGrey};
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
}
`

const StyledTermsClause = styled.h4`
    width:100%;
    padding-top:25px;
    font-size:0.7rem;
    text-align:center;
    font-weight:400;
    color: ${({ theme }) => theme.colors.textLight};
    >a{
        color:${({ theme }) => theme.colors.textLight};
    }
`

const StyledLink = styled(Link)`
    font-weight:600;
    color:${({ theme }) => theme.colors.text};
    font-size:0.9em;
`

const StyledPasswordRequirementsList = styled.ul`
    text-align:left;
    font-size:0.8rem;
    color:${({ theme }) => theme.colors.textLight};
    margin-bottom:15px;
`

const StyledPasswordRequirement = styled.li`
    margin-left:10px;
    text-decoration: ${({ $crossedOut }) => $crossedOut ? "line-through" : "none"};
`

const Register = () => {
    const usernameTimeout = useRef(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{1,55}$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatetPassword] = useState("");

    const [emailInputTouched, setEmailInputTouched] = useState(false);
    const [usernameInputTouched, setUsernameInputTouched] = useState(false);
    const [passwordInputTouched, setPasswordInputTouched] = useState(false);
    const [repeatedPasswordInputTouched, setRepeatedPasswordInputTouched] = useState(false);

    const [emailAvailable, setEmailAvailable] = useState(true);
    const [usernameAvailable, setUsernameAvailable] = useState(true);

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [repeatedPasswordErrorMessage, setRepeatedPasswordErrorMessage] = useState("");

    useEffect(() => {
        if (emailInputTouched)
            validateEmail();
    }, [email, emailInputTouched]);


    useEffect(() => {
        if (usernameInputTouched)
            validateUsername();
    }, [username, usernameInputTouched]);


    useEffect(() => {
        if (passwordInputTouched)
            validatePassword();
    }, [password, passwordInputTouched]);

    useEffect(() => {
        if (repeatedPasswordInputTouched)
            validateRepeatedPassword();
    }, [repeatedPassword, password]);


    const navigate = useNavigate();

    const validateEmail = () => {
        if (!emailRegex.test(email)) {
            setEmailErrorMessage("Niepoprawny adres e-mail");
            return false;
        }
        setEmailErrorMessage("");
        return true;
    }

    const validateUsername = () => {
        if (username.length <= 1) {
            setUsernameErrorMessage("Nazwa musi składać się z przynajmniej dwóch znaków");
            return false;
        }
        if (!/^[a-zA-Z]/.test(username)) {
            setUsernameErrorMessage("Nazwa musi rozpoczynać się od litery");
            return false;
        }
        if (!usernameRegex.test(username)) {
            setUsernameErrorMessage("Nazwa nie może zawierać spacji ani znaków specjalnych");
            return false;
        }
        setUsernameErrorMessage("");
        return true;
    }

    const validatePassword = () => {
        if (!passwordRegex.test(password)) {
            setPasswordErrorMessage("Hasło niepoprawne");
            return false;
        }
        setPasswordErrorMessage("");
        return true;
    }

    const validateRepeatedPassword = () => {
        if (password != repeatedPassword) {
            setRepeatedPasswordErrorMessage("Hasła nie są zgodne");
            return false;
        }
        setRepeatedPasswordErrorMessage("");
        return true;
    }

    const handleSubmitEmail = (e) => {
        e.preventDefault();
        fetch('https://srv49-20109.wykr.es/studyUp/checkEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
            .then(resp => {
                if (resp.ok)
                    setEmailAvailable(true);
                else
                    setEmailErrorMessage(resp.status);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }

    const handleSubmitUsername = (e) => {
        e.preventDefault();
        fetch('https://srv49-20109.wykr.es/studyUp/checkUsername', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        })
            .then(resp => {
                if (resp.ok)
                    setUsernameAvailable(true);
                else
                    setUsernameErrorMessage(resp.status);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }

    const handleRegister = (e) => {
        e.preventDefault();
        fetch('https://srv49-20109.wykr.es/studyUp/signUp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, username: username, password: password, confirmPassword: repeatedPassword })
        })
            .then(resp => {
                if (resp.ok)
                    navigate('/logowanie');
                else
                    setServerErrorMessage(resp.status);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }

    return (
        <StyledContainer>
            <StyledBox>
                <StyledLogo src="./icons/logo.svg" />
                <StyledHeader>StudyUp!</StyledHeader>
                <StyledTitle>Zarejestruj się</StyledTitle>
                {!emailAvailable ?
                    <>
                        <StyledSubtitle>Wpisz swój adres e-mail, aby się zarejestrować</StyledSubtitle>
                        {serverErrorMessage != "" ? <StyledErrorMessage>{serverErrorMessage}</StyledErrorMessage> : <></>}
                        {serverErrorMessage == "" && emailErrorMessage != "" ? <StyledErrorMessage>{emailErrorMessage}</StyledErrorMessage> : <></>}
                        <Input
                            error={emailErrorMessage != ""}
                            placeholder="email@domena.pl"
                            type="text"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={() => setEmailInputTouched(true)}
                        />
                        <SubmitButton text="Kontynuuj" color="dark" onClick={(e) => {
                            if (!validateEmail())
                                return;
                            handleSubmitEmail(e);
                        }} />
                        <StyledLine><span>lub</span></StyledLine>
                        <SubmitButton text="Kontynuuj z Google" path="/" imgPath="./icons/google.png" color="light" />
                        <SubmitButton text="Kontynuuj z Apple" path="/" imgPath="./icons/apple.png" color="light" />
                    </>
                    :
                    <>
                        {serverErrorMessage != "" ? <StyledErrorMessage>{serverErrorMessage}</StyledErrorMessage> : <></>}
                        {serverErrorMessage == "" && usernameErrorMessage != "" ? <StyledErrorMessage>{usernameErrorMessage}</StyledErrorMessage> : <></>}
                        {serverErrorMessage == "" && passwordErrorMessage != "" ? <StyledErrorMessage>{passwordErrorMessage}</StyledErrorMessage> : <></>}
                        {serverErrorMessage == "" && repeatedPasswordErrorMessage != "" ? <StyledErrorMessage>{repeatedPasswordErrorMessage}</StyledErrorMessage> : <></>}

                        <Input
                            placeholder="Nazwa użytkownika"
                            type="text"
                            name="username"
                            error={usernameErrorMessage != ""}
                            value={username}
                            onBlur={() => setUsernameInputTouched(true)}
                            onChange={e => {
                                if (usernameAvailable)
                                    setUsername(e.target.value);
                                if (usernameTimeout.current)
                                    clearTimeout(usernameTimeout.current);
                                usernameTimeout.current = setTimeout(() => {
                                    handleSubmitUsername(e);
                                }, 500);
                            }}
                        />
                        <Input
                            type="password"
                            placeholder="Hasło"
                            name="password"
                            value={password}
                            error={passwordErrorMessage != ""}
                            onBlur={() => setPasswordInputTouched(true)}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Powtórz hasło"
                            name="repeatPassword"
                            error={repeatedPasswordErrorMessage != ""}
                            value={repeatedPassword}
                            onBlur={() => setRepeatedPasswordInputTouched(true)}
                            onChange={e => setRepeatetPassword(e.target.value)}
                        />
                        {passwordInputTouched ?
                            <StyledPasswordRequirementsList>Wymagania dotyczące hasła:
                                <StyledPasswordRequirement $crossedOut={password.length >= 8}>
                                    co najmniej 8 znaków
                                </StyledPasswordRequirement>
                                <StyledPasswordRequirement $crossedOut={/[a-z]/.test(password)}>
                                    jedna mała litera
                                </StyledPasswordRequirement>
                                <StyledPasswordRequirement $crossedOut={/[A-Z]/.test(password)}>
                                    jedna wielka litera
                                </StyledPasswordRequirement>
                                <StyledPasswordRequirement $crossedOut={/\d/.test(password)}>
                                    jedna cyfra
                                </StyledPasswordRequirement>
                                <StyledPasswordRequirement $crossedOut={/[#?!@$%^&*-]/.test(password)}>
                                    jeden znak specjalny (#?!@$%^&*-)
                                </StyledPasswordRequirement>
                            </StyledPasswordRequirementsList>
                            : <></>
                        }
                        <SubmitButton text="Kontynuuj" color="dark" onClick={(e) => {
                            if (!validateUsername() || !validatePassword() || !validateRepeatedPassword())
                                return;
                            handleRegister(e);
                        }} />
                        <StyledTermsClause>
                            Klikając “Kontynuuj” akceptujesz nasz{" "}
                            <Link to="/regulamin">Regulamin</Link> oraz{" "}
                            <Link to="/polityka-prywatnosci">Politykę prywatności</Link>
                            .
                        </StyledTermsClause>
                    </>
                }
            </StyledBox>

            <StyledLoginButton>
                <p>Masz już konto?</p>
                <StyledLink to="/logowanie">Zaloguj się</StyledLink>
            </StyledLoginButton>
        </StyledContainer >
    )
}

export default Register;