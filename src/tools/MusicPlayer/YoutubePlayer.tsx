import { createSignal, onMount, onCleanup } from "solid-js";
import YouTubePlayer from "youtube-player";

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
  onReady: (player: YoutubePlayerWrapper) => void;
  onStateChange: (state: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}) => {
  let playerRef: HTMLDivElement | undefined;
  let player: any;
  const [isPlaying, setIsPlaying] = createSignal(false);
  let intervalId: number | undefined;

  const startTimeUpdateInterval = () => {
    intervalId = window.setInterval(async () => {
      if (player && isPlaying()) {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
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
      setIsPlaying(true);
      startTimeUpdateInterval();
    },
    pause: async () => {
      await player.pauseVideo();
      setIsPlaying(false);
      stopTimeUpdateInterval();
    },
    stop: async () => {
      await player.stopVideo();
      setIsPlaying(false);
      stopTimeUpdateInterval();
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
    getDuration: () => player.getDuration(),
    getCurrentTime: () => player.getCurrentTime(),
  };

  onMount(() => {
    player = YouTubePlayer(playerRef as HTMLDivElement, {
      videoId: props.videoId,
      playerVars: {
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        rel: 0,
        modestbranding: 1,
      },
    });

    player.on("ready", () => props.onReady(youtubePlayerWrapper));
    player.on("stateChange", (event: { data: number }) => {
      props.onStateChange(event.data);
      if (event.data === 1) {
        // Playing
        setIsPlaying(true);
        startTimeUpdateInterval();
      } else {
        setIsPlaying(false);
        stopTimeUpdateInterval();
      }
    });
  });

  onCleanup(() => {
    stopTimeUpdateInterval();
  });

  return <div ref={playerRef} style="display: none;"></div>;
};
