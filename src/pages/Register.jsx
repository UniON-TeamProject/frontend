import styled from 'styled-components'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import EmailStep from '../components/organisms/register/EmailStep'
import AccountDataStep from '../components/organisms/register/AccountDataStep'
import VerificationStep from '../components/organisms/register/VerificationStep'
import Logo from '../components/atoms/Logo'

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

const StyledHeader = styled.h1`
    width:100%;
    padding: 0;
    margin: 0;
    font-size:1.5rem;
    text-align:center;
`

const StyledTitle = styled.h2`
    width:100%;
    padding:0;
    margin:20px 0 5px 0;
    font-size:1.1rem;
    text-align:center;
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
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const [emailAvailable, setEmailAvailable] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);

    return (
        <StyledContainer>
            <StyledBox>
                <Logo size="small" />
                <StyledHeader>StudyUp!</StyledHeader>
                <StyledTitle>Zarejestruj się</StyledTitle>
                {!emailAvailable &&
                    <EmailStep
                        email={email}
                        setEmail={e => setEmail(e)}
                        setEmailAvailable={e => setEmailAvailable(e)} />
                }
                {emailAvailable && !emailVerificationSent &&
                    <AccountDataStep
                        username={username}
                        setUsername={(e) => setUsername(e)}
                        password={password}
                        setPassword={(e) => setPassword(e)}
                        repeatedPassword={repeatedPassword}
                        setRepeatedPassword={(e) => setRepeatedPassword(e)}
                        usernameAvailable={usernameAvailable}
                        setUsernameAvailable={(e) => setUsernameAvailable(e)}
                        setEmailVerificationSent={(e) => setEmailVerificationSent(e)} />
                }
                {emailVerificationSent &&
                    <VerificationStep
                        email={email}
                        verificationCode={verificationCode}
                        setVerificationCode={(e) => setVerificationCode(e)} />
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