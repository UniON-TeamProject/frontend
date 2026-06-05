import styled from "styled-components";

const StyledLogo = styled.img`
  width: ${({ size }) => size === "mini" ? "auto" : size === "small" ? "150px" : "200px"};
  height: ${({ size }) => size === "mini" ? "45px" : size === "small" ? "150px" : "200px"};
  margin: ${({ size }) => size === "mini" ? "0" : "0 auto"};
  object-fit: contain;

  @media (max-width: 768px) {
    height: ${({ size }) => size === "mini" ? "36px" : undefined};
  }
`;

const Logo = ({ size }) => {
  return <StyledLogo size={size} src="/icons/onionResized.png" />;
};

export default Logo;
