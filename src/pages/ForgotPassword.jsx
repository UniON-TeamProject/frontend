import styled from 'styled-components'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SubmitButton from '../components/atoms/SubmitButton'
import Input from '../components/atoms/Input'
import Logo from '../components/atoms/Logo'
import Text from '../components/atoms/Text'
import { sendResetPasswordCode, resetPassword } from '../api'
import VerificationInput from "react-verification-input"

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

const ForgotPassword = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    const [passwordRegexVisible, setPasswordRegexVisible] = useState(false);

    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")

    const [errorMessage, setErrorMessage] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");

    const [step, setStep] = useState(1);

    const [emailError, setEmailError] = useState(false);
    const [verificationCodeError, setVerificationCodeError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);


    const handleSendResetPasswordCode = async () => {
        setErrorMessage("");
        const result = await sendResetPasswordCode(email);
        if (result.errorCode) {
            setErrorMessage(result.message);
            if (result.errorCode == "SUCCESS")
                setStep(2);
        }
        return;
    }

    const handleResetPassword = async () => {
        setErrorMessage("");
        const result = await resetPassword(email, verificationCode, password);
        if (result.errorCode) {
            setErrorMessage(result.message);
            if (result.errorCode == "INVALID_TOKEN")
                setVerificationCodeError(true);
            if (result.errorCode == "SUCCESS")
                setStep(3);
        }
        return;
    }

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
    }

    const validatePassword = () => {
        setErrorMessage("");
        setPasswordErrorMessage("");
        setPasswordError(false);
        if (!password) {
            setPasswordErrorMessage("Wypełnij pole");
            setPasswordError(true);
            return false;
        }
        if (!passwordRegex.test(password)) {
            setPasswordErrorMessage("Hasło niepoprawne");
            setPasswordError(true);
            return false;
        }
        return true;
    }

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
    }


    return (
        <StyledContainer>
            <StyledBox>
                <Logo size="big" />
                <Text as="h2" bold="true" text="StudyUp!" />
                {step == 1 &&
                    <>
                        <StyledTitle>Zresetuj hasło</StyledTitle>
                        <Text text="Wpisz swój adres e-mail, na który ma zostać wysłane przypomnienie hasła" />
                        {errorMessage && <StyledMessage color="danger">{errorMessage}</StyledMessage>}
                        {emailErrorMessage && <Text color="danger" text={emailErrorMessage} />}

                        <Input
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={email}
                            mode={emailError ? "error" : "normal"}
                            onChange={(e) => {
                                setEmailErrorMessage("");
                                setEmail(e.target.value);
                            }}
                        />
                        <SubmitButton text="Wyślij e-mail resetujący hasło" onClick={e => {
                            e.preventDefault();
                            if (validateEmail())
                                handleSendResetPasswordCode();
                        }} color="dark" />
                    </>
                }
                {step == 2 && <>
                    <StyledTitle>Zresetuj hasło</StyledTitle>

                    {errorMessage &&
                        <Text color="danger" text={errorMessage} />}

                    {[passwordErrorMessage, confirmPasswordErrorMessage]
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((error, idx) => (
                            <Text key={idx} color="danger" text={error} />
                        ))}

                    <Text text="Wpisz kod wysłany na podany adres e-mail oraz nowe hasło" />
                    <VerificationInput
                        validChars="0-9"
                        inputProps={{ inputMode: "numeric" }}
                        classNames={{
                            container: "container",
                            character: verificationCodeError ? "character error" : "character",
                            characterSelected: "character--selected",
                        }}
                        onChange={(e) => {
                            setVerificationCode(e);
                            setVerificationCodeError(false);
                        }}
                    />
                    <Input
                        type="password"
                        placeholder="Hasło"
                        name="password"
                        value={password}
                        mode={passwordError ? "error" : "normal"}
                        onChange={e => {
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
                    <SubmitButton text="Zresetuj hasło" onClick={e => {
                        e.preventDefault();
                        const passOk = validatePassword();
                        const confirmOk = validateConfirmPassword();
                        if (passOk && confirmOk)
                            handleResetPassword();
                        if (!passOk)
                            setPasswordRegexVisible(true);
                    }} color="dark" />

                </>}
                {step == 3 &&
                    <StyledTitle>Hasło zostało zmienione pomyślnie</StyledTitle>
                }
            </StyledBox>
            <StyledLink to="/logowanie">Wróć do logowania</StyledLink>
        </StyledContainer >

    )
}

export default ForgotPassword;