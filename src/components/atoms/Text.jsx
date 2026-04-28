import styled from "styled-components";

const StyledText = styled.h4`
  width: 100%;
  padding: 0;
  margin: 5px 0;
  cursor: default;
  text-align: center;
  font-weight: ${({ $bold }) => ($bold == "true" ? 600 : 400)};
  color: ${({ theme, color }) =>
    color === "danger"
      ? theme.colors.danger
      : color === "success"
      ? theme.colors.success
      : theme.colors.text};
`;

const Text = ({ text, color, style, as, bold }) => {
  return (
    <StyledText $bold={bold} as={as} style={style} color={color}>
      {text}
    </StyledText>
  );
};

export default Text;
