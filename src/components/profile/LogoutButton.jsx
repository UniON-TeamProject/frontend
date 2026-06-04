import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { removeToken } from '../../token'

const StyledButton = styled.button`
  padding: 9px 18px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightPrimary};
  }
`

export const LogoutButton = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    navigate('/')
  }

  return (
    <StyledButton onClick={handleLogout}>
      Wyloguj
    </StyledButton>
  )
}
