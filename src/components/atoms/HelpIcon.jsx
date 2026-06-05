import styled from 'styled-components'

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size === 's' ? '16px' : '20px'};
  height: ${({ $size }) => $size === 's' ? '16px' : '20px'};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ $size }) => $size === 's' ? '0.65rem' : '0.8rem'};
  font-weight: bold;
  cursor: default;

  &:hover > div {
    display: block;
  }
`

const Tooltip = styled.div`
  display: none;
  position: absolute;
  ${({ $position }) => $position === 'bottom'
    ? 'top: calc(100% + 8px);'
    : 'bottom: calc(100% + 8px);'}
  left: ${({ $align }) => $align === 'left' ? '0' : $align === 'right' ? 'auto' : '50%'};
  right: ${({ $align }) => $align === 'right' ? '0' : 'auto'};
  transform: ${({ $align }) => $align === 'left' || $align === 'right' ? 'none' : 'translateX(-50%)'};
  background-color: ${({ theme }) => theme.colors.lightTertiary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.8rem;
  font-weight: 400;
  text-align: left;
  padding: 10px 14px;
  border-radius: 8px;
  width: 230px;
  white-space: normal;
  line-height: 1.5;
  z-index: 100;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    ${({ $position }) => $position === 'bottom'
      ? 'bottom: 100%; border-bottom-color: inherit;'
      : 'top: 100%; border-top-color: inherit;'}
    left: ${({ $align }) => $align === 'left' ? '6px' : $align === 'right' ? 'auto' : '50%'};
    right: ${({ $align }) => $align === 'right' ? '6px' : 'auto'};
    transform: ${({ $align }) => $align === 'left' || $align === 'right' ? 'none' : 'translateX(-50%)'};
    border: 5px solid transparent;
    border-top-color: ${({ $position, theme }) => $position === 'bottom' ? 'transparent' : theme.colors.secondary};
    border-bottom-color: ${({ $position, theme }) => $position === 'bottom' ? theme.colors.secondary : 'transparent'};
  }
`

const HelpIcon = ({ tooltip, size, tooltipAlign, tooltipPosition, style }) => (
  <Wrapper $size={size} style={style}>
    ?
    <Tooltip $align={tooltipAlign} $position={tooltipPosition}>{tooltip}</Tooltip>
  </Wrapper>
)

export default HelpIcon
