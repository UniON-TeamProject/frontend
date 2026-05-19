import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import SubmitButton from '../../atoms/SubmitButton'
import Text from '../../atoms/Text'
import VerificationInput from "react-verification-input"
import { verificationRequest, resendVerificationCode } from '../../../api'

const ResendVerificationCodeButton = styled.div`
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


const VerificationStep = ({ email, setStep, setSuccessPopupActive, setSuccessPopupMessage }) => {
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationCodeError, setVerificationCodeError] = useState(false);

    const handleVerifyVerificationCode = async () => {
        setErrorMessage("");
        const result = await verificationRequest(email, verificationCode);
        if (result.errorCode) {
            if (result.errorCode == "SUCCESS" || result.errorCode == "EMAIL_ALREADY_VERIFIED")
                setStep(4);
            setErrorMessage(result.message)
            if (result.errorCode == "INVALID_TOKEN")
                setVerificationCodeError(true);
        }
        else
            setStep(4);
    }

    const handleResendVerificationCode = async () => {
        setErrorMessage("");
        const result = await resendVerificationCode(email);
        if (result.errorCode) {
            if (result.errorCode == "SUCCESS") {
                setSuccessPopupActive(true);
                setTimeout(() => {
                    setSuccessPopupActive(false);
                }, 3000);
                setSuccessPopupMessage(result.message);
                return;
            }
            setErrorMessage(result.message)
            return;
        }
    }

    return (
        <>
            <Text color="success" text={`Na adres ${email} został wysłany kod weryfikacyjny`} />
            {errorMessage && <Text color="danger" text={errorMessage} />}
            <Text text="Wpisz kod weryfikacyjny:" />
            <div onKeyDown={(e) => {
                if (e.key === "Enter" && verificationCode.length === 6)
                    handleVerifyVerificationCode();
            }}>
                <VerificationInput
                    autoFocus
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
            </div>
            <SubmitButton text="Kontynuuj" color="dark" onClick={() => {
                if (verificationCode.length == 6)
                    handleVerifyVerificationCode();
            }} />

            <ResendVerificationCodeButton>
                <p>Kod nie dotarł?</p>
                <div onClick={() => {
                    handleResendVerificationCode();
                }}> Wyślij kod ponownie</div>
            </ResendVerificationCodeButton>
        </>
    )
}

export default VerificationStep