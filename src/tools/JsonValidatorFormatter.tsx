// src/components/JsonValidatorFormatter.tsx
import { createSignal } from "solid-js";
import { Box, TextField, Button, Typography, Paper } from "@suid/material";

export const JsonValidatorFormatter = () => {
  const [inputJson, setInputJson] = createSignal("");
  const [outputJson, setOutputJson] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [error, setError] = createSignal("");

  const validateAndFormat = () => {
    try {
      // Parse JSON to validate it
      const parsedJson = JSON.parse(inputJson());

      // Format JSON with 2 spaces indentation
      const formattedJson = JSON.stringify(parsedJson, null, 2);

      setOutputJson(formattedJson);
      setMessage("");
      setError("");
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
      setOutputJson("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(outputJson())
      .then(() => {
        setMessage("Formatted JSON copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setError("Failed to copy to clipboard");
      });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        JSON Validator and Formatter
      </Typography>
      <TextField
        multiline
        fullWidth
        rows={10}
        value={inputJson()}
        onChange={(e) => setInputJson(e.target.value)}
        placeholder="Paste your JSON here..."
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={validateAndFormat}>
          Validate and Format
        </Button>
        <Button variant="outlined" onClick={() => setInputJson("")}>
          Clear Input
        </Button>
      </Box>
      {error() && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error()}
        </Typography>
      )}
      {outputJson() && (
        <Paper elevation={3} sx={{ p: 2, mb: 2, height: "250px", overflow: "auto" }}>
          <Typography component="pre" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {outputJson()}
          </Typography>
        </Paper>
      )}
      {outputJson() && (
        <Button variant="contained" onClick={copyToClipboard}>
          Copy Formatted JSON
        </Button>
      )}
      {message() && (
        <Typography color="green" sx={{ mt: 2 }}>
          {message()}
        </Typography>
      )}
    </Box>
  );
};
