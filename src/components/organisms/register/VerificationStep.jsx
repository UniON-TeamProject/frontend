import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SubmitButton from '../../atoms/SubmitButton'
import Text from '../../atoms/Text'
import VerificationInput from "react-verification-input"

const VerificationStep = ({ email, verificationCode, setVerificationCode }) => {
    const navigate = useNavigate();

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [verificationCodeErrorMessage, setVerificationCodeErrorMessage] = useState("");


    const handleVerifyVerificationCode = () => {
        fetch('https://srv49-20109.wykr.es/studyUp/verifyCode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verificationCode: verificationCode })
        })
            .then(resp => {
                if (resp.ok)
                    navigate('/');
                else
                    setVerificationCodeErrorMessage(resp.status);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }

    return (
        <>
            <Text text={`Na adres ${email} został wysłany kod weryfikacyjny`} />
            {serverErrorMessage != "" && <Text color="danger" text={serverErrorMessage} />}
            {serverErrorMessage == "" && verificationCodeErrorMessage != "" && <Text color="danger" text={verificationCodeErrorMessage} />}
            <Text text="Wpisz kod weryfikacyjny:" />
            <VerificationInput
                classNames={{
                    container: "container",
                    character: serverErrorMessage != "" ? "character error" : "character",
                    characterInactive: "character--inactive",
                    characterSelected: "character--selected",
                    characterFilled: "character--filled",
                }}
                onChange={(e) => {
                    setVerificationCode(e);
                    if (e.length == 6)
                        handleVerifyVerificationCode();
                }}
            />
            <SubmitButton text="Kontynuuj" color="dark" onClick={() => {
                if (verificationCode.length == 6)
                    handleVerifyVerificationCode();
            }} />
        </>
    )
}

export default VerificationStep