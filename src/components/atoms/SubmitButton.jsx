import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledButton = styled(Link)`
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme, color }) =>
    color === "dark"
      ? theme.colors.white
      : color === "light"
      ? theme.colors.dark
      : theme.colors.dark};
  background-color: ${({ theme, color }) =>
    color === "dark"
      ? theme.colors.veryDarkPrimary
      : color === "light"
      ? theme.colors.pageBg
      : theme.colors.pageBg};
  > img {
    width: 20px;
    height: 20px;
    margin-right: 15px;
  }
  &[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const SubmitButton = ({
  text,
  path,
  style,
  imgPath,
  color,
  onClick,
  disabled,
}) => {
  return (
    <StyledButton
      style={style}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      color={color}
      to={path}
      aria-disabled={disabled}
    >
      {imgPath && <img src={imgPath} />}
      {text}
    </StyledButton>
  );
};

export default SubmitButton;
