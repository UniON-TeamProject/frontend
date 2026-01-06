import styled from 'styled-components'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import EmailStep from '../components/organisms/register/EmailStep'
import AccountDataStep from '../components/organisms/register/AccountDataStep'
import VerificationStep from '../components/organisms/register/VerificationStep'
import Logo from '../components/atoms/Logo'
import Text from '../components/atoms/Text'

const StyledContainer = styled.div`
   width:100%;
   min-height:100vh;
   text-align:center;
`

const StyledBox = styled.div`
    width:600px;
    border-radius:5px;
    position:relative;
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

const StyledLoginButton = styled.div`
    font-size:0.9rem;
    display:flex;
    flex-flow:row nowrap;
    justify-content:center;
    >p{
        margin-right:5px;
        cursor:default;
    }
`

const StyledLink = styled(Link)`
    font-weight:600;
    color:${({ theme }) => theme.colors.text};
    font-size:0.9em;
`

const Register = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);

    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    return (
        <StyledContainer>
            <StyledBox>

                <Logo size="small" />

                <Text as="h2" bold="true" text="StudyUp!" />
                {step == 1 &&
                    <EmailStep
                        email={email}
                        regex={emailRegex}
                        setStep={e => setStep(e)}
                        setEmail={e => setEmail(e)}
                        emailErrorMessage={emailErrorMessage}
                        setEmailErrorMessage={e => setEmailErrorMessage(e)} />
                }
                {step == 2 &&
                    <AccountDataStep
                        email={email}
                        emailRegex={emailRegex}
                        username={username}
                        setStep={e => setStep(e)}
                        setEmailErrorMessage={e => setEmailErrorMessage(e)}
                        setUsername={e => setUsername(e)}
                        password={password}
                        setPassword={e => setPassword(e)}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={e => setConfirmPassword(e)} />
                }
                {step == 3 &&
                    <VerificationStep
                        email={email} />
                }
            </StyledBox>
            <StyledLoginButton>
                <p>Masz już konto?</p>
                <StyledLink to="/logowanie">Zaloguj się</StyledLink>
            </StyledLoginButton>
        </StyledContainer >
    )
}

export default Register;