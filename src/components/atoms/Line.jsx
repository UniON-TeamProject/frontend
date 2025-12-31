import styled from 'styled-components';


const StyledLine = styled.div`
    width:100%;
    position:relative;
    padding: 20px 0;
    >span{
        position:relative;
        margin:auto;
        padding:0 15px;
        background-color: ${({ theme }) => theme.colors.white};
        z-index:1;
    }
    &:after{
        content: '';
        width: 100%;
        height: 1px;
        background-color:  ${({ theme }) => theme.colors.darkGrey};
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
}
`

const Line = () => {
    return (
        <StyledLine />
    )
}

export default Line


