import { styled } from "solid-styled-components";
import { createSignal, For, Component } from "solid-js";
import { Drawer, List, ListItemButton, ListItemText, IconButton } from "@suid/material";
import MenuIcon from "@suid/icons-material/Menu";
import CropFreeIcon from "@suid/icons-material/CropFree";
import replace from "lodash/replace";
import startCase from "lodash/startCase";
import { Footer } from "./Footer";

const MenuContainer = styled("nav")`
  background-color: ${(props) => props?.theme?.colors.lightBackground};
  color: ${(props) => props?.theme?.colors.darkText};
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  height: 48px;
  z-index: 1;
  padding: 0 16px;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const FocusContainer = styled("nav")`
  position: fixed;
  top: 4px;
  right: 4px;
  z-index: 1;
  opacity: 0.3;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const FooterContainer = styled("footer")`
  display: flex;
  position: fixed;
  bottom: 0;
  height: 38px;
  background-color: ${(props) => props?.theme?.colors.lightBackground};
  color: ${(props) => props?.theme?.colors.darkText};
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 0 16px;
`;

const Content = styled.div<{ focus: boolean }>`
  flex: 1;
  padding: 0;
  margin: 0;
  overflow: hidden;
  padding-top: ${(props) => (props.focus ? "0" : "48px")};
  padding-bottom: ${(props) => (props.focus ? "0" : "38px")};
  box-sizing: border-box;
  display: flex;
`;

interface FrameProps {
  onToolChange: (toolName: string) => void;
  tools: string[];
  children?: any;
}

export const Frame: Component<FrameProps> = (props) => {
  const [isDrawerOpen, setIsDrawerOpen] = createSignal<boolean>(false);
  const [focusMode, setFocusMode] = createSignal<boolean>(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen());

  const selectTool = (toolName: string) => {
    props.onToolChange(toolName);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {!focusMode() && (
        <MenuContainer>
          <Drawer anchor="left" open={isDrawerOpen()} onClose={toggleDrawer}>
            <List sx={{ width: "250px" }}>
              <For each={props.tools}>
                {(toolName, index) => (
                  <ListItemButton onClick={() => selectTool(toolName)}>
                    {index() + 1}. <ListItemText primary={startCase(replace(toolName, "-", " "))} />
                  </ListItemButton>
                )}
              </For>
            </List>
          </Drawer>
          <IconButton
            size="small"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ display: "flex", gap: "6px" }}
          >
            <MenuIcon /> Menu
          </IconButton>
        </MenuContainer>
      )}
      <FocusContainer>
        <IconButton
          size="small"
          color="inherit"
          aria-label="menu"
          onClick={() => setFocusMode(!focusMode())}
          sx={{ display: "flex", gap: "6px", marginLeft: "auto" }}
        >
          <CropFreeIcon />
        </IconButton>
      </FocusContainer>

      <Content focus={focusMode()}>{props.children}</Content>
      {!focusMode() && (
        <FooterContainer>
          <Footer />
        </FooterContainer>
      )}
    </>
  );
};
