import React, { useState } from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
  display: flex;
  position: relative;
  flex-flow: column wrap;
  margin: 20px 0 20px 0;
  text-align: left;
`;

const StyledLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
`;

const StyledInput = styled.input`
  padding: 8px;
  padding-right: ${({ $hasToggle }) => ($hasToggle ? "36px" : "8px")};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.white};
  @media (max-width: 768px) {
    font-size: 16px;
  }
  border: none;
  outline: ${({ theme, $mode }) =>
    $mode == "error"
      ? `2px solid ${theme.colors.danger}`
      : $mode == "success"
      ? `2px solid ${theme.colors.success}`
      : `1px solid ${theme.colors.darkGrey}`};
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.white} inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text};
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const StyledToggle = styled.button`
  position: absolute;
  right: 8px;
  top: auto;
  bottom: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  svg {
    color: ${({ theme }) => theme.colors.textLight};
    width: 15px;
    height: 15px;
  }
`;

const Input = ({
  name,
  type,
  placeholder,
  onChange,
  onBlur,
  onKeyDown,
  value,
  mode,
  autoFocus,
  autoComplete,
  label,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <StyledContainer>
      {label && <StyledLabel htmlFor={name}>{label}</StyledLabel>}
      <StyledInput
        type={isPassword && showPassword ? "text" : type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        $mode={mode}
        $hasToggle={isPassword}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        {...rest}
      />
      {isPassword && (
        <StyledToggle
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
              <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
            </svg>
          ) : (
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
            </svg>
          )}
        </StyledToggle>
      )}
    </StyledContainer>
  );
};

export default Input;
