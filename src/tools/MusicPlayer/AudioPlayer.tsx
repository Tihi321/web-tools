import { onCleanup, createEffect, createSignal } from "solid-js";
import { isNil } from "lodash";
import { styled } from "solid-styled-components";
import { Box } from "@suid/material";

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

export interface AudioPlayerWrapper {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  loadAudioById: (audioSrc: string) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
}

export const AudioPlayer = (props: {
  audioSrc: string;
  show: boolean;
  title: string;
  onReady: (player: AudioPlayerWrapper) => void;
  onStateChange: (state: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}) => {
  let audioRef: HTMLAudioElement | undefined;
  const [duration, setDuration] = createSignal(0);

  const audioPlayerWrapper: AudioPlayerWrapper = {
    play: async () => {
      if (audioRef) {
        await audioRef.play();
        props.onStateChange(1); // Playing state
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
    loadAudioById: (audioSrc: string) => {
      if (audioRef) {
        audioRef.src = audioSrc;
        audioRef.load();
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
      props.onReady(audioPlayerWrapper);
    }
  };

  const handleEnded = () => {
    props.onStateChange(0); // Ended state
  };

  createEffect(() => {
    if (audioRef) {
      audioRef.src = props.audioSrc;
      audioRef.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.addEventListener("ended", handleEnded);
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
    <Container sx={{ display: props.show ? "flex" : "none" }}>
      {props.title}
      <audio ref={audioRef} style={{ display: "none" }} />
    </Container>
  );
};
