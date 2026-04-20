import { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import SubmitButton from "../atoms/SubmitButton";

const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 220;

const StyledPageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.pageBg};
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-family: "Inter", sans-serif; /*?????*/
`;

/*
const StyledTopbar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background-color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    padding: 0 24px;
    z-index: 10;
`
*/

const StyledLogo = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  padding-left: 80px;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 1px;
`;

const StyledSidebar = styled.div`
  position: fixed;
  top: 0px;
  left: 0;
  width: ${({ $expanded }) =>
    $expanded ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`};
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.lightPrimary};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 27px 16px;
  box-sizing: border-box;
  z-index: 10;
  transition: width 0.25s ease;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.03);
  @media (max-width: 600px) {
    display: none;
  }
`;
/*
/* Rząd: SvgSlot + NavLabel. Brak dynamicznych właściwości layoutu. 
const StyledSidebarIcon = styled.div`
    height: 48px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 10px;
    cursor: pointer;
    color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.text};
    background-color: ${({ $active, theme }) => $active ? theme.colors.secondary : 'transparent'};
    transition: background-color 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
    &:hover {
        background-color: ${({ $active, theme }) => $active ? theme.colors.secondary : 'rgba(255, 255, 255, 0.45)'};
    }
`
*/

const StyledSidebarIcon = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.veryDarkPrimary : theme.colors.takiSmiesznyZielony};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.darkPageBg : "transparent")};
  transition: background-color 0.15s ease, color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ $active, theme }) => ($active ? theme.colors.darkPageBg : theme.colors.primary)};
    color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
`;

/* Stały slot 48px — SVG zawsze wycentrowany.
   Sidebar collapsed: inner = 80 - 2*16 = 48px → slot wypełnia całość.
   Sidebar expanded: inner = 220 - 2*16 = 188px → slot + gap + label. */
const SvgSlot = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  > svg {
    width: 22px;
    height: 22px;
  }
`;

const NavLabel = styled.span`
  font-size: 0.95rem;
  /*font-weight: 500;*/
  white-space: nowrap;
  overflow: hidden;
  max-width: ${({ $expanded }) => ($expanded ? "160px" : "0")};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  transition: max-width 0.25s ease,
    opacity 0.15s ease ${({ $expanded }) => ($expanded ? "0.1s" : "0s")};
`;

const StyledSidebarCenter = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
`;

const StyledContent = styled.div`
  margin-left: ${({ $expanded }) =>
    $expanded ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`};
  transition: margin-left 0.25s ease;
  min-height: 100vh;
  @media (max-width: 600px) {
    margin-left: 0;
    padding-bottom: 64px;
  }
`;

const BottomBar = styled.nav`
  display: none;
  @media (max-width: 600px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: ${({ theme }) => theme.colors.lightPrimary};
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 10;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
`;

const BottomBarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  cursor: pointer;
  color: ${({ $active, theme }) => ($active ? theme.colors.veryDarkPrimary : theme.colors.takiSmiesznyZielony)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.darkPageBg : "transparent")};
  transition: background-color 0.15s, color 0.15s;
  > svg {
    width: 22px;
    height: 22px;
  }
  &:hover {
    background-color: ${({ $active, theme }) => ($active ? theme.colors.darkPageBg : theme.colors.primary)};
    color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
`;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <StyledPageWrapper>
      {/* <StyledTopbar>
                <StyledLogo>UniON</StyledLogo>
                <SubmitButton style={{ width: "fit-content", fontWeight: "600", marginLeft: "auto" }} color="dark" text="Wyloguj" path="/logout" />
            </StyledTopbar> */}
      <StyledSidebar $expanded={expanded}>
        <StyledSidebarIcon onClick={() => setExpanded((e) => !e)}>
          <SvgSlot>
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
              />
            </svg>
          </SvgSlot>
          <NavLabel $expanded={expanded}>Zwiń menu</NavLabel>
        </StyledSidebarIcon>

        <StyledSidebarCenter>
          <StyledSidebarIcon
            $active={isActive("/home")}
            onClick={() => navigate("/home")}
          >
            <SvgSlot>
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
              </svg>
            </SvgSlot>
            <NavLabel $expanded={expanded}>Strona główna</NavLabel>
          </StyledSidebarIcon>

          <StyledSidebarIcon
            $active={isActive("/notes") || isActive("/note/")}
            onClick={() => navigate("/notes")}
          >
            <SvgSlot>
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
              </svg>
            </SvgSlot>
            <NavLabel $expanded={expanded}>Notatki</NavLabel>
          </StyledSidebarIcon>

          <StyledSidebarIcon
            $active={isActive("/learning")}
            onClick={() => navigate("/learning")}
          >
            <SvgSlot>
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
                <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
              </svg>
            </SvgSlot>
            <NavLabel $expanded={expanded}>Tryby nauki</NavLabel>
          </StyledSidebarIcon>

          <StyledSidebarIcon
            $active={isActive("/calendar")}
            onClick={() => navigate("/calendar")}
          >
            <SvgSlot>
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
              </svg>
            </SvgSlot>
            <NavLabel $expanded={expanded}>Kalendarz</NavLabel>
          </StyledSidebarIcon>

          <StyledSidebarIcon>
            <SvgSlot>
              <svg fill="currentColor" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
              </svg>
            </SvgSlot>
            <NavLabel $expanded={expanded}>Społeczności</NavLabel>
          </StyledSidebarIcon>
        </StyledSidebarCenter>
        {/* 
        <StyledSidebarIcon>
          <SvgSlot>
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
            </svg>
          </SvgSlot>
          <NavLabel $expanded={expanded}>Ustawienia</NavLabel>
        </StyledSidebarIcon> */}

        <StyledSidebarIcon
          $active={isActive("/user")}
          onClick={() => navigate("/user")}
        >
          <SvgSlot>
            <svg fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
          </SvgSlot>
          <NavLabel $expanded={expanded}>Profil</NavLabel>
        </StyledSidebarIcon>
      </StyledSidebar>
      <StyledContent $expanded={expanded}>{children}</StyledContent>
      <BottomBar>
        <BottomBarItem
          $active={isActive("/home")}
          onClick={() => navigate("/home")}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
          </svg>
        </BottomBarItem>
        <BottomBarItem
          $active={isActive("/notes") || isActive("/note/")}
          onClick={() => navigate("/notes")}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
          </svg>
        </BottomBarItem>
        <BottomBarItem
          $active={isActive("/learning")}
          onClick={() => navigate("/learning")}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z" />
            <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z" />
          </svg>
        </BottomBarItem>
        <BottomBarItem
          $active={isActive("/calendar")}
          onClick={() => navigate("/calendar")}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
          </svg>
        </BottomBarItem>
        <BottomBarItem
          $active={isActive("/user")}
          onClick={() => navigate("/user")}
        >
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
        </BottomBarItem>
      </BottomBar>
    </StyledPageWrapper>
  );
};

export default Layout;
