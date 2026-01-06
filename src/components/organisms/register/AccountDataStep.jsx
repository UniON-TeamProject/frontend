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

const AccountDataStep = ({ username, password, email, emailRegex, setStep, confirmPassword, setUsername, setPassword, setConfirmPassword, setEmailErrorMessage }) => {
    const usernameTimeout = useRef(null);
    const [usernameValid, setUsernameValid] = useState(false);
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{1,55}$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    const [passwordRegexVisible, setPasswordRegexVisible] = useState(false);
    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");

    useEffect(() => {
        setUsernameValid(false);
        if (username && validateUsername()) {
            if (usernameTimeout.current)
                clearTimeout(usernameTimeout.current);
            usernameTimeout.current = setTimeout(() => {
                handleSubmitUsername();
            }, 1000);
        }
    }, [username]);

    const validateUsername = () => {
        if (!username) {
            setUsernameErrorMessage("Wypełnij pole");
            return false;
        }
        if (username.length <= 1) {
            setUsernameErrorMessage("Nazwa musi składać się z przynajmniej dwóch znaków");
            return false;
        }
        if (username.length > 55) {
            setUsernameErrorMessage("Nazwa musi składać się maksymalnie 55 znaków");
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
        if (!password) {
            setPasswordErrorMessage("Wypełnij pole");
            return false;
        }
        if (!passwordRegex.test(password)) {
            setPasswordErrorMessage("Hasło niepoprawne");
            return false;
        }
        setPasswordErrorMessage("");
        return true;
    }

    const validateConfirmPassword = () => {
        if (!confirmPassword) {
            setConfirmPasswordErrorMessage("Wypełnij pole");
            return false;
        }
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
            <Text as="h3" bold="true" style={{ margin: "20px 0 5px 0" }} text="Zarejestruj się" />
            <Text text="Uzupełnij pozostałe dane, aby się zarejestrować" />
            {serverErrorMessage ?
                <Text color="danger" text={serverErrorMessage} />
                :
                [usernameErrorMessage, passwordErrorMessage, confirmPasswordErrorMessage]
                    .filter((v, i, a) => a.indexOf(v) === i) // usuwa duplikaty
                    .map((error, idx) => (
                        <Text key={idx} color="danger" text={error} />
                    ))
            }
            <Input
                placeholder="Nazwa użytkownika"
                type="text"
                name="username"
                mode={usernameErrorMessage ? "error" : usernameValid ? "success" : "normal"}
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Hasło"
                name="password"
                value={password}
                mode={passwordErrorMessage ? "error" : "normal"}
                onChange={e => {
                    setPasswordErrorMessage("");
                    setPassword(e.target.value);
                }
                }
            />
            <Input
                type="password"
                placeholder="Powtórz hasło"
                name="confirmPassword"
                mode={confirmPasswordErrorMessage ? "error" : "normal"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
            />
            {passwordRegexVisible &&
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
            <SubmitButton text="Kontynuuj" color="dark" onClick={e => {
                e.preventDefault();

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
                if (!passOk)
                    setPasswordRegexVisible(true);
            }}
            />
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