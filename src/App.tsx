import { createSignal, Show, For } from "solid-js";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from "@suid/material";
import MenuIcon from "@suid/icons-material/Menu";
import { styled } from "solid-styled-components";
import { Stopwatch } from "./tools/Stopwatch";
import { QuickList } from "./tools/QuickList";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const tools: string[] = ["Stopwatch", "Quick List"];

export const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = createSignal<boolean>(false);
  const [selectedTool, setSelectedTool] = createSignal<string>("");

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen());

  const selectTool = (toolName: string) => {
    setSelectedTool(toolName);
    setIsDrawerOpen(false);
  };

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tools
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={isDrawerOpen()} onClose={toggleDrawer}>
        <List>
          <For each={tools}>
            {(toolName) => (
              <ListItemButton onClick={() => selectTool(toolName)}>
                <ListItemText primary={toolName} />
              </ListItemButton>
            )}
          </For>
        </List>
      </Drawer>

      <Box component="main" sx={{ p: 3 }}>
        <Show when={selectedTool()} fallback={<Typography>Select a tool from the menu</Typography>}>
          {selectedTool() === "Stopwatch" && <Stopwatch />}
          {selectedTool() === "Quick List" && <QuickList />}
        </Show>
      </Box>
    </Container>
  );
};
