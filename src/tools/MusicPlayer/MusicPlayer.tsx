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
import { styled } from "solid-styled-components";
import { RangeInput } from "../../components/inputs/RangeInput";

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
`;

const SongList = styled(Box)`
  flex-grow: 1;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

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

  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = createSignal(false);
  const [isSongDialogOpen, setIsSongDialogOpen] = createSignal(false);
  const [newPlaylistName, setNewPlaylistName] = createSignal("");
  const [newSongName, setNewSongName] = createSignal("");
  const [newSongSrc, setNewSongSrc] = createSignal("");

  let audioRef: HTMLAudioElement;

  createEffect(() => {
    const storedPlaylists = localStorage.getItem("musicPlayerPlaylists");
    if (storedPlaylists) {
      setStore("playlists", JSON.parse(storedPlaylists));
    }
  });

  const savePlaylists = () => {
    localStorage.setItem("musicPlayerPlaylists", JSON.stringify(store.playlists));
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
    setIsPlaylistDialogOpen(false);
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
      setIsSongDialogOpen(false);
    }
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
                    </ListItem>
                  </ListItemContainer>
                )}
              </For>
            </List>
            <Button startIcon={<AddIcon />} onClick={() => setIsPlaylistDialogOpen(true)}>
              Add Playlist
            </Button>
          </PlaylistList>
        </PlaylistContainer>
        <Player>
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
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="mute" onClick={() => toggleMute(song.id)}>
                        {song.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={song.name}
                      secondary={song.src}
                      onClick={() => playSong(song)}
                      style={{ cursor: "pointer" }}
                    />
                  </ListItem>
                )}
              </For>
            </List>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setIsSongDialogOpen(true)}
              disabled={!store.currentPlaylist}
            >
              Add Song
            </Button>
          </SongList>
        </Player>
      </PlayerContainer>

      <Dialog open={isPlaylistDialogOpen()} onClose={() => setIsPlaylistDialogOpen(false)}>
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
          <Button onClick={() => setIsPlaylistDialogOpen(false)}>Cancel</Button>
          <Button onClick={addPlaylist}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isSongDialogOpen()} onClose={() => setIsSongDialogOpen(false)}>
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
          <Button onClick={() => setIsSongDialogOpen(false)}>Cancel</Button>
          <Button onClick={addSong}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
