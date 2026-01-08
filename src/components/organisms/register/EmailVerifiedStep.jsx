import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate, Link } from 'react-router-dom'
import Text from '../../atoms/Text'

const StyledMessage = styled.div`
    color: ${({ theme }) => theme.colors.text};
    >p{
        margin:20px 0;
        font-size:1rem;
    }
`

const StyledLink = styled(Link)`    
    font-weight:600;
    color:${({ theme }) => theme.colors.text};
`

const EmailVerifiedStep = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <StyledMessage>
            <Text text="Email został zweryfikowany poprawnie"></Text>
            <Text text="Za chwilę zostaniesz przekierowany na stronę główną."></Text>

            <StyledLink to='/'>
                Przejdź teraz
            </StyledLink>
        </StyledMessage>
    )
}

export default EmailVerifiedStep