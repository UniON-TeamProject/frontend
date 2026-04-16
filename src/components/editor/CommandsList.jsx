import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import styled from "styled-components";

const StyledMenuWrapper = styled.div`
  position: relative;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    border-radius: 0 0 13px 13px;
    background: linear-gradient(
      transparent,
      ${({ theme }) => theme.colors.white}
    );
    pointer-events: none;
    opacity: ${({ $atBottom }) => ($atBottom ? 0 : 1)};
    transition: opacity 0.15s;
  }
`;

const StyledMenu = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 13px;
  padding: 3px;
  display: flex;
  min-width: 200px;
  flex-direction: column;
  overflow-y: auto;
  max-height: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  color: rgb(17, 24, 39);
`;

const StyledItem = styled.button`
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 6px 10px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  display: flex;
  align-items: center;
  color: rgb(17, 24, 39);
  background-color: ${({ $selected, theme }) =>
    $selected ? "#f0f0f0" : theme.colors.white};
  &:hover {
    background-color: #f0f0f0;
  }
  > svg {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

const StyledNoResult = styled.div`
  padding: 6px 10px;
  color: #999;
  font-size: 14px;
`;

const CommandsList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);
  const menuRef = useRef(null);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => setSelectedIndex(0), [items]);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (selectedIndex === 0) {
      menu.scrollTop = 0;
    } else if (selectedIndex === items.length - 1) {
      menu.scrollTop = menu.scrollHeight;
    } else {
      // peek one item ahead (down)
      itemRefs.current[selectedIndex + 1]?.scrollIntoView({ block: "nearest" });
      // peek one item behind (up)
      itemRefs.current[selectedIndex - 1]?.scrollIntoView({ block: "nearest" });
    }

    requestAnimationFrame(() => {
      setAtBottom(menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 5);
    });
  }, [selectedIndex, items.length]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return (
      <StyledMenuWrapper $atBottom>
        <StyledMenu>
          <StyledNoResult>Brak wyników</StyledNoResult>
        </StyledMenu>
      </StyledMenuWrapper>
    );
  }

  return (
    <StyledMenuWrapper $atBottom={atBottom}>
      <StyledMenu ref={menuRef}>
        {items.map((item, index) => (
          <StyledItem
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            $selected={index === selectedIndex}
            onClick={() => command(item)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {item.icon}
            {item.title}
          </StyledItem>
        ))}
      </StyledMenu>
    </StyledMenuWrapper>
  );
});

export default CommandsList;
