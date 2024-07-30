import { createSignal, onCleanup, For, onMount } from "solid-js";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@suid/material";
import MicIcon from "@suid/icons-material/Mic";
import StopIcon from "@suid/icons-material/Stop";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import DeleteIcon from "@suid/icons-material/Delete";

const languages = [
  { name: "English (US)", code: "en-US" },
  { name: "English (UK)", code: "en-GB" },
  { name: "Croatian", code: "hr-HR" },
  { name: "Spanish", code: "es-ES" },
  { name: "French", code: "fr-FR" },
  { name: "German", code: "de-DE" },
  { name: "Italian", code: "it-IT" },
  { name: "Japanese", code: "ja-JP" },
  { name: "Korean", code: "ko-KR" },
  { name: "Chinese (Simplified)", code: "zh-CN" },
  { name: "Russian", code: "ru-RU" },
];

interface Recognition {
  id: string;
  text: string;
  language: string;
  timestamp: number;
}

export const VoiceNotes = () => {
  const [isRecording, setIsRecording] = createSignal(false);
  const [transcription, setTranscription] = createSignal("");
  const [selectedLanguage, setSelectedLanguage] = createSignal("en-US");
  const [savedRecognitions, setSavedRecognitions] = createSignal<Recognition[]>([]);
  const [selectedRecognitionId, setSelectedRecognitionId] = createSignal<string | null>(null);
  let mediaRecorder: MediaRecorder | null = null;
  let recognition: any | null = null;
  let finalTranscript = "";

  onMount(() => {
    const storedRecognitions = localStorage.getItem("voiceNotes");
    if (storedRecognitions) {
      setSavedRecognitions(JSON.parse(storedRecognitions));
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      const win: any = window;
      recognition = new (win.SpeechRecognition || win.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage();

      recognition.onresult = (event: any) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscription(finalTranscript + interimTranscript);
      };

      recognition.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);

    // Save the recognition to local storage
    const newRecognition: Recognition = {
      id: Date.now().toString(),
      text: transcription(),
      language: selectedLanguage(),
      timestamp: Date.now(),
    };
    const updatedRecognitions = [...savedRecognitions(), newRecognition];
    setSavedRecognitions(updatedRecognitions);
    localStorage.setItem("voiceNotes", JSON.stringify(updatedRecognitions));

    finalTranscript = "";
    setTranscription("");
    setSelectedRecognitionId(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription()).then(
      () => {
        console.log("Text copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const updateRecognition = () => {
    if (selectedRecognitionId()) {
      const updatedRecognitions = savedRecognitions().map((rec) =>
        rec.id === selectedRecognitionId() ? { ...rec, text: transcription() } : rec
      );
      setSavedRecognitions(updatedRecognitions);
      localStorage.setItem("voiceNotes", JSON.stringify(updatedRecognitions));
    }
  };

  const removeRecognition = (id: string) => {
    const updatedRecognitions = savedRecognitions().filter((rec) => rec.id !== id);
    setSavedRecognitions(updatedRecognitions);
    localStorage.setItem("voiceNotes", JSON.stringify(updatedRecognitions));
    if (selectedRecognitionId() === id) {
      setSelectedRecognitionId(null);
      setTranscription("");
    }
  };

  const selectRecognition = (recognition: Recognition) => {
    setSelectedRecognitionId(recognition.id);
    setTranscription(recognition.text);
    setSelectedLanguage(recognition.language);
  };

  onCleanup(() => {
    if (isRecording()) {
      stopRecording();
    }
  });

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 600, md: 800 },
        margin: "auto",
        px: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
        Voice Notes
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2,
          alignItems: "stretch",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={isRecording() ? <StopIcon /> : <MicIcon />}
          onClick={isRecording() ? stopRecording : startRecording}
          disabled={isRecording() && selectedLanguage() === ""}
          sx={{ py: { xs: 1.5, sm: 1 } }}
        >
          {isRecording() ? "Stop Recording" : "Start Recording"}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={copyToClipboard}
          sx={{ py: { xs: 1.5, sm: 1 } }}
        >
          Copy to Clipboard
        </Button>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            value={selectedLanguage()}
            label="Language"
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isRecording()}
          >
            <For each={languages}>
              {(language) => <MenuItem value={language.code}>{language.name}</MenuItem>}
            </For>
          </Select>
        </FormControl>
      </Box>
      <TextField
        multiline
        fullWidth
        rows={6}
        value={transcription()}
        onChange={(e) => setTranscription(e.target.value)}
        onBlur={updateRecognition}
        placeholder="Transcribed text will appear here..."
        sx={{ mb: 3 }}
      />
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
        Saved Recognitions
      </Typography>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        <For each={savedRecognitions()}>
          {(savedRecognition) => (
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removeRecognition(savedRecognition.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                py: 2,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <ListItemText
                primary={savedRecognition.text.substring(0, 50) + "..."}
                secondary={new Date(savedRecognition.timestamp).toLocaleString()}
                onClick={() => selectRecognition(savedRecognition)}
                sx={{
                  cursor: "pointer",
                  mb: { xs: 1, sm: 0 },
                  mr: { xs: 0, sm: 2 },
                  flex: 1,
                }}
              />
            </ListItem>
          )}
        </For>
      </List>
    </Box>
  );
};
