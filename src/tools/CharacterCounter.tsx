import { createSignal, createEffect } from "solid-js";
import { Box, TextField, Typography, Paper } from "@suid/material";
import { styled } from "solid-styled-components";

const TextFieldStyled = styled(TextField)`
  .MuiInputBase-root {
    height: 500px;
    overflow-y: auto;
  }

  textarea {
    height: 100% !important;
    overflow-y: auto !important;
  }
`;

export const CharacterCounter = () => {
  const [text, setText] = createSignal("");
  const [charCount, setCharCount] = createSignal(0);
  const [wordCount, setWordCount] = createSignal(0);
  const [lineCount, setLineCount] = createSignal(0);

  createEffect(() => {
    const currentText = text();
    setCharCount(currentText.length);
    setWordCount(currentText.trim().split(/\s+/).filter(Boolean).length);
    setLineCount(currentText.split(/\r\n|\r|\n/).length);
  });

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">
          Characters: {charCount()} | Words: {wordCount()} | Lines: {lineCount()}
        </Typography>
      </Paper>
      <TextFieldStyled
        multiline
        fullWidth
        value={text()}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
      />
    </Box>
  );
};
