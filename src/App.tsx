import { createSignal, Show, onMount } from "solid-js";
import replace from "lodash/replace";
import startCase from "lodash/startCase";
import { styled } from "solid-styled-components";
import { Stopwatch } from "./tools/Stopwatch";
import { JsonValidatorFormatter } from "./tools/JsonValidatorFormatter";
import { JsonStringifier } from "./tools/JsonStringifier";
import { MultiTimer } from "./tools/MultiTimer";
import { SpeakIt } from "./tools/SpeakIt";
import { MusicPlayer } from "./tools/MusicPlayer";
import { CharacterCounter } from "./tools/CharacterCounter";
import { VoiceNotes } from "./tools/VoiceNotes";
import { getURLParams } from "./utils/url";
import { Frame } from "./components/layout/Frame";
import { Embed } from "./components/embed/Embed";
import { Kanban } from "./tools/Kanban";
import { QuickNotes } from "./tools/QuickNotes"; // Add this import

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const tools: string[] = [
  "kanban",
  "quick-notes",
  "music-player",
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
    setSelectedTool(initialTool || "kanban");
    document.title = `Web Tools - ${startCase(replace(initialTool || "kanban", "-", " "))}`;
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
          {selectedTool() === "kanban" && <Kanban />}
          {selectedTool() === "quick-notes" && <QuickNotes />}
          {selectedTool() === "music-player" && <MusicPlayer />}
          {selectedTool() === "speak-it" && <SpeakIt />}
          {selectedTool() === "voice-notes" && <VoiceNotes />}
          {selectedTool() === "character-counter" && <CharacterCounter />}
          {selectedTool() === "code-playground" && (
            <Embed src="https://tihi321.github.io/web_playground" title="Code" />
          )}
          {selectedTool() === "stopwatch" && <Stopwatch />}
          {selectedTool() === "multi-timer" && <MultiTimer />}
          {selectedTool() === "json-validator" && <JsonValidatorFormatter />}
          {selectedTool() === "json-stringifier" && <JsonStringifier />}
        </Show>
      </Frame>
    </Container>
  );
};
