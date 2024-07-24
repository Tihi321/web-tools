import { createSignal, Show, onMount } from "solid-js";
import { Box } from "@suid/material";
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
import { CharacterCounter } from "./tools/CharacterCounter";
import { VoiceNotes } from "./tools/VoiceNotes";
import { getURLParams } from "./utils/url";
import { Frame } from "./components/layout/Frame";
import { Embed } from "./components/embed/Embed";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const tools: string[] = [
  "quick-tabs",
  "quick-list",
  "speak-it",
  "voice-notes",
  "character-counter",
  "code-playground",
  "stopwatch",
  "multi-timer",
  "json-validator",
  "json-stringifier",
];

export const App = () => {
  const [selectedTool, setSelectedTool] = createSignal<string>();

  onMount(() => {
    const initialTool = getURLParams("tool");
    setSelectedTool(initialTool || "quick-tabs");
    document.title = `Web Tools - ${startCase(replace(initialTool || "quick-tabs", "-", " "))}`;
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
        <Show when={selectedTool()}>
          {selectedTool() === "stopwatch" && <Stopwatch />}
          {selectedTool() === "code-playground" && (
            <Embed src="https://tihi321.github.io/web_playground" title="Code" />
          )}
          {selectedTool() === "multi-timer" && <MultiTimer />}
          {selectedTool() === "speak-it" && <SpeakIt />}
          {selectedTool() === "quick-list" && <QuickList />}
          {selectedTool() === "quick-tabs" && <QuickTabs />}
          {selectedTool() === "json-validator" && <JsonValidatorFormatter />}
          {selectedTool() === "json-stringifier" && <JsonStringifier />}
          {selectedTool() === "character-counter" && <CharacterCounter />}
          {selectedTool() === "voice-notes" && <VoiceNotes />}
        </Show>
      </Frame>
    </Container>
  );
};
