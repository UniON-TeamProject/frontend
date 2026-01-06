import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import SubmitButton from '../../atoms/SubmitButton'
import Text from '../../atoms/Text'
import VerificationInput from "react-verification-input"
import { verificationRequest, resendVerificationToken } from '../../../api'

const ResendVerificationTokenButton = styled.div`
 font-size:0.9rem;
 margin-top:10px;
    display:flex;
    flex-flow:row nowrap;
    justify-content:center;
    cursor:pointer;
    >p{
        margin-right:5px;
        cursor:default;
    }
    div{
        font-weight:600;
    }
`;


const VerificationStep = ({ email }) => {
    const navigate = useNavigate();

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [verificationCodeErrorMessage, setVerificationCodeErrorMessage] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    useEffect(() => {
        if (verificationCode.length == 6 && !serverErrorMessage && !verificationCodeErrorMessage) {
            handleVerifyVerificationCode();
        }
    }, [verificationCode])

    const handleVerifyVerificationCode = async () => {
        setServerErrorMessage("");

        const result = await verificationRequest(email, verificationCode);
        if (result.errorCode) {
            let errorCode = result.errorCode;
            if (result.errorCode == "EMAIL_ALREADY_VERIFIED")
                setVerificationCodeErrorMessage("Użytkownik już jest zweryfikowany");
            else if (result.errorCode == "INVALID_TOKEN") {
                setVerificationCodeErrorMessage("Podano nieprawidłowy kod. ");
                if (result.attemptsLeft != undefined)
                    errorCode += `\n Pozostało prób: ${result.attemptsLeft}`;
            }
            else if (result.errorCode == "USER_NOT_FOUND")
                setVerificationCodeErrorMessage("Nie znaleziono użytkownika");
            else if (result.errorCode == "TOKEN_LIMIT_EXCEEDED")
                setVerificationCodeErrorMessage("Przekroczono limit prób wprowadzenia tokena");
            else if (result.errorCode == "CONNECTION_ERROR")
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie");
        }
        else
            navigate('/');
    }

    return (
        <>
            <Text text={`Na adres ${email} został wysłany kod weryfikacyjny`} />
            {serverErrorMessage && <Text color="danger" text={serverErrorMessage} />}
            {verificationCodeErrorMessage != "" && <Text color="danger" text={verificationCodeErrorMessage} />}
            <Text text="Wpisz kod weryfikacyjny:" />
            <VerificationInput
                classNames={{
                    container: "container",
                    character: serverErrorMessage != "" ? "character error" : "character",
                }}
                onChange={(e) => setVerificationCode(e)}
            />
            <SubmitButton text="Kontynuuj" color="dark" onClick={() => {
                if (verificationCodeErrorMessage || serverErrorMessage)
                    return;
                if (verificationCode.length == 6)
                    handleVerifyVerificationCode();
            }} />

            <ResendVerificationTokenButton>
                <p>Kod nie dotarł?</p>
                <div onClick={() => {
                    resendVerificationToken(email);
                }}> Wyślij kod ponownie</div>
            </ResendVerificationTokenButton>
        </>
    )
}

export default VerificationStep