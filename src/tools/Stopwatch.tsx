import { createSignal, createEffect, onCleanup } from "solid-js";
import { Box, Typography, Button } from "@suid/material";

export const Stopwatch = () => {
  const [time, setTime] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);

  createEffect(() => {
    let interval: any;
    if (isRunning()) {
      interval = setInterval(() => {
        setTime((t) => t + 10);
      }, 10);
    }
    onCleanup(() => clearInterval(interval));
  });

  const startStop = () => {
    setIsRunning(!isRunning());
  };

  const reset = () => {
    setTime(0);
    setIsRunning(false);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        margin: "auto",
      }}
    >
      <Typography variant="h2" component="div">
        {formatTime(time())}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color={isRunning() ? "error" : "success"}
          onClick={startStop}
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            fontSize: "1.2rem",
          }}
        >
          {isRunning() ? "Stop" : "Start"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={reset}
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            fontSize: "1.2rem",
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};
