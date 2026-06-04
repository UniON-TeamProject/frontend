import styled from 'styled-components'
import { CardBox } from './CardBox'

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`

const AvatarButton = styled.button`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.pageBg};
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.6rem;
  font-weight: 800;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 0.15s, box-shadow 0.15s;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &:hover {
    transform: scale(1.04);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  }
  &::after {
    content: 'Zmień';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0;
    transition: opacity 0.15s;
    border-radius: 50%;
  }
  &:hover::after {
    opacity: 1;
  }
`

const IdentityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const IdentityName = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const IdentityEmail = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export const ProfileCard = ({ username, email, avatarId, loading, onAvatarClick }) => (
  <CardBox>
    <ProfileHeader>
      <AvatarButton onClick={onAvatarClick}>
        {!loading && (
          avatarId > 0
            ? <img src={`/icons/avatar${avatarId}.png`} alt="" />
            : getInitials(username)
        )}
      </AvatarButton>
      <IdentityText>
        <IdentityName>{username || 'Użytkownik'}</IdentityName>
        <IdentityEmail>{email}</IdentityEmail>
      </IdentityText>
    </ProfileHeader>
  </CardBox>
)
