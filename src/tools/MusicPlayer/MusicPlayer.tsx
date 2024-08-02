import { createSignal, For, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@suid/material";
import PlayArrowIcon from "@suid/icons-material/PlayArrow";
import PauseIcon from "@suid/icons-material/Pause";
import SkipNextIcon from "@suid/icons-material/SkipNext";
import SkipPreviousIcon from "@suid/icons-material/SkipPrevious";
import VolumeUpIcon from "@suid/icons-material/VolumeUp";
import VolumeOffIcon from "@suid/icons-material/VolumeOff";
import AddIcon from "@suid/icons-material/Add";
import DeleteIcon from "@suid/icons-material/Delete";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import DragIndicatorIcon from "@suid/icons-material/DragIndicator";
import { styled } from "solid-styled-components";
import { RangeInput } from "../../components/inputs/RangeInput";
import { Snackbar } from "../../components/toasts/Snackbar";
import { filter, map, get, find, findIndex, isEmpty } from "lodash";
import { YoutubePlayer, YoutubePlayerWrapper } from "./YoutubePlayer";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100vw;
  padding: 20px;
  background-color: #f5f5f5;
`;

const PlayerContainer = styled(Box)`
  display: grid;
  grid-template-columns: 300px 1fr;
  flex: 1;
  gap: 20px;
`;

const Player = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const PlayerControls = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const PlaylistContainer = styled(Box)`
  display: flex;
  gap: 20px;
`;

const PlaylistList = styled(Box)`
  width: 300px;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ListItemContainer = styled(Box)<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? "#f5f5f5" : "transparent")};
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SongList = styled(Box)`
  flex-grow: 1;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SongItem = styled(ListItem)<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? "#f5f5f5" : "transparent")};
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DraggableSongItem = styled(SongItem)`
  display: flex;
  align-items: center;
`;

interface Song {
  id: string;
  name: string;
  src: string;
  muted: boolean;
  type: "audio" | "youtube";
}

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

type DialogView = "playlist" | "song" | "deletePlaylist" | "deleteSong" | null;

export const MusicPlayer = () => {
  const [store, setStore] = createStore({
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    autoplay: false,
  });
  const [playlists, setPlaylists] = createSignal<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = createSignal<Playlist | null>(null);
  const [currentSong, setCurrentSong] = createSignal<Song | null>(null);
  const [dialogView, setDialogView] = createSignal<DialogView>(null);
  const [newPlaylistName, setNewPlaylistName] = createSignal("");
  const [newSongName, setNewSongName] = createSignal("");
  const [newSongSrc, setNewSongSrc] = createSignal("");
  const [playlistToDelete, setPlaylistToDelete] = createSignal<Playlist | null>(null);
  const [songToDelete, setSongToDelete] = createSignal<Song | null>(null);
  const [snackbarOpen, setSnackbarOpen] = createSignal(false);
  const [snackbarMessage, setSnackbarMessage] = createSignal("");
  const [draggedSongId, setDraggedSongId] = createSignal<string | null>(null);
  const [youtubePlayer, setYoutubePlayer] = createSignal<YoutubePlayerWrapper | null>(null);
  let audioRef: HTMLAudioElement;

  const savePlaylists = (playlists: Playlist[]) => {
    if (currentPlaylist()) {
      const updatedPlaylist = find(playlists, (playlist) => playlist.id === currentPlaylist()!.id);
      if (!updatedPlaylist) {
        setCurrentPlaylist(null);
        setCurrentSong(null);
        setStore("isPlaying", false);
      } else {
        setCurrentPlaylist(updatedPlaylist);
        if (currentSong()) {
          if (!find(updatedPlaylist.songs, (song) => song.id === currentSong()!.id)) {
            setCurrentSong(null);
            setStore("isPlaying", false);
          }
        }
      }
    }

    setPlaylists(playlists);
    localStorage.setItem("web-tools/musicplayerplaylists", JSON.stringify(playlists));
  };

  onMount(() => {
    const storedPlaylists = localStorage.getItem("web-tools/musicplayerplaylists");
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists));
    }
  });

  const loadPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentSong(playlist.songs[0] || null);
  };

  const playSong = (song: Song) => {
    if (!song.muted) {
      if (currentSong()?.type === "youtube" && youtubePlayer()) {
        youtubePlayer()!.stop();
      }
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }

      setCurrentSong(song);
      setStore("isPlaying", true);
      setStore("currentTime", 0);

      if (song.type === "audio") {
        if (audioRef) {
          audioRef.src = song.src;
          audioRef.play().catch((error) => {
            console.error("Error playing audio:", error);
            setStore("isPlaying", false);
          });
        }
      } else if (song.type === "youtube") {
        const player = youtubePlayer();
        if (player) {
          const videoId = getYoutubeId(song.src);
          if (videoId) {
            player.loadVideoById(videoId);
          } else {
            console.error("Invalid YouTube URL");
            setStore("isPlaying", false);
          }
        }
      }
    }
  };

  const togglePlay = () => {
    if (currentSong()?.type === "audio") {
      if (audioRef) {
        if (store.isPlaying) {
          audioRef.pause();
        } else {
          audioRef.play();
        }
      }
    } else if (currentSong()?.type === "youtube") {
      const player = youtubePlayer();
      if (player) {
        if (store.isPlaying) {
          player.pause();
        } else {
          player.stop();
        }
      }
    }
    setStore("isPlaying", !store.isPlaying);
  };

  const nextSong = () => {
    if (currentPlaylist()! && currentSong()) {
      let currentIndex = currentPlaylist()!.songs.findIndex(
        (song) => song.id === currentSong()?.id
      );
      let nextIndex = (currentIndex + 1) % currentPlaylist()!.songs.length;

      // Skip muted songs
      while (currentPlaylist()!.songs[nextIndex].muted) {
        nextIndex = (nextIndex + 1) % currentPlaylist()!.songs.length;
      }

      playSong(currentPlaylist()!.songs[nextIndex]);
    }
  };

  const previousSong = () => {
    if (currentPlaylist()! && currentSong()) {
      let currentIndex = currentPlaylist()!.songs.findIndex(
        (song) => song.id === currentSong()?.id
      );
      let previousIndex =
        (currentIndex - 1 + currentPlaylist()!.songs.length) % currentPlaylist()!.songs.length;

      // Skip muted songs
      while (currentPlaylist()!.songs[previousIndex].muted) {
        previousIndex =
          (previousIndex - 1 + currentPlaylist()!.songs.length) % currentPlaylist()!.songs.length;
      }

      playSong(currentPlaylist()!.songs[previousIndex]);
    }
  };

  const toggleDisable = (songId: string) => {
    const newPlaylists = map(playlists(), (playlist) => ({
      ...playlist,
      songs: map(playlist.songs, (song) =>
        song.id === songId ? { ...song, muted: !song.muted } : song
      ),
    }));
    savePlaylists(newPlaylists);
  };

  const handleVolumeChange = (newVolume: string) => {
    const newVolumeNumber = Number(newVolume);
    setStore("volume", newVolumeNumber);
    if (audioRef) {
      audioRef.volume = newVolumeNumber;
    }
    if (youtubePlayer()) {
      youtubePlayer()!.setVolume(newVolumeNumber * 100);
    }
  };

  const toggleAutoplay = () => {
    setStore("autoplay", !store.autoplay);
  };

  const handleSongEnd = () => {
    if (store.autoplay) {
      nextSong();
    } else {
      setStore("isPlaying", false);
    }
  };

  const addPlaylist = () => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName(),
      songs: [],
    };
    const newPlaylists = [...playlists(), newPlaylist];
    savePlaylists(newPlaylists);
    setNewPlaylistName("");
    setDialogView(null);
  };

  const addSong = () => {
    if (currentPlaylist()) {
      const youtubeId = getYoutubeId(newSongSrc());
      const newSong: Song = {
        id: Date.now().toString(),
        name: newSongName(),
        src: newSongSrc(),
        muted: false,
        type: youtubeId ? "youtube" : "audio",
      };

      const newPlaylists = map(playlists(), (playlist) => ({
        ...playlist,
        songs:
          playlist.id === currentPlaylist()!.id ? [...playlist.songs, newSong] : playlist.songs,
      }));
      savePlaylists(newPlaylists);
      setNewSongName("");
      setNewSongSrc("");
      setDialogView(null);
    }
  };

  const removePlaylist = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setDialogView("deletePlaylist");
  };

  const confirmRemovePlaylist = () => {
    const playlistId = get(playlistToDelete(), "id");
    if (playlistId) {
      const newPlaylists = filter(playlists(), (p) => p.id !== playlistId);
      savePlaylists(newPlaylists);
    }
    setDialogView(null);
    setPlaylistToDelete(null);
  };

  const removeSong = (song: Song) => {
    setSongToDelete(song);
    setDialogView("deleteSong");
  };

  const confirmRemoveSong = () => {
    const song = songToDelete();
    if (song && currentPlaylist()) {
      const newPlaylists = map(playlists(), (playlist) => ({
        ...playlist,
        songs:
          playlist.id === currentPlaylist()!.id
            ? filter(playlist.songs, (s) => s.id !== song.id)
            : playlist.songs,
      }));
      savePlaylists(newPlaylists);
    }
    setDialogView(null);
    setSongToDelete(null);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const copySongUrl = (songSrc: string) => {
    navigator.clipboard.writeText(songSrc).then(
      () => {
        setSnackbarMessage("Song URL copied to clipboard!");
        setSnackbarOpen(true);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setSnackbarMessage("Failed to copy URL");
        setSnackbarOpen(true);
      }
    );
  };

  const handleDragStart = (e: DragEvent, songId: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", songId);
      setDraggedSongId(songId);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent, targetSongId: string) => {
    e.preventDefault();
    const sourceSongId = draggedSongId();
    if (sourceSongId && currentPlaylist()) {
      const newSongs = [...get(currentPlaylist(), "songs", [])];
      const sourceIndex = findIndex(newSongs, (s) => s.id === sourceSongId);
      const targetIndex = findIndex(newSongs, (s) => s.id === targetSongId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = newSongs.splice(sourceIndex, 1);
        newSongs.splice(targetIndex, 0, removed);

        const newPlaylists = map(playlists(), (playlist) => ({
          ...playlist,
          songs: playlist.id === currentPlaylist()!.id ? newSongs : playlist.songs,
        }));
        savePlaylists(newPlaylists);
      }
    }
    setDraggedSongId(null);
  };

  const handleYoutubeStateChange = (state: number) => {
    if (state === 0) {
      handleSongEnd();
    } else if (state === 1) {
      setStore("isPlaying", true);
    } else if (state === 2) {
      setStore("isPlaying", false);
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleTimeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newTime = Number(target.value);
    setStore("currentTime", newTime);
    if (currentSong()?.type === "audio" && audioRef) {
      audioRef.currentTime = newTime;
      if (store.isPlaying) {
        audioRef.play();
      }
    } else if (currentSong()?.type === "youtube" && youtubePlayer()) {
      youtubePlayer()!.seekTo(newTime);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef) {
      setStore("currentTime", audioRef.currentTime);
      setStore("duration", audioRef.duration);
    }
  };

  return (
    <Container>
      <audio
        ref={audioRef!}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        style={{ display: "none" }}
      />
      <YoutubePlayer
        videoId=""
        onReady={(player) => setYoutubePlayer(player)}
        onStateChange={handleYoutubeStateChange}
        onTimeUpdate={(currentTime, duration) => {
          if (currentSong()?.type === "youtube") {
            setStore("currentTime", currentTime);
            setStore("duration", duration);
          }
        }}
      />
      <PlayerContainer>
        <PlaylistContainer>
          <PlaylistList>
            <Typography variant="h6">Playlists</Typography>
            <List>
              <For each={playlists()}>
                {(playlist) => (
                  <ListItemContainer
                    selected={playlist.id === get(currentPlaylist(), "id")}
                    onClick={() => loadPlaylist(playlist)}
                  >
                    <ListItem>
                      <ListItemText primary={playlist.name} />
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => removePlaylist(playlist)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  </ListItemContainer>
                )}
              </For>
            </List>
            <Button startIcon={<AddIcon />} onClick={() => setDialogView("playlist")}>
              Add Playlist
            </Button>
          </PlaylistList>
        </PlaylistContainer>
        <Player>
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
            Now Playing: {currentSong() ? currentSong()!.name : "No song selected"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <IconButton
                onClick={() =>
                  handleVolumeChange({ target: { value: store.volume === 0 ? "1" : "0" } } as any)
                }
              >
                {store.volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <RangeInput
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={store.volume}
                onInput={(event) => handleVolumeChange((event.target as HTMLInputElement).value)}
                style={{ width: "200px", "margin-left": "16px" }}
              />
            </Box>
            <PlayerControls>
              <IconButton onClick={previousSong} disabled={!currentSong()}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton onClick={togglePlay} disabled={!currentSong()}>
                {store.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={nextSong} disabled={!currentSong()}>
                <SkipNextIcon />
              </IconButton>
            </PlayerControls>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography>Autoplay</Typography>
              <Switch checked={store.autoplay} onChange={toggleAutoplay} />
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              {formatTime(store.currentTime)} / {formatTime(store.duration)}
            </Typography>
            <RangeInput
              type="range"
              min="0"
              max={store.duration || 100}
              step="0.01"
              value={store.currentTime}
              onInput={handleTimeChange}
              style={{ width: "100%" }}
            />
          </Box>
          <SongList>
            <Typography variant="h6">
              {get(currentPlaylist(), "name", "No playlist selected")}
            </Typography>
            <List>
              <For each={get(currentPlaylist(), "songs", [])}>
                {(song) => (
                  <DraggableSongItem
                    selected={song.id === get(currentSong(), "id")}
                    draggable
                    onDragStart={(e) => handleDragStart(e, song.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, song.id)}
                    secondaryAction={
                      <>
                        <IconButton
                          edge="end"
                          aria-label="copy"
                          onClick={() => copySongUrl(song.src)}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="mute"
                          onClick={() => toggleDisable(song.id)}
                        >
                          {song.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => removeSong(song)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <IconButton sx={{ cursor: "move" }}>
                      <DragIndicatorIcon />
                    </IconButton>
                    <ListItemText
                      primary={song.name}
                      secondary={song.src}
                      onClick={() => playSong(song)}
                      style={{ cursor: "pointer", "word-break": "break-all" }}
                    />
                  </DraggableSongItem>
                )}
              </For>
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setDialogView("song")}
              disabled={isEmpty(currentPlaylist())}
            >
              Add Song
            </Button>
          </SongList>
        </Player>
      </PlayerContainer>

      <Dialog open={dialogView() === "playlist"} onClose={() => setDialogView(null)}>
        <DialogTitle>Add New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            fullWidth
            value={newPlaylistName()}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogView(null)}>Cancel</Button>
          <Button onClick={addPlaylist}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogView() === "song"} onClose={() => setDialogView(null)}>
        <DialogTitle>Add New Song</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Song Name"
            fullWidth
            value={newSongName()}
            onChange={(e) => setNewSongName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Song URL"
            fullWidth
            value={newSongSrc()}
            onChange={(e) => setNewSongSrc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogView(null)}>Cancel</Button>
          <Button onClick={addSong}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogView() === "deletePlaylist"} onClose={() => setDialogView(null)}>
        <DialogTitle>Delete Playlist</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the playlist "{playlistToDelete()?.name}"? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogView(null)}>Cancel</Button>
          <Button onClick={confirmRemovePlaylist} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogView() === "deleteSong"} onClose={() => setDialogView(null)}>
        <DialogTitle>Delete Song</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the song "{songToDelete()?.name}"? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogView(null)}>Cancel</Button>
          <Button onClick={confirmRemoveSong} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen()}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage()}
      />
    </Container>
  );
};
