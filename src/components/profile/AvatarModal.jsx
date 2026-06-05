import styled from 'styled-components'
import { Modal, ModalTitle } from '../atoms/Modal'

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 16px 0 20px;
  @media (max-width: 480px) {
    gap: 8px;
  }
`

const AvatarOption = styled.button`
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.veryDarkPrimary : 'transparent'};
  box-shadow: ${({ $active }) =>
    $active ? '0 0 0 2px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.1)'};
  cursor: pointer;
  padding: 0;
  background: ${({ theme }) => theme.colors.pageBg};
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover {
    transform: scale(1.07);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const CloseButton = styled.button`
  padding: 8px 18px;
  background-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
`

export const AvatarModal = ({ onClose, avatarId, onSelect }) => (
  <Modal onClose={onClose} centered>
    <ModalTitle>Zmiana awatara</ModalTitle>
    <AvatarGrid>
      {[1, 2, 3, 4, 5].map((id) => (
        <AvatarOption
          key={id}
          $active={avatarId === id}
          onClick={() => onSelect(id)}
        >
          <img src={`/icons/avatar${id}.png`} alt={`Awatar ${id}`} />
        </AvatarOption>
      ))}
    </AvatarGrid>
    <CloseButton onClick={onClose}>Zamknij</CloseButton>
  </Modal>
)
