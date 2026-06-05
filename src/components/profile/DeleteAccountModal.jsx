import styled from 'styled-components'
import { Modal, ModalTitle, ModalText } from '../atoms/Modal'
import Input from '../atoms/Input'

const FeedbackText = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
`

const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`

const BaseButton = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightPrimary};
  }
`

const DangerButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  border: none;
`

export const DeleteAccountModal = ({
  onClose,
  onSubmit,
  password,
  onPasswordChange,
  feedback,
  submitting,
}) => (
  <Modal onClose={onClose} centered>
    <ModalTitle>Usunąć konto?</ModalTitle>
    <ModalText>
      Ta operacja jest nieodwracalna. Wpisz swoje obecne hasło, aby potwierdzić.
    </ModalText>
    <form onSubmit={onSubmit} autoComplete="off">
      <Input
        name="profile-delete-pass"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Obecne hasło"
        autoComplete="new-password"
        autoFocus
      />
      {feedback.message && (
        <FeedbackText $error={feedback.error}>
          {feedback.message}
        </FeedbackText>
      )}
      <ButtonsRow>
        <SecondaryButton type="button" onClick={onClose} disabled={submitting}>
          Anuluj
        </SecondaryButton>
        <DangerButton type="submit" disabled={submitting}>
          {submitting ? 'Usuwanie...' : 'Tak, usuń konto'}
        </DangerButton>
      </ButtonsRow>
    </form>
  </Modal>
)
