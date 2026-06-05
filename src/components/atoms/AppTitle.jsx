import styled from 'styled-components'

const StyledImage = styled.img`
  height: 40px;
  width: auto;
  margin: 10px auto;
  display: block;
  object-fit: contain;
`

const AppTitle = () => (
  <StyledImage src="/icons/UniON.PNG" alt="UniON" />
)

export default AppTitle
