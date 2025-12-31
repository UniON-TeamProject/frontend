import React, { useState, useEffect } from 'react'
import SubmitButton from '../../atoms/SubmitButton'
import Input from '../../atoms/Input'
import Text from '../../atoms/Text'
import Line from '../../atoms/Line'

const EmailStep = ({ email, setEmail, setEmailAvailable }) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [emailInputTouched, setEmailInputTouched] = useState(false);

    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState("");

    useEffect(() => {
        if (emailInputTouched)
            validateEmail();
    }, [email, emailInputTouched]);

    const validateEmail = () => {
        if (!emailRegex.test(email)) {
            setEmailErrorMessage("Niepoprawny adres e-mail");
            return false;
        }
        setEmailErrorMessage("");
        return true;
    }

    const handleSubmitEmail = (e) => {
        e.preventDefault();
        fetch('https://srv49-20109.wykr.es/studyUp/checkEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
            .then(resp => {
                if (resp.ok)
                    setEmailAvailable(true);
                else
                    setEmailErrorMessage(resp.status);
            })
            .catch(err => {
                setServerErrorMessage("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
                console.error(err);
            });
    }

    return (
        <>
            <Text text="Wpisz swój adres e-mail, aby się zarejestrować" />
            {serverErrorMessage != "" && <Text color="danger" text={serverErrorMessage} />}
            {serverErrorMessage == "" && emailErrorMessage != "" && <Text color="danger" text={emailErrorMessage} />}
            <Input
                error={emailErrorMessage != ""}
                placeholder="email@domena.pl"
                type="text"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailInputTouched(true)}
            />
            <SubmitButton text="Kontynuuj" color="dark" onClick={(e) => {
                if (!validateEmail())
                    return;
                handleSubmitEmail(e);
            }} />
            <Line><span>lub</span></Line>
            <SubmitButton text="Kontynuuj z Google" path="/" imgPath="./icons/google.png" color="light" />
            <SubmitButton text="Kontynuuj z Apple" path="/" imgPath="./icons/apple.png" color="light" />
        </>
    )
}

export default EmailStep;