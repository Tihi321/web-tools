// src/components/JsonStringifier.tsx
import { createSignal } from "solid-js";
import { Box, TextField, Button, Typography, Paper, Select, MenuItem } from "@suid/material";
import type { SelectChangeEvent } from "@suid/material/Select";

export const JsonStringifier = () => {
  const [inputCode, setInputCode] = createSignal("");
  const [outputJson, setOutputJson] = createSignal("");
  const [error, setError] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [indentation, setIndentation] = createSignal<number | string>(0);

  const stringifyJson = () => {
    try {
      // Use Function constructor to evaluate the input code
      // This is safer than eval() but still requires caution with user input
      const objectToStringify = new Function(`return ${inputCode()}`)();

      // Stringify the object with the selected indentation
      const jsonString = JSON.stringify(objectToStringify, null, indentation() as number);

      setOutputJson(jsonString);
      setError("");
      setMessage("");
    } catch (e) {
      setError("Invalid input: " + (e as Error).message);
      setOutputJson("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(outputJson())
      .then(() => {
        setMessage("JSON string copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setError("Failed to copy to clipboard");
      });
  };

  const handleIndentationChange = (event: SelectChangeEvent<number | string>) => {
    setIndentation(event.target.value);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        JSON Stringifier
      </Typography>
      <TextField
        multiline
        fullWidth
        rows={10}
        value={inputCode()}
        onChange={(e) => setInputCode(e.target.value)}
        placeholder="Enter your JavaScript object or array here... (e.g., { key: 'value' })"
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button variant="contained" onClick={stringifyJson}>
          Stringify
        </Button>
        <Button variant="outlined" onClick={() => setInputCode("")}>
          Clear Input
        </Button>
        <Typography>Indentation:</Typography>
        <Select value={indentation()} onChange={handleIndentationChange} size="small">
          <MenuItem value={0}>None</MenuItem>
          <MenuItem value={2}>2 spaces</MenuItem>
          <MenuItem value={4}>4 spaces</MenuItem>
          <MenuItem value={"    "}>1 tab</MenuItem>
        </Select>
      </Box>
      {error() && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error()}
        </Typography>
      )}
      {outputJson() && (
        <Paper sx={{ p: 2, mb: 2, height: "250px", overflow: "auto" }}>
          <Typography component="pre" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {outputJson()}
          </Typography>
        </Paper>
      )}
      {outputJson() && (
        <Button variant="contained" onClick={copyToClipboard}>
          Copy JSON String
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
