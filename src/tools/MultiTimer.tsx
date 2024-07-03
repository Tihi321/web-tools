// src/components/MultiTimer.tsx
import { createSignal, createEffect, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Box, TextField, Button, Typography, List, ListItem, LinearProgress } from "@suid/material";
import PlayArrowIcon from "@suid/icons-material/PlayArrow";
import StopIcon from "@suid/icons-material/Stop";
import RestartAltIcon from "@suid/icons-material/RestartAlt";
import DeleteIcon from "@suid/icons-material/Delete";

interface Timer {
  id: number;
  duration: number; // in milliseconds
  remainingTime: number; // in milliseconds
  isRunning: boolean;
}

export const MultiTimer = () => {
  const [timers, setTimers] = createStore<Timer[]>([]);
  const [minutes, setMinutes] = createSignal("");
  const [seconds, setSeconds] = createSignal("");

  const addTimer = () => {
    const mins = parseInt(minutes()) || 0;
    const secs = parseInt(seconds()) || 0;

    if (mins === 0 && secs === 0) return;

    const durationInMs = (mins * 60 + secs) * 1000;
    setTimers(
      produce((timers) => {
        timers.push({
          id: Date.now(),
          duration: durationInMs,
          remainingTime: durationInMs,
          isRunning: false,
        });
      })
    );
    setMinutes("");
    setSeconds("");
  };

  const removeTimer = (id: number) => {
    setTimers(timers.filter((timer) => timer.id !== id));
  };

  const startTimer = (id: number) => {
    setTimers(
      produce((timers) => {
        const timer = timers.find((t) => t.id === id);
        if (timer) timer.isRunning = true;
      })
    );
  };

  const stopTimer = (id: number) => {
    setTimers(
      produce((timers) => {
        const timer = timers.find((t) => t.id === id);
        if (timer) timer.isRunning = false;
      })
    );
  };

  const resetTimer = (id: number) => {
    setTimers(
      produce((timers) => {
        const timer = timers.find((t) => t.id === id);
        if (timer) {
          timer.remainingTime = timer.duration;
          timer.isRunning = false;
        }
      })
    );
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // Get only two digits of milliseconds
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(2, "0")}`;
  };

  const playSound = () => {
    const audio = new Audio("https://cdn.tihomir-selak.from.hr/assets/music/nice-alarm.mp3");
    audio.play();
  };

  createEffect(() => {
    const interval = setInterval(() => {
      setTimers(
        produce((timers) => {
          timers.forEach((timer) => {
            if (timer.isRunning && timer.remainingTime > 0) {
              timer.remainingTime = Math.max(0, timer.remainingTime - 10); // Decrease by 10ms
              if (timer.remainingTime === 0) {
                timer.isRunning = false;
                playSound();
              }
            }
          });
        })
      );
    }, 10); // Update every 10ms for smoother countdown

    return () => clearInterval(interval);
  });

  return (
    <Box sx={{ width: "100%", maxWidth: 600, margin: "auto" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          type="number"
          label="Minutes"
          value={minutes()}
          onChange={(e) => setMinutes(e.target.value)}
          sx={{ flexGrow: 1 }}
          inputProps={{ min: "0", step: "1" }}
        />
        <TextField
          type="number"
          label="Seconds"
          value={seconds()}
          onChange={(e) => setSeconds(e.target.value)}
          sx={{ flexGrow: 1 }}
          inputProps={{ min: "0", max: "59", step: "1" }}
        />
        <Button variant="contained" onClick={addTimer}>
          Add Timer
        </Button>
      </Box>
      <List>
        <For each={timers}>
          {(timer) => (
            <ListItem
              sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", mb: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">
                  {formatTime(timer.remainingTime)} / {formatTime(timer.duration)}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => (timer.isRunning ? stopTimer(timer.id) : startTimer(timer.id))}
                    startIcon={timer.isRunning ? <StopIcon /> : <PlayArrowIcon />}
                    sx={{ mr: 1 }}
                  >
                    {timer.isRunning ? "Stop" : "Start"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => resetTimer(timer.id)}
                    startIcon={<RestartAltIcon />}
                    sx={{ mr: 1 }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => removeTimer(timer.id)}
                    startIcon={<DeleteIcon />}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(timer.remainingTime / timer.duration) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </ListItem>
          )}
        </For>
      </List>
    </Box>
  );
};
