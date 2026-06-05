import styled from 'styled-components'

const Box = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 24px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
  padding: 30px;
`

export default Box
