import styled from 'styled-components';
import React from 'react';
import SubmitButton from '../components/atoms/SubmitButton'
import Logo from '../components/atoms/Logo'
import Text from '../components/atoms/Text'

const StyledContainer = styled.div`
   width: 100%;
   min-height: 100vh;
   text-align: center;
   position:relative;
`

const StyledBox = styled.div`
    width: 600px;
    border-radius: 5px;
    margin: 100px auto 15px auto;
    background-color: ${({ theme }) => theme.colors.white};
    padding: 30px 80px 50px 80px;
    cursor: default;
    a{
        margin:10px 0;
    }
    @media(max-width:600px){
        width:100%;
        margin:0 auto;
        padding:30px 40px;
    }
`

const StyledTitle = styled.h2`
    width: 100%;
    padding: 0;
    margin: 20px 0 5px 0;
    font-size: 2rem;
    text-align: center;
`

const WelcomePage = () => {
    return (
        <StyledContainer>
            <StyledBox>
                <Logo size="big" />
                <StyledTitle>StudyUp!</StyledTitle>
                <Text as="h3" style={{ padding: "20px 0" }} text="Notuj, ucz się, powtarzaj" />
                <SubmitButton text="Logowanie" path="/logowanie" light />
                <SubmitButton text="Stwórz konto" path="/rejestracja" light />
            </StyledBox>
        </StyledContainer>
    )
}

export default WelcomePage;
