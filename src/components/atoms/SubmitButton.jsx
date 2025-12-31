import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledButton = styled(Link)`
    box-sizing:border-box;
    display:flex;
    flex-flow:row nowrap;
    justify-content:center;
    align-items:center;
    width:100%;
    padding:10px;
    margin-top:8px;
    border-radius:5px;
    text-decoration:none;
    color: ${({ theme, color }) => color === 'dark' ? theme.colors.white : color === 'light' ? theme.colors.dark : theme.colors.dark};
    background-color: ${({ theme, color }) => color === 'dark' ? theme.colors.dark : color === 'light' ? theme.colors.lightGrey : theme.colors.lightGrey};
    >img{
        width:20px;
        height:20px;
        margin-right:15px;
    }
`

const SubmitButton = ({ text, path, imgPath, color, onClick }) => {
    return (
        <StyledButton onClick={onClick} color={color} to={path}>
            {imgPath && <img src={imgPath} />}
            {text}
        </StyledButton>
    )
}

export default SubmitButton


