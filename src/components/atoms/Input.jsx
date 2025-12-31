import styled from 'styled-components';

const StyledContainer = styled.div`
    display:flex;
    position: relative;
    flex-flow:column wrap;
    margin: 20px 0 20px 0;
    text-align:left;
`

const StyledInput = styled.input`
    padding:8px;
    border-radius:6px;
    font-size:0.9rem;
    background-color:${({ theme }) => theme.colors.white};
    border:none;
    outline: ${({ theme, $error }) => $error ? `2px solid ${theme.colors.danger}` : `1px solid ${theme.colors.darkGrey}`};
`

const Input = ({ name, type, placeholder, onChange, onBlur, error }) => {
    return (
        <StyledContainer>
            <StyledInput type={type} name={name} placeholder={placeholder} onChange={onChange} onBlur={onBlur} $error={error}></StyledInput>
        </StyledContainer>
    )
}

export default Input
