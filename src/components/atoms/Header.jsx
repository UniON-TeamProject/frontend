import styled from 'styled-components';

const StyledHeader = styled.h1`
    width:100%;
    padding: 0;
    margin: 0;
    font-size:1.5rem;
    text-align:center;
`

const Text = ({ text, color, style }) => {
    return (
        <StyledHeader style={style} color={color}>{text}</StyledHeader>
    )
}

export default Text


