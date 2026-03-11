import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, parseJwt, removeToken } from '../token';
import Layout from '../components/organisms/Layout';

const StyledContainer = styled.div`
    padding: 20px 40px;
`

const StyledHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const StyledName = styled.h2`
    color: ${({ theme }) => theme.colors.text};
    font-size: 2.5rem;
    cursor:default;
    @media(max-width: 768px){
        font-size: 2rem;
    }
`

const StyledLogoutButton = styled.button`
    padding: 8px 20px;
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover {
        opacity: 0.85;
    }
`

const StyledGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    margin-top: 30px;
    padding: 0 40px;
    width: 100%;
    @media(max-width: 768px){
        grid-template-columns: 1fr;
    }
`

const StyledBox = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 15px;
    box-shadow: 0px 10px 10px -6px ${({ theme }) => theme.colors.darkGrey};
    padding: 24px;
    min-height: 350px;
    cursor: pointer;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
`

const StyledBoxTitle = styled.h3`
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.3rem;
    font-weight: 700;
`

const Home = () => {
    const [username, setUsername] = useState(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        const jwt = getToken();
        if (!jwt) {
            navigate("/", { replace: true });
            return;
        }
        const tokenContent = parseJwt(jwt);
        setUsername(tokenContent?.sub);
    }, []);

    return (
        <Layout>
            <StyledContainer>
                <StyledHeader>
                    <StyledName>Witaj, {username}!</StyledName>
                    <StyledLogoutButton onClick={() => { removeToken(); navigate("/"); }}>
                        Wyloguj
                    </StyledLogoutButton>
                </StyledHeader>
                <StyledGrid>
                    <StyledBox onClick={() => navigate("/learning")}>
                        <StyledBoxTitle>Wróć do nauki</StyledBoxTitle>
                    </StyledBox>
                    <StyledBox>
                        <StyledBoxTitle>Kalendarz</StyledBoxTitle>
                    </StyledBox>
                    <StyledBox>
                        <StyledBoxTitle>Deadlines</StyledBoxTitle>
                    </StyledBox>
                    <StyledBox onClick={() => navigate("/notes")}>
                        <StyledBoxTitle>Ostatnie notatki</StyledBoxTitle>
                    </StyledBox>
                </StyledGrid>
            </StyledContainer>
        </Layout>
    );
};

export default Home;
