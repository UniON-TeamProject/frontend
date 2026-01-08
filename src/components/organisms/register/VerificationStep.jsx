import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import SubmitButton from '../../atoms/SubmitButton'
import Text from '../../atoms/Text'
import VerificationInput from "react-verification-input"
import { verificationRequest, resendVerificationCode } from '../../../api'


const SuccessPopup = styled.div`
    position: fixed;
    top: 20px;
    width:600px;
    left: 50%;
    transform: translate(-50%, ${({ $visible }) => ($visible ? '0' : '-180%')});
    transition: transform 0.4s ease;
    border: 2px solid ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.text};
    padding: 12px 24px;
    border-radius: 5px;
    z-index: 100;
`

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


const VerificationStep = ({ email, setStep }) => {
    const navigate = useNavigate();
    const [successPopupActive, setSuccessPopupActive] = useState(false);
    const [successPopupMessage, setSuccessPopupMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationCodeError, setVerificationCodeError] = useState(false);

    const handleVerifyVerificationCode = async () => {
        setErrorMessage("");
        const result = await verificationRequest(email, verificationCode);
        console.log(result.errorCode);

        if (result.errorCode) {
            if (result.errorCode == "VERIFICATION_SUCCESS" || result.errorCode == "EMAIL_ALREADY_VERIFIED")
                setStep(4);
            setErrorMessage(result.message)
            if (result.errorCode == "INVALID_TOKEN")
                setVerificationCodeError(true);
        }
        else
            navigate('/');

    }

    const handleResendVerificationCode = async () => {
        setErrorMessage("");
        const result = await resendVerificationCode(email);
        if (result.errorCode) {
            if (result.errorCode == "TOKEN_RESENT_SUCCESS") {
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
            <SuccessPopup $visible={successPopupActive}>{successPopupMessage}</SuccessPopup>
            <Text text={`Na adres ${email} został wysłany kod weryfikacyjny`} />
            {errorMessage && <Text color="danger" text={errorMessage} />}
            <Text text="Wpisz kod weryfikacyjny:" />
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