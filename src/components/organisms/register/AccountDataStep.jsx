import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import SubmitButton from '../../atoms/SubmitButton'
import Input from '../../atoms/Input'
import Text from '../../atoms/Text'

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

const AccountDataStep = ({ username, password, repeatedPassword, setUsername, setPassword, setRepeatedPassword, usernameAvailable, setUsernameAvailable, setEmailVerificationSent }) => {
    const usernameTimeout = useRef(null);

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{1,55}$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    const [usernameInputTouched, setUsernameInputTouched] = useState(false);
    const [passwordInputTouched, setPasswordInputTouched] = useState(false);
    const [repeatedPasswordInputTouched, setRepeatedPasswordInputTouched] = useState(false);

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [repeatedPasswordErrorMessage, setRepeatedPasswordErrorMessage] = useState("");

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
                if (resp.ok) {
                    setEmailVerificationSent(true);
                }
                else
                    setServerErrorMessage(resp.status);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
        setEmailVerificationSent(true);
    }

    return (
        <>
            <Text text="Uzupełnij pozostałe dane, aby się zarejestrować" />
            {serverErrorMessage != "" && <Text color="danger" text={serverErrorMessage} />}
            {serverErrorMessage == "" && usernameErrorMessage != "" && <Text color="danger" text={usernameErrorMessage} />}
            {serverErrorMessage == "" && passwordErrorMessage != "" && <Text color="danger" text={passwordErrorMessage} />}
            {serverErrorMessage == "" && repeatedPasswordErrorMessage != "" && <Text color="danger" text={repeatedPasswordErrorMessage} />}

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
                onChange={e => setRepeatedPassword(e.target.value)}
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

    )
}

export default AccountDataStep;