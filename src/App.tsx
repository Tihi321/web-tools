import { createSignal, Show, For, onMount } from "solid-js";
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
import replace from "lodash/replace";
import startCase from "lodash/startCase";
import { styled } from "solid-styled-components";
import { Stopwatch } from "./tools/Stopwatch";
import { QuickList } from "./tools/QuickList";
import { QuickTabs } from "./tools/QuickTabs";
import { JsonValidatorFormatter } from "./tools/JsonValidatorFormatter";
import { JsonStringifier } from "./tools/JsonStringifier";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const tools: string[] = [
  "stopwatch",
  "quick-list",
  "quick-tabs",
  "json-validator",
  "json-stringifier",
];

export const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = createSignal<boolean>(false);
  const [selectedTool, setSelectedTool] = createSignal<string>("");

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen());

  const selectTool = (toolName: string) => {
    setSelectedTool(toolName);
    history.pushState({}, "", `?tool=${toolName}`);
    setIsDrawerOpen(false);
  };

  onMount(() => {
    const initialTool = location.search.replace("?tool=", "");
    if (tools.includes(initialTool)) {
      setSelectedTool(initialTool);
    }
  });

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
        <List sx={{ width: "250px" }}>
          <For each={tools}>
            {(toolName, index) => (
              <ListItemButton onClick={() => selectTool(toolName)}>
                {index() + 1}. <ListItemText primary={startCase(replace(toolName, "-", " "))} />
              </ListItemButton>
            )}
          </For>
        </List>
      </Drawer>

      <Box component="main" sx={{ p: 3 }}>
        <Show when={selectedTool()} fallback={<Typography>Select a tool from the menu</Typography>}>
          {selectedTool() === "stopwatch" && <Stopwatch />}
          {selectedTool() === "quick-list" && <QuickList />}
          {selectedTool() === "quick-tabs" && <QuickTabs />}
          {selectedTool() === "json-validator" && <JsonValidatorFormatter />}
          {selectedTool() === "json-stringifier" && <JsonStringifier />}
        </Show>
      </Box>
    </Container>
  );
};
