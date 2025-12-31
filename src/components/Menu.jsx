import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledMenu = styled.nav`
    display:flex;
    flex-flow:row nowrap;
    align-items:center;
    justify-content:flex-end;
    :nth-child(2){
        border-radius:5px;
        border:2px solid ${({ theme }) => theme.colors.white};
    }
`

const StyledLink = styled(Link)`
    padding: 8px 13px ;
    margin: 10px;
    font-weight:600;
    color:${({ theme }) => theme.colors.text};
    text-decoration:none;
`

const Menu = () => {
    return (
        <StyledMenu>
            <StyledLink to="/logowanie">Logowanie</StyledLink>
            <StyledLink to="/rejestracja">Rejestracja</StyledLink>
        </StyledMenu>
    )

}

export default Menu
