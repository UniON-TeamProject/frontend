import styled from "styled-components";

const List = styled.ul`
  text-align: left;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 6px 0 12px;
  padding-left: 4px;
  list-style: none;
`;

const Header = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-weight: 600;
  margin-bottom: 4px;
`;

const Item = styled.li`
  margin-left: 10px;
  text-decoration: ${({ $crossedOut }) =>
    $crossedOut ? "line-through" : "none"};
  color: ${({ $crossedOut, theme }) =>
    $crossedOut ? theme.colors.success : theme.colors.tertiary};
  &::before {
    content: "${({ $crossedOut }) => ($crossedOut ? "✓" : "•")}";
    display: inline-block;
    width: 14px;
    margin-right: 4px;
  }
`;

const REQUIREMENTS = [
  { test: (p) => p.length >= 14, label: "co najmniej 14 znaków" },
  { test: (p) => /[a-z]/.test(p), label: "jedna mała litera" },
  { test: (p) => /[A-Z]/.test(p), label: "jedna wielka litera" },
  { test: (p) => /\d/.test(p), label: "jedna cyfra" },
  {
    test: (p) => /[#?!@$%^&*-]/.test(p),
    label: "jeden znak specjalny (#?!@$%^&*-)",
  },
];

const PasswordRequirements = ({ password }) => (
  <>
    <Header>Wymagania dotyczące hasła:</Header>
    <List>
      {REQUIREMENTS.map(({ test, label }) => (
        <Item key={label} $crossedOut={test(password)}>
          {label}
        </Item>
      ))}
    </List>
  </>
);

export default PasswordRequirements;
