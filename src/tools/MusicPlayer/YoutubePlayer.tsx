import { Box } from "@suid/material";
import { createSignal, onMount, onCleanup } from "solid-js";
import { styled } from "solid-styled-components";

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

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
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
  let intervalId: number | undefined;

  const loadYouTubeAPI = () => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
  };

  const initPlayer = () => {
    player = new window.YT.Player(playerRef, {
      height: "360",
      width: "640",
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
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  };

  const onPlayerReady = () => {
    props.onReady(youtubePlayerWrapper);
  };

  const onPlayerStateChange = (event: { data: number }) => {
    props.onStateChange(event.data);
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimeUpdateInterval();
    } else {
      setIsPlaying(false);
      stopTimeUpdateInterval();
    }
  };

  const onPlayerError = (event: { data: any }) => {
    props.onError(event.data);
  };

  const startTimeUpdateInterval = () => {
    intervalId = window.setInterval(() => {
      if (player && isPlaying()) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        props.onTimeUpdate(currentTime, duration);
      }
    }, 1000);
  };

  const stopTimeUpdateInterval = () => {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  const youtubePlayerWrapper: YoutubePlayerWrapper = {
    play: async () => {
      await player.playVideo();
    },
    pause: async () => {
      await player.pauseVideo();
    },
    stop: async () => {
      await player.stopVideo();
    },
    setVolume: (volume: number) => {
      player.setVolume(volume * 100);
    },
    seekTo: (time: number) => {
      player.seekTo(time);
    },
    loadVideoById: (videoId: string) => {
      player.loadVideoById(videoId);
    },
    getDuration: () => Promise.resolve(player.getDuration()),
    getCurrentTime: () => Promise.resolve(player.getCurrentTime()),
  };

  onMount(() => {
    loadYouTubeAPI();
    window.onYouTubeIframeAPIReady = initPlayer;
  });

  onCleanup(() => {
    stopTimeUpdateInterval();
    if (player) {
      player.destroy();
    }
  });

  return (
    <Container sx={{ display: props.show ? "block" : "none" }}>
      <div ref={playerRef}></div>
    </Container>
  );
};
