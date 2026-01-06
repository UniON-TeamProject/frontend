import React, { useState, useEffect } from 'react'
import SubmitButton from '../../atoms/SubmitButton'
import Input from '../../atoms/Input'
import Text from '../../atoms/Text'
import Line from '../../atoms/Line'
import styled from 'styled-components'
import { emailVerificationRequest } from '../../../api';

const StyledTitle = styled.h2`
    width:100%;
    padding:0;
    margin:20px 0 5px 0;
    font-size:1.1rem;
    text-align:center;
`

const EmailStep = ({ email, setEmail, setStep, regex, emailErrorMessage, setEmailErrorMessage }) => {

    const [emailInputTouched, setEmailInputTouched] = useState(false);

    const [serverErrorMessage, setServerErrorMessage] = useState("");

    useEffect(() => {
        console.log(email);
        if (emailInputTouched)
            validateEmail();
    }, [email]);

    const validateEmail = () => {
        if (!regex.test(email)) {
            setEmailErrorMessage("Niepoprawny adres e-mail");
            return false;
        }
        setEmailErrorMessage("");
        return true;
    }

    const handleVerifyEmail = async () => {
        setServerErrorMessage("");
        const result = await emailVerificationRequest(email);
        if (!result.valid) {
            setEmailErrorMessage("Użytkownik o tym adresie e-mail już istnieje");
            return;
        }
        if (result.errorCode) {
            // if (result.errorCode == "EMAIL_TAKEN")
            //    setEmailErrorMessage("Użytkownik o tym adresie e-mail już istnieje");
            // else if (result.errorCode == "EMAIL_NOT_VERIFIED")
            //     setEmailErrorMessage("Ten adres e-mail jest już zarejestrowany, ale nie został zweryfikowany. Wysłaliśmy nową wiadomość weryfikacyjną");
            // else if (result.errorCode == "CONNECTION_ERROR")
            //     setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie");
        }

        setStep(2);
    }

    return (
        <>
            <StyledTitle>Zarejestruj się</StyledTitle>
            <Text text="Wpisz swój adres e-mail, aby się zarejestrować" />
            {serverErrorMessage && <Text color="danger" text={serverErrorMessage} />}
            {!serverErrorMessage && emailErrorMessage && <Text color="danger" text={emailErrorMessage} />}
            <Input
                mode={emailErrorMessage ? "error" : "normal"}
                placeholder="email@domena.pl"
                type="text"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailInputTouched(true)}
            />
            <SubmitButton text="Kontynuuj" color="dark" onClick={(e) => {
                if (!email) {
                    setEmailErrorMessage("Wypełnij pole");
                    return;
                }
                validateEmail();
                if (!emailErrorMessage) {
                    e.preventDefault();
                    handleVerifyEmail();
                }
            }} />
            <Line><span>lub</span></Line>
            <SubmitButton text="Kontynuuj z Google" path="/" imgPath="./icons/google.png" color="light" />
            <SubmitButton text="Kontynuuj z Apple" path="/" imgPath="./icons/apple.png" color="light" />
        </>
    )
}

export default EmailStep;