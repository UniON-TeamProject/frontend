import styled, { css } from "styled-components";

const VARIANTS = {
  light: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.veryDarkPrimary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.lightPrimary};
    }
  `,
  dark: css`
    background-color: ${({ theme }) => theme.colors.veryDarkPrimary};
    color: ${({ theme }) => theme.colors.white};
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.white};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.dangerDark};
    }
  `,
  grey: css`
    background-color: ${({ theme }) => theme.colors.pageBg};
    color: ${({ theme }) => theme.colors.dark};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.borderLight};
    }
  `,
};

const Button = styled.button`
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: 0.2s;

  ${({ $variant }) => VARIANTS[$variant] || VARIANTS.light}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button;
