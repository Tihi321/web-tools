import { Box } from "@suid/material";
import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { styled } from "solid-styled-components";
import YouTubePlayer from "youtube-player";
import { debounce } from "lodash";

const Container = styled(Box)`
  position: relative;
  width: 640px;
  height: 360px;
  overflow: hidden;
  box-shadow: 0 0 0 10px #1976d2;
  margin: 14px auto;
`;

export interface YoutubePlayerWrapper {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  loadVideoById: (videoId: string) => void;
  getDuration: () => Promise<number>;
  getCurrentTime: () => Promise<number>;
}

export const YoutubePlayer = (props: {
  videoId: string;
  show: boolean;
  onReady: (player: YoutubePlayerWrapper) => void;
  onStateChange: (state: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onError: (error: any) => void;
}) => {
  let playerRef: HTMLDivElement | undefined;
  let player: any;
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [lastKnownTime, setLastKnownTime] = createSignal(0);
  const [lastKnownDuration, setLastKnownDuration] = createSignal(0);

  const debouncedTimeUpdate = debounce(() => {
    if (player && isPlaying()) {
      player
        .getCurrentTime()
        .then((currentTime: number) => {
          setLastKnownTime(currentTime);
          props.onTimeUpdate(currentTime, lastKnownDuration());
        })
        .catch((error: any) => props.onError(error));
    }
  }, 1000);

  createEffect(() => {
    if (isPlaying()) {
      const intervalId = setInterval(debouncedTimeUpdate, 1000);
      onCleanup(() => clearInterval(intervalId));
    }
  });

  const youtubePlayerWrapper: YoutubePlayerWrapper = {
    play: async () => {
      try {
        await player.playVideo();
        setIsPlaying(true);
      } catch (error) {
        props.onError(error);
      }
    },
    pause: async () => {
      try {
        await player.pauseVideo();
        setIsPlaying(false);
      } catch (error) {
        props.onError(error);
      }
    },
    stop: async () => {
      try {
        await player.stopVideo();
        setIsPlaying(false);
      } catch (error) {
        props.onError(error);
      }
    },
    setVolume: (volume: number) => {
      player.setVolume(volume * 100).catch((error: any) => props.onError(error));
    },
    seekTo: (time: number) => {
      player.seekTo(time).catch((error: any) => props.onError(error));
    },
    loadVideoById: (videoId: string) => {
      player.loadVideoById(videoId).catch((error: any) => props.onError(error));
    },
    getDuration: async () => {
      try {
        const duration = await player.getDuration();
        setLastKnownDuration(duration);
        return duration;
      } catch (error) {
        props.onError(error);
        return lastKnownDuration();
      }
    },
    getCurrentTime: async () => {
      try {
        const currentTime = await player.getCurrentTime();
        setLastKnownTime(currentTime);
        return currentTime;
      } catch (error) {
        props.onError(error);
        return lastKnownTime();
      }
    },
  };

  onMount(() => {
    player = YouTubePlayer(playerRef as HTMLDivElement, {
      videoId: props.videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
      },
    });

    player.on("ready", () => props.onReady(youtubePlayerWrapper));
    player.on("stateChange", (event: { data: number }) => {
      props.onStateChange(event.data);
      setIsPlaying(event.data === 1);
    });
    player.on("error", (error: any) => props.onError(error));
  });

  return (
    <Container sx={{ display: props.show ? "block" : "none" }}>
      <div
        ref={playerRef}
        style={{ position: "absolute", top: "0", left: "0", right: "0", bottom: "0" }}
      ></div>
    </Container>
  );
};
