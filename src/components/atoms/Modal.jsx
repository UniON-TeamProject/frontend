import styled from 'styled-components'
import Box from './Box'

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  @media (min-width: 769px) {
    padding-left: var(--sidebar-width, 0px);
  }
`

const ModalBox = styled(Box)`
  width: 90%;
  max-width: 500px;
  padding: 35px 50px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: ${({ $centered }) => $centered ? 'center' : 'left'};
`

export const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  margin: 0 0 10px 0;
  font-size: 1.15rem;
`

export const ModalText = styled.p`
  color: ${({ theme }) => theme.colors.tertiary};
  margin: 0 0 20px 0;
  font-size: 0.9rem;
`

export const Modal = ({ onClose, centered, children }) => (
  <ModalBackdrop onClick={onClose}>
    <ModalBox $centered={centered} onClick={(e) => e.stopPropagation()}>
      {children}
    </ModalBox>
  </ModalBackdrop>
)
