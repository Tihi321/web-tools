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
import { MultiTimer } from "./tools/MultiTimer";
import { SpeakIt } from "./tools/SpeakIt";
import { LLMApiPrompter } from "./tools/LLMApiPrompter";
import { CharacterCounter } from "./tools/CharacterCounter";
import { VoiceNotes } from "./tools/VoiceNotes";
import { getURLParams } from "./utils/url";
import { Frame } from "./components/layout/Frame";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const tools: string[] = [
  "stopwatch",
  "multi-timer",
  "speak-it",
  "quick-list",
  "quick-tabs",
  "json-validator",
  "json-stringifier",
  "llm-api-prompter",
  "character-counter",
  "voice-notes",
];

export const App = () => {
  const [selectedTool, setSelectedTool] = createSignal<string>();

  onMount(() => {
    const initialTool = getURLParams("tool");
    setSelectedTool(initialTool || "stopwatch");
    document.title = `Web Tools - ${startCase(replace(initialTool || "stopwatch", "-", " "))}`;
  });

  return (
    <Container>
      <Frame
        tools={tools}
        onToolChange={(toolName: string) => {
          history.pushState({}, "", `?tool=${toolName}`);
          document.title = `Web Tools - ${startCase(replace(toolName, "-", " "))}`;
          setSelectedTool(toolName);
        }}
      >
        <Box component="main" sx={{ p: 3 }}>
          <Show when={selectedTool()}>
            {selectedTool() === "stopwatch" && <Stopwatch />}
            {selectedTool() === "multi-timer" && <MultiTimer />}
            {selectedTool() === "speak-it" && <SpeakIt />}
            {selectedTool() === "quick-list" && <QuickList />}
            {selectedTool() === "quick-tabs" && <QuickTabs />}
            {selectedTool() === "json-validator" && <JsonValidatorFormatter />}
            {selectedTool() === "json-stringifier" && <JsonStringifier />}
            {selectedTool() === "llm-api-prompter" && <LLMApiPrompter />}
            {selectedTool() === "character-counter" && <CharacterCounter />}
            {selectedTool() === "voice-notes" && <VoiceNotes />}
          </Show>
        </Box>
      </Frame>
    </Container>
  );
};
