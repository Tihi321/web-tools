// src/components/JsonStringifier.tsx
import { createEffect, createSignal, onMount } from "solid-js";
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@suid/material";
import { getVoice, getVoices } from "../utils";
import { getStringValue, saveStringValue } from "../hooks/local";
import { styled } from "solid-styled-components";
import { isEmpty, map } from "lodash";
import { Refresh } from "../components/icons/Refresh";
import { Save } from "../components/icons/Save";
import { Play } from "../components/icons/Play";
import { Stop } from "../components/icons/Stop";

const MenuItemStyled = styled(MenuItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const MenuTitle = styled("div")`
  font-size: 14px;
  margin: 10px;
  flex: 1;
  word-break: break-all;

  @media (min-width: 700px) {
    font-size: 18px;
  }
`;

export const SpeakIt = () => {
  const [inputText, setInputText] = createSignal("");
  const [selectedVoice, setSelectedVoice] = createSignal("");
  const [speaking, setSpeaking] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  const [availableVoices, setAvailableVoices] = createSignal<SpeechSynthesisVoice[]>([]);
  let speaker: SpeechSynthesisUtterance | null = null;

  onMount(() => {
    speaker = new SpeechSynthesisUtterance();
    const voice = getStringValue("selectedVoice");
    setSelectedVoice(voice || "");
    setMounted(true);
  });

  createEffect(() => {
    if (mounted()) {
      const voices = getVoices();
      setAvailableVoices(voices);
    }
  });

  createEffect(() => {
    if (speaker) {
      speaker.onend = () => {
        setSpeaking(false);
      };
    }
  });

  const stopSpeaking = () => {
    if (!speaker) return;
    speechSynthesis.cancel();
  };

  const startSpeaking = () => {
    if (!speaker) return;
    const voice = getVoice(selectedVoice() || "", availableVoices());
    if (voice) {
      speaker.voice = voice;
      speaker.lang = voice.lang;
      speaker.text = inputText();
      speechSynthesis.speak(speaker);
      setSpeaking(true);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Speak It
      </Typography>
      <TextField
        multiline
        fullWidth
        rows={10}
        value={inputText()}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type something to speak :)"
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Voices</InputLabel>
          <Select
            value={selectedVoice()}
            onChange={(event) => {
              setSelectedVoice(event.target.value);
            }}
          >
            {map(availableVoices(), (values: SpeechSynthesisVoice) => (
              <MenuItemStyled value={values.name}>
                <MenuTitle>{values.name}</MenuTitle>
              </MenuItemStyled>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 2,
          flex: 1,
        }}
      >
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            const voices = getVoices();
            setAvailableVoices(voices);
          }}
        >
          <Refresh />
        </Button>
        <Button
          disabled={isEmpty(availableVoices())}
          variant="contained"
          color="primary"
          onClick={() => {
            saveStringValue("selectedVoice", selectedVoice());
          }}
        >
          <Save />
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            speaking() ? stopSpeaking() : startSpeaking();
          }}
        >
          {speaking() ? <Stop /> : <Play />}
        </Button>
      </Box>
    </Box>
  );
};
