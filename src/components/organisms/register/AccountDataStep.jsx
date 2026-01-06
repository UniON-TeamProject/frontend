import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import SubmitButton from '../../atoms/SubmitButton'
import Input from '../../atoms/Input'
import Text from '../../atoms/Text'
import { registerRequest, checkUsernameRequest } from '../../../api'

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

const ReturnButton = styled.div`
    position:absolute;
    top:30px;
    left:30px;
    display:flex;
    flex-flow:row nowrap;
    align-items:center;
    cursor:pointer;
    img{
        height:16px; 
        color:${({ theme }) => theme.colors.dark};
    }
    p{
        font-size:.9rem;
        margin-left:5px;

        color:${({ theme }) => theme.colors.dark};
    }

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

const StyledTitle = styled.h2`
    width:100%;
    padding:0;
    margin:20px 0 5px 0;
    font-size:1.1rem;
    text-align:center;
`

const AccountDataStep = ({ username, password, email, emailRegex, setStep, confirmPassword, setUsername, setPassword, setConfirmPassword, setEmailErrorMessage }) => {
    const usernameTimeout = useRef(null);
    const [usernameValid, setUsernameValid] = useState(false);
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{1,55}$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    const [usernameInputTouched, setUsernameInputTouched] = useState(false);
    const [passwordInputTouched, setPasswordInputTouched] = useState(false);
    const [confirmPasswordInputTouched, setConfirmPasswordInputTouched] = useState(false);


    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");


    useEffect(() => {
        if (username && username.length > 1 && usernameRegex.test(username) && /^[a-zA-Z]/.test(username)) {
            validateUsername();
            if (usernameTimeout.current)
                clearTimeout(usernameTimeout.current);
            usernameTimeout.current = setTimeout(() => {
                handleSubmitUsername();
            }, 1000);
        }
    }, [username]);

    useEffect(() => {
        if (password && passwordInputTouched) {
            validatePassword();
        }
    }, [password]);

    useEffect(() => {
        if (confirmPasswordInputTouched)
            validateRepeatedPassword();
    }, [confirmPassword, password]);


    const validateUsername = () => {
        if (!usernameValid)
            return false;
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
        if (password != confirmPassword) {
            setConfirmPasswordErrorMessage("Hasła nie są zgodne");
            return false;
        }
        setConfirmPasswordErrorMessage("");
        return true;
    }

    const handleSubmitUsername = async () => {
        const result = await checkUsernameRequest(username);
        if (!result.valid) {
            setUsernameErrorMessage("Użytkownik o tej nazwie użytkownika już istnieje");
            return;
        }

        setUsernameValid(true);
        // if (result.errorCode) {
        //     if (result.errorCode == "USERNAME_TAKEN")
        //         setUsernameErrorMessage("Użytkownik o takiej nazwie użytkownika już istnieje");
        //     else if (result.errorCode == "CONNECTION_ERROR")
        //         setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie");
        // }
    }

    const handleRegister = async () => {
        setServerErrorMessage("");
        const result = await registerRequest(email, username, password, confirmPassword);
        if (result.errorCode) {
            if (result.errorCode == "USERNAME_TAKEN")
                setUsernameErrorMessage("Użytkownik o takiej nazwie użytkownika już istnieje");
            else if (result.errorCode == "EMAIL_TAKEN") {
                setEmailErrorMessage("Użytkownik o takim adresie email już istnieje");
                setStep(1);
            }
            else if (result.errorCode == "EMAIL_NOT_VERIFIED") {
                setEmailErrorMessage("Ten adres e-mail jest już zarejestrowany, ale nie został zweryfikowany. Wysłaliśmy nową wiadomość weryfikacyjną");
                setStep(1);
            }
            else if (result.errorCode == "CONNECTION_ERROR")
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie");
        } else
            setStep(3);
    }

    return (
        <>
            <ReturnButton onClick={() => setStep(1)}>
                <img src="./icons/arrow_left.png" />
                <p>Wróć</p>
            </ReturnButton>
            <StyledTitle>Zarejestruj się</StyledTitle>
            <Text text="Uzupełnij pozostałe dane, aby się zarejestrować" />
            {serverErrorMessage && <Text color="danger" text={serverErrorMessage} />}
            {!serverErrorMessage && usernameErrorMessage && <Text color="danger" text={usernameErrorMessage} />}
            {!serverErrorMessage && passwordErrorMessage && <Text color="danger" text={passwordErrorMessage} />}
            {!serverErrorMessage && confirmPasswordErrorMessage && <Text color="danger" text={confirmPasswordErrorMessage} />}

            <Input
                placeholder="Nazwa użytkownika"
                type="text"
                name="username"
                mode={usernameErrorMessage ? "error" : usernameValid ? "success" : "normal"}
                value={username}
                onBlur={() => setUsernameInputTouched(true)}
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Hasło"
                name="password"
                value={password}
                mode={passwordErrorMessage ? "error" : "normal"}
                onBlur={() => setPasswordInputTouched(true)}
                onChange={e => setPassword(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Powtórz hasło"
                name="repeatPassword"
                mode={confirmPasswordErrorMessage ? "error" : "normal"}
                onBlur={() => setConfirmPasswordInputTouched(true)}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
            />
            {passwordInputTouched &&
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
            }
            <SubmitButton text="Kontynuuj" color="dark" onClick={(e) => {
                if (!usernameValid && (!validateUsername() || !validatePassword() || !validateRepeatedPassword()
                    || !serverErrorMessage || !usernameErrorMessage || !passwordErrorMessage || !confirmPasswordErrorMessage))
                    return;
                if (!emailRegex.test(email)) {
                    setEmailErrorMessage("Niepoprawny adres e-mail");
                    setStep(1);
                    return;
                }
                e.preventDefault();
                handleRegister();
            }} />
            <StyledTermsClause>
                Klikając “Kontynuuj” akceptujesz nasz{" "}
                <Link to="/regulamin">Regulamin</Link> oraz{" "}
                <Link to="/polityka-prywatnosci">Politykę prywatności</Link>
                .
            </StyledTermsClause>
        </>

    )
}

export default AccountDataStep;