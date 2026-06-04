import styled from 'styled-components'

const StyledContainer= styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 16px;
  ${({ $danger }) => $danger && 'border: 1px solid rgba(239, 68, 68, 0.35);'}
`

const StyledTitle= styled.h3`
  color: ${({ $danger, theme }) => $danger ? theme.colors.dangerDark : theme.colors.veryDarkPrimary};
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 14px 0;
`

const StyledFeedbackMessage= styled.p`
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: ${({ $error, theme }) =>$error ? theme.colors.danger : theme.colors.success};
  `

const StyledText = styled.p`
  margin: 0 0 14px 0;
  font-size: 0.9rem;
  color: ${({ $danger, theme }) => $danger ? theme.colors.dangerDark : theme.colors.text};
  line-height: 1.4;
`

export const CardBox=({ title, feedbackError, feedbackMessage, text, children, danger })=>{
    return(
    <StyledContainer $danger={danger}>
        {title && <StyledTitle $danger={danger}>
            {title}
        </StyledTitle>}
        {feedbackMessage &&
        <StyledFeedbackMessage $error={feedbackError}>
            {feedbackMessage}
        </StyledFeedbackMessage>
        }
        {text && <StyledText $danger={danger}>{text}</StyledText>}
        {children}
    </StyledContainer>)
}
