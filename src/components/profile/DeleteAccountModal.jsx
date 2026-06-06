import styled from 'styled-components'
import { Modal, ModalTitle, ModalText } from '../atoms/Modal'
import Button from '../atoms/Button'
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
  justify-content: center;
  & > button {
    flex: 1;
  }
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
        <Button $variant="light" type="button" onClick={onClose} disabled={submitting}>
          Anuluj
        </Button>
        <Button $variant="danger" type="submit" disabled={submitting}>
          {submitting ? 'Usuwanie...' : 'Tak, usuń konto'}
        </Button>
      </ButtonsRow>
    </form>
  </Modal>
)
