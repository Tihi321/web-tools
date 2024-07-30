// src/components/SpeakIt.tsx
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
import { getVoice, getVoices } from "../../utils";
import { getStringValue, saveStringValue } from "../../hooks/local";
import { styled } from "solid-styled-components";
import { isEmpty, map } from "lodash";
import { Refresh } from "../../components/icons/Refresh";
import { Save } from "../../components/icons/Save";
import { Play } from "../../components/icons/Play";
import { Stop } from "../../components/icons/Stop";
import { Pause } from "../../components/icons/Pause";
import { RangeInput } from "../../components/inputs/RangeInput";

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
  const [speakerSet, setSpeakerSet] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  const [availableVoices, setAvailableVoices] = createSignal<SpeechSynthesisVoice[]>([]);
  const [pitch, setPitch] = createSignal(1);
  const [rate, setRate] = createSignal(1);
  const [volume, setVolume] = createSignal(1);
  let speaker: SpeechSynthesisUtterance | null = null;

  onMount(() => {
    speaker = new SpeechSynthesisUtterance();
    const voice = getStringValue("web-tools/selectedVoice");
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
        setSpeakerSet(false);
      };
    }
  });

  const stopSpeaking = () => {
    if (!speaker) return;
    speechSynthesis.cancel();
    setSpeaking(false);
    setSpeakerSet(false);
  };

  const speakIt = () => {
    if (!speaker) return;
    const voice = getVoice(selectedVoice() || "", availableVoices());
    if (voice) {
      if (speakerSet()) {
        if (!speaking()) {
          speechSynthesis.resume();
          setSpeaking(true);
        } else {
          speechSynthesis.pause();
          setSpeaking(false);
        }
      } else {
        speaker.voice = voice;
        speaker.lang = voice.lang;
        speaker.text = inputText();
        speaker.pitch = pitch();
        speaker.rate = rate();
        speaker.volume = volume();
        speechSynthesis.speak(speaker);
        setSpeakerSet(true);
        setSpeaking(true);
      }
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
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Pitch: {pitch().toFixed(1)}</Typography>
        <RangeInput
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch()}
          onInput={(e) => setPitch(parseFloat(e.currentTarget.value))}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Rate: {rate().toFixed(1)}</Typography>
        <RangeInput
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate()}
          onInput={(e) => setRate(parseFloat(e.currentTarget.value))}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Volume: {volume().toFixed(1)}</Typography>
        <RangeInput
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume()}
          onInput={(e) => setVolume(parseFloat(e.currentTarget.value))}
        />
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
            saveStringValue("web-tools/selectedVoice", selectedVoice());
          }}
        >
          <Save />
        </Button>
        <Button variant="contained" onClick={speakIt}>
          {speaking() ? <Pause /> : <Play />}
        </Button>
        <Button variant="contained" onClick={stopSpeaking}>
          <Stop />
        </Button>
      </Box>
    </Box>
  );
};
