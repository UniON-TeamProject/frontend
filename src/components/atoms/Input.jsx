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
    color: ${({ theme }) => theme.colors.text};
    font-size:0.9rem;
    background-color:${({ theme }) => theme.colors.white};
    border:none;
    outline: ${({ theme, $mode }) => $mode == "error" ? `2px solid ${theme.colors.danger}` : $mode == "success" ? `2px solid ${theme.colors.success}` : `1px solid ${theme.colors.darkGrey}`};
`

const Input = ({ name, type, placeholder, onChange, onBlur, value, mode }) => {
    return (
        <StyledContainer>
            <StyledInput type={type} name={name} value={value} placeholder={placeholder} onChange={onChange} onBlur={onBlur} $mode={mode}></StyledInput>
        </StyledContainer>
    )
}

export default Input
