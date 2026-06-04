import styled from 'styled-components'

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 560px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
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

export const Modal = ({ onClose, children }) => (
  <ModalBackdrop onClick={onClose}>
    <ModalBox onClick={(e) => e.stopPropagation()}>
      {children}
    </ModalBox>
  </ModalBackdrop>
)
