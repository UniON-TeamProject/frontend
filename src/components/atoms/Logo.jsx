import styled from 'styled-components';

const StyledLogo = styled.img`
    width: ${({ size }) => size == "small" ? '150px' : '200px'};
    height: ${({ size }) => size == "small" ? '150px' : '200px'};
    margin:0 auto;
`

const Logo = ({ size }) => {
    return (
        <StyledLogo size={size} src="./icons/logo.svg" />
    )
}

export default Logo


