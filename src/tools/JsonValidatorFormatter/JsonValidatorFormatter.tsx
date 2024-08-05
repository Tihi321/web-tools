import { createSignal, createEffect } from "solid-js";
import { Box, TextField, Button, Typography, Paper, Switch } from "@suid/material";
import JsonTreeView from "./JsonTreeView";
import { isEmpty } from "lodash";
import { styled } from "solid-styled-components";

const LineNumberedPre = styled.pre`
  counter-reset: line;
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: 50px;
  position: relative;

  & > span {
    display: block;
    position: relative;
    padding-right: 10px;
  }

  & > span::before {
    counter-increment: line;
    content: counter(line);
    position: absolute;
    left: -50px;
    top: 0;
    width: 40px;
    text-align: center;
    color: #888;
    user-select: none;
  }

  & > span.error-line {
    background-color: #ffecec;
  }
`;

export const JsonValidatorFormatter = () => {
  const [inputJson, setInputJson] = createSignal("");
  const [outputJson, setOutputJson] = createSignal("");
  const [parsedJson, setParsedJson] = createSignal<any>(null);
  const [message, setMessage] = createSignal("");
  const [error, setError] = createSignal("");
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [showTreeView, setShowTreeView] = createSignal(true);
  const [errorLine, setErrorLine] = createSignal(-1);
  const [errorColumn, setErrorColumn] = createSignal(-1);

  const validateAndFormat = () => {
    try {
      const parsedJson = JSON.parse(inputJson());
      const formattedJson = JSON.stringify(parsedJson, null, 2);

      setOutputJson(formattedJson);
      setParsedJson(parsedJson);
      setMessage("JSON is valid and formatted.");
      setError("");
      setErrorLine(-1);
      setErrorColumn(-1);
      setShowTreeView(true);
    } catch (e) {
      const errorMessage = (e as Error).message;
      setError("Invalid JSON: " + errorMessage);
      setOutputJson(inputJson());
      setParsedJson(null);
      setShowTreeView(false);

      const match = errorMessage.match(/at position (\d+)/);
      if (match) {
        const errorPosition = parseInt(match[1], 10);
        const lines = inputJson().slice(0, errorPosition).split("\n");
        setErrorLine(lines.length);
        setErrorColumn(lines[lines.length - 1].length + 1);
      }
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded());
  };

  const toggleView = () => {
    setShowTreeView(!showTreeView());
  };

  createEffect(() => {
    if (errorLine() > 0 && errorColumn() > 0) {
      const outputElement = document.getElementById("output-json");
      if (outputElement) {
        const errorLineElement = outputElement.querySelector(`span:nth-child(${errorLine()})`);
        if (errorLineElement) {
          errorLineElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  });

  const renderLineNumberedJson = () => {
    return outputJson()
      .split("\n")
      .map((line, index) => (
        <span class={index + 1 === errorLine() ? "error-line" : ""}>{line}</span>
      ));
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
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button variant="contained" onClick={validateAndFormat}>
          Validate and Format
        </Button>
        <Button variant="outlined" onClick={() => setInputJson("")}>
          Clear Input
        </Button>
        {!isEmpty(parsedJson()) && (
          <>
            <Typography>Tree View</Typography>
            <Switch checked={showTreeView()} onChange={toggleView} />
          </>
        )}
      </Box>
      {!isEmpty(parsedJson()) && (
        <Paper elevation={3} sx={{ mb: 2, height: "400px", overflow: "auto" }}>
          {showTreeView() ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                }}
              >
                <Typography variant="h6">JSON Tree View</Typography>
                <Button variant="outlined" onClick={toggleExpanded}>
                  {isExpanded() ? "Collapse All" : "Expand All"}
                </Button>
              </Box>
              <JsonTreeView data={parsedJson()} expanded={isExpanded()} />
            </>
          ) : (
            <LineNumberedPre id="output-json">{renderLineNumberedJson()}</LineNumberedPre>
          )}
        </Paper>
      )}
      {error() && (
        <Paper elevation={3} sx={{ p: 2, mb: 2, maxHeight: "400px", overflow: "auto" }}>
          <LineNumberedPre id="output-json">{renderLineNumberedJson()}</LineNumberedPre>
        </Paper>
      )}
      {error() && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error()}
          {errorLine() > 0 && errorColumn() > 0 && (
            <span>
              (Line: {errorLine()}, Column: {errorColumn()})
            </span>
          )}
        </Typography>
      )}
      {outputJson() && (
        <Button variant="contained" onClick={copyToClipboard}>
          Copy JSON
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
