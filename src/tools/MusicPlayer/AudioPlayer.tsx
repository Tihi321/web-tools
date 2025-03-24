import { onCleanup, createEffect, createSignal } from "solid-js";
import { isNil } from "lodash";
import { styled } from "solid-styled-components";
import { Box, Button, Switch, FormControlLabel } from "@suid/material";

// Add FileSystem API types
declare global {
  interface Window {
    showOpenFilePicker(options?: {
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }): Promise<FileSystemFileHandle[]>;
  }
}

const Container = styled(Box)`
  position: relative;
  width: 640px;
  height: 360px;
  overflow: hidden;
  box-shadow: 0 0 0 10px #1976d2;
  background-color: #ffffff;
  margin: 14px auto;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
`;

const Controls = styled("div")`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 8px;
`;

export interface AudioPlayerWrapper {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  loadAudioBy: (audioSrc: string) => Promise<void>;
  getDuration: () => number;
  getCurrentTime: () => number;
}

const isLocalPath = (path: string): boolean => {
  return path.startsWith("file://") || /^[A-Za-z]:\\/.test(path) || path.startsWith("/");
};

export const AudioPlayer = (props: {
  audioSrc: string;
  show: boolean;
  title: string;
  onReady: (player: AudioPlayerWrapper) => void;
  onStateChange: (state: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
}) => {
  let audioRef: HTMLAudioElement | undefined;
  const [duration, setDuration] = createSignal(0);
  const [isLocalMode, setIsLocalMode] = createSignal(false);

  const handleLocalFile = async (path: string): Promise<string> => {
    try {
      const handle = await window.showOpenFilePicker({
        types: [
          {
            description: "Audio Files",
            accept: {
              "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
            },
          },
        ],
      });

      const file = await handle[0].getFile();
      return URL.createObjectURL(file);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Unknown error occurred";
      if (props.onError) {
        props.onError("Failed to access local file: " + error);
      }
      throw new Error("Failed to access local file: " + error);
    }
  };

  const handleFileSelect = async () => {
    try {
      const objectUrl = await handleLocalFile("");
      if (audioRef) {
        audioRef.src = objectUrl;
        audioRef.load();
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Unknown error occurred";
      if (props.onError) {
        props.onError("Failed to load local file: " + error);
      }
    }
  };

  const audioPlayerWrapper: AudioPlayerWrapper = {
    play: async () => {
      if (audioRef) {
        try {
          await audioRef.play();
          props.onStateChange(1); // Playing state
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : "Unknown error occurred";
          if (props.onError) {
            props.onError("Failed to play audio: " + error);
          }
        }
      }
    },
    pause: async () => {
      if (audioRef) {
        audioRef.pause();
        props.onStateChange(2); // Paused state
      }
    },
    stop: async () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
        props.onStateChange(0); // Stopped state
      }
    },
    setVolume: (volume: number) => {
      if (audioRef) {
        audioRef.volume = volume;
      }
    },
    seekTo: (time: number) => {
      if (audioRef) {
        audioRef.currentTime = time;
      }
    },
    loadAudioBy: async (audioSrc: string) => {
      if (audioRef) {
        try {
          if (isLocalPath(audioSrc)) {
            const objectUrl = await handleLocalFile(audioSrc);
            audioRef.src = objectUrl;
          } else {
            audioRef.src = audioSrc;
          }
          audioRef.load();
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : "Unknown error occurred";
          if (props.onError) {
            props.onError("Failed to load audio: " + error);
          }
        }
      }
    },
    getDuration: () => duration(),
    getCurrentTime: () => (audioRef ? audioRef.currentTime : 0),
  };

  const handleTimeUpdate = () => {
    if (audioRef && !isNil(audioRef.currentTime) && !isNil(duration())) {
      props.onTimeUpdate(audioRef.currentTime, duration());
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef) {
      setDuration(audioRef.duration);
    }
  };

  const handleEnded = () => {
    props.onStateChange(0); // Ended state
  };

  createEffect(() => {
    if (audioRef) {
      audioRef.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.addEventListener("ended", handleEnded);
      props.onReady(audioPlayerWrapper);
    }
  });

  onCleanup(() => {
    if (audioRef) {
      audioRef.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.removeEventListener("ended", handleEnded);
    }
  });

  return (
    <Container sx={{ display: props.show ? "flex" : "none", flexDirection: "column" }}>
      <div
        style={{ flex: 1, display: "flex", "align-items": "center", "justify-content": "center" }}
      >
        {props.title}
      </div>
      <Controls>
        <FormControlLabel
          control={
            <Switch checked={isLocalMode()} onChange={(_, checked) => setIsLocalMode(checked)} />
          }
          label="Local File"
        />
        {isLocalMode() && (
          <Button variant="contained" color="primary" onClick={handleFileSelect}>
            Browse Files
          </Button>
        )}
      </Controls>
      <audio ref={audioRef} style={{ display: "none" }} />
    </Container>
  );
};
