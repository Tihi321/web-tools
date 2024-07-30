import { createSignal, createEffect, For } from "solid-js";
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
}

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

type DialogView = "playlist" | "song" | "deletePlaylist" | "deleteSong" | null;

export const MusicPlayer = () => {
  const [store, setStore] = createStore({
    playlists: [] as Playlist[],
    currentPlaylist: null as Playlist | null,
    currentSong: null as Song | null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    autoplay: false,
  });

  const [dialogView, setDialogView] = createSignal<DialogView>(null);
  const [newPlaylistName, setNewPlaylistName] = createSignal("");
  const [newSongName, setNewSongName] = createSignal("");
  const [newSongSrc, setNewSongSrc] = createSignal("");
  const [playlistToDelete, setPlaylistToDelete] = createSignal<Playlist | null>(null);
  const [songToDelete, setSongToDelete] = createSignal<Song | null>(null);
  const [snackbarOpen, setSnackbarOpen] = createSignal(false);
  const [snackbarMessage, setSnackbarMessage] = createSignal("");
  const [draggedSongId, setDraggedSongId] = createSignal<string | null>(null);
  let audioRef: HTMLAudioElement;

  createEffect(() => {
    const storedPlaylists = localStorage.getItem("web-tools/musicplayerplaylists");
    if (storedPlaylists) {
      setStore("playlists", JSON.parse(storedPlaylists));
    }
  });

  const savePlaylists = () => {
    localStorage.setItem("web-tools/musicplayerplaylists", JSON.stringify(store.playlists));
  };

  const loadPlaylist = (playlist: Playlist) => {
    setStore("currentPlaylist", playlist);
    setStore("currentSong", playlist.songs[0] || null);
  };

  const playSong = (song: Song) => {
    setStore("currentSong", song);
    setStore("isPlaying", true);
    if (audioRef) {
      audioRef.src = song.src;
      audioRef.play();
    }
  };

  const togglePlay = () => {
    setStore("isPlaying", !store.isPlaying);
    if (audioRef) {
      if (store.isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
    }
  };

  const nextSong = () => {
    if (store.currentPlaylist && store.currentSong) {
      const currentIndex = store.currentPlaylist.songs.findIndex(
        (song) => song.id === store.currentSong?.id
      );
      const nextIndex = (currentIndex + 1) % store.currentPlaylist.songs.length;
      playSong(store.currentPlaylist.songs[nextIndex]);
    }
  };

  const previousSong = () => {
    if (store.currentPlaylist && store.currentSong) {
      const currentIndex = store.currentPlaylist.songs.findIndex(
        (song) => song.id === store.currentSong?.id
      );
      const previousIndex =
        (currentIndex - 1 + store.currentPlaylist.songs.length) %
        store.currentPlaylist.songs.length;
      playSong(store.currentPlaylist.songs[previousIndex]);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef) {
      setStore("currentTime", audioRef.currentTime);
      setStore("duration", audioRef.duration);
    }
  };

  const handleTimeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (audioRef) {
      audioRef.currentTime = Number(target.value);
    }
  };

  const handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (audioRef) {
      const newVolume = Number(target.value);
      audioRef.volume = newVolume;
      setStore("volume", newVolume);
    }
  };

  const toggleMute = (songId: string) => {
    setStore("playlists", (playlists) =>
      playlists.map((playlist) => ({
        ...playlist,
        songs: playlist.songs.map((song) =>
          song.id === songId ? { ...song, muted: !song.muted } : song
        ),
      }))
    );
    savePlaylists();
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
    setStore("playlists", (playlists) => [...playlists, newPlaylist]);
    savePlaylists();
    setNewPlaylistName("");
    setDialogView(null);
  };

  const addSong = () => {
    if (store.currentPlaylist) {
      const newSong: Song = {
        id: Date.now().toString(),
        name: newSongName(),
        src: newSongSrc(),
        muted: false,
      };
      setStore("playlists", (playlists) =>
        playlists.map((playlist) =>
          playlist.id === store.currentPlaylist?.id
            ? { ...playlist, songs: [...playlist.songs, newSong] }
            : playlist
        )
      );
      savePlaylists();
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
    const playlistId = playlistToDelete()?.id;
    if (playlistId) {
      setStore("playlists", (playlists) => playlists.filter((p) => p.id !== playlistId));
      if (store.currentPlaylist?.id === playlistId) {
        setStore("currentPlaylist", null);
        setStore("currentSong", null);
        setStore("isPlaying", false);
      }
      savePlaylists();
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
    if (song && store.currentPlaylist) {
      setStore("playlists", (playlists) =>
        playlists.map((playlist) =>
          playlist.id === store.currentPlaylist?.id
            ? { ...playlist, songs: playlist.songs.filter((s) => s.id !== song.id) }
            : playlist
        )
      );
      if (store.currentSong?.id === song.id) {
        setStore("currentSong", null);
        setStore("isPlaying", false);
      }
      savePlaylists();
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
    if (sourceSongId && store.currentPlaylist) {
      const newSongs = [...store.currentPlaylist.songs];
      const sourceIndex = newSongs.findIndex((s) => s.id === sourceSongId);
      const targetIndex = newSongs.findIndex((s) => s.id === targetSongId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = newSongs.splice(sourceIndex, 1);
        newSongs.splice(targetIndex, 0, removed);

        setStore("playlists", (playlists) =>
          playlists.map((playlist) =>
            playlist.id === store.currentPlaylist?.id ? { ...playlist, songs: newSongs } : playlist
          )
        );
        savePlaylists();
      }
    }
    setDraggedSongId(null);
  };

  return (
    <Container>
      <audio
        ref={audioRef!}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        style={{ display: "none" }}
      />
      <PlayerContainer>
        <PlaylistContainer>
          <PlaylistList>
            <Typography variant="h6">Playlists</Typography>
            <List>
              <For each={store.playlists}>
                {(playlist) => (
                  <ListItemContainer
                    selected={playlist.id === store.currentPlaylist?.id}
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
            Now Playing: {store.currentSong ? store.currentSong.name : "No song selected"}
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
                onInput={handleVolumeChange}
                style={{ width: "200px", "margin-left": "16px" }}
              />
            </Box>
            <PlayerControls>
              <IconButton onClick={previousSong} disabled={!store.currentSong}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton onClick={togglePlay} disabled={!store.currentSong}>
                {store.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={nextSong} disabled={!store.currentSong}>
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
              {store.currentPlaylist ? store.currentPlaylist.name : "No playlist selected"}
            </Typography>
            <List>
              <For each={store.currentPlaylist?.songs}>
                {(song) => (
                  <DraggableSongItem
                    selected={song.id === store.currentSong?.id}
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
                          onClick={() => toggleMute(song.id)}
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
                      style={{ cursor: "pointer" }}
                    />
                  </DraggableSongItem>
                )}
              </For>
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setDialogView("song")}
              disabled={!store.currentPlaylist}
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
