import React, { useState, useEffect } from 'react'
import SubmitButton from '../../atoms/SubmitButton'
import Input from '../../atoms/Input'
import styled from 'styled-components'
import Text from '../../atoms/Text'
import { emailVerificationRequest } from '../../../api';

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

const EmailStep = ({ email, setEmail, setStep, regex, emailError, setEmailError, emailErrorMessage, setEmailErrorMessage }) => {
    const [errorMessage, setErrorMessage] = useState("");

    const validateEmail = () => {
        setErrorMessage("");
        setEmailErrorMessage("");
        setEmailError(false);
        if (!email) {
            setEmailErrorMessage("Wypełnij pole");
            setEmailError(true);
            return false;
        }
        if (!regex.test(email)) {
            setEmailErrorMessage("Niepoprawny adres e-mail");
            setEmailError(true);
            return false;
        }
        return true;
    }


    const handleVerifyEmail = async () => {
        setErrorMessage("");
        const result = await emailVerificationRequest(email);
        if (result.errorCode && result.errorCode != "EMAIL_AVAILABLE") {
            setErrorMessage(result.message);
            if (result.errorCode == "EMAIL_TAKEN" || result.errorCode == "EMAIL_NOT_VERIFIED") {
                setEmailError(true);
                return;
            }
        }
        setStep(2);
    }

    return (
        <>
            <Text as="h3" bold="true" style={{ margin: "20px 0 5px 0" }} text="Zarejestruj się" />
            <Text text="Wpisz swój adres e-mail, aby się zarejestrować" />
            {errorMessage && <Text color="danger" text={errorMessage} />}
            {emailErrorMessage && <Text color="danger" text={emailErrorMessage} />}
            <Input
                type="text"
                mode={emailError ? "error" : "normal"}
                placeholder="email@domena.pl"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <SubmitButton text="Kontynuuj" color="dark" onClick={(e) => {
                e.preventDefault();
                if (validateEmail())
                    handleVerifyEmail();
            }} />
            <StyledLine><span>lub</span></StyledLine>
            <SubmitButton text="Kontynuuj z Google" path="/" imgPath="./icons/google.png" color="light" />
            <SubmitButton text="Kontynuuj z Apple" path="/" imgPath="./icons/apple.png" color="light" />
        </>
    )
}

export default EmailStep;