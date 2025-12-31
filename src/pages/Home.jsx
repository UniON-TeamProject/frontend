import styled from 'styled-components';
import React from 'react';
import SubmitButton from '../components/atoms/SubmitButton'


const StyledContainer = styled.div`
   width: 100%;
   min-height: 100vh;
   text-align: center;
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
`

const StyledHeader = styled.h2`
    color: ${({ theme }) => theme.colors.text};
    font-size: 3rem;
`

const StyledLogo = styled.img`
    width: 200px;
    height: 200px;
    margin: 0 auto;
`

const StyledTitle = styled.h2`
    width: 100%;
    padding: 0;
    margin: 20px 0 5px 0;
    font-size: 2rem;
    text-align: center;
`


const StyledSubtitle = styled.h4`
    width: 100%;
    padding: 0;
    margin: 20px 0 30px 0;
    font-size: 1rem;
    font-weight: 400;
`


const Home = () => {
    return (
        <StyledContainer>
            <StyledBox>
                <StyledHeader>Witaj!</StyledHeader>
                <StyledLogo src="./icons/logo.svg" />
                <StyledTitle>StudyUp!</StyledTitle>
                <StyledSubtitle>Notuj, ucz się, powtarzaj</StyledSubtitle>
                <SubmitButton text="Logowanie" path="/logowanie" light />
                <SubmitButton text="Stwórz konto" path="/rejestracja" light />
            </StyledBox>
        </StyledContainer>
    )
}

export default Home;
