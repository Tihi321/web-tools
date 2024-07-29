import { onMount, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@suid/material";
import AddIcon from "@suid/icons-material/Add";
import DeleteIcon from "@suid/icons-material/Delete";
import EditIcon from "@suid/icons-material/Edit";
import { styled } from "solid-styled-components";
import { Accordion } from "../components/containers/Accordion";
import { TextEditor } from "../components/code/TextEditor";

const Container = styled(Box)`
  display: grid;
  grid-template-columns: 300px 1fr;
  width: 100%;
  background-color: #b2c4cd;
`;

const SidePanel = styled(Box)`
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
`;

const FolderAccordion = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .accordion {
    flex: 1;
  }
`;

const FolderIcons = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 8px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

const NoteIcons = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 8px;
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MainContent = styled(Box)`
  flex: 1;
`;

interface Note {
  id: string;
  title: string;
  content: string;
}

interface Folder {
  id: string;
  title: string;
  notes: Note[];
}

export const QuickNotes = () => {
  const [store, setStore] = createStore({
    folders: [] as Folder[],
    selectedNote: null as Note | null,
    isModalOpen: false,
    modalMode: "" as "addFolder" | "editFolder" | "addNote" | "editNote",
    modalTitle: "",
    inputTitle: "",
    activeFolderId: null as string | null,
  });

  const saveFolders = (state: Folder[]) => {
    setStore("folders", state);
    localStorage.setItem("webtools/quickNotes", JSON.stringify(state));
  };

  onMount(() => {
    const storedData = localStorage.getItem("quickNotes");
    if (storedData) {
      setStore("folders", JSON.parse(storedData));
    }
  });

  const openModal = (
    mode: "addFolder" | "editFolder" | "addNote" | "editNote",
    folderId?: string,
    note?: Note
  ) => {
    setStore({
      isModalOpen: true,
      modalMode: mode,
      modalTitle: mode.startsWith("add")
        ? `Add ${mode === "addFolder" ? "Folder" : "Note"}`
        : `Edit ${mode === "editFolder" ? "Folder" : "Note"}`,
      inputTitle: mode.startsWith("edit")
        ? mode === "editFolder"
          ? store.folders.find((f) => f.id === folderId)?.title || ""
          : note?.title || ""
        : "",
      activeFolderId: folderId || null,
    });
  };

  const closeModal = () => {
    setStore({
      isModalOpen: false,
      inputTitle: "",
      activeFolderId: null,
    });
  };

  const handleModalSubmit = () => {
    if (store.modalMode === "addFolder") {
      addFolder();
    } else if (store.modalMode === "editFolder") {
      editFolder();
    } else if (store.modalMode === "addNote") {
      addNote();
    } else if (store.modalMode === "editNote") {
      editNote();
    }
    closeModal();
  };

  const addFolder = () => {
    const newState = [
      ...store.folders,
      {
        id: Date.now().toString(),
        title: store.inputTitle,
        notes: [],
      },
    ];
    saveFolders(newState);
  };

  const editFolder = () => {
    const newState = store.folders.map((f) => {
      if (f.id === store.activeFolderId) {
        f.title = store.inputTitle;
      }
      return f;
    });

    saveFolders(newState);
  };

  const removeFolder = (folderId: string) => {
    const newState = store.folders.filter((f) => f.id !== folderId);
    saveFolders(newState);
  };

  const addNote = () => {
    const newState = store.folders.map((f) => {
      if (f.id === store.activeFolderId) {
        f.notes.push({
          id: Date.now().toString(),
          title: store.inputTitle,
          content: "",
        });
      }
      return f;
    });
    saveFolders(newState);
  };

  const editNote = () => {
    const newState = store.folders.map((f) => {
      if (f.id === store.activeFolderId) {
        f.notes = f.notes.map((n) => {
          if (n.id === store.selectedNote?.id) {
            n.title = store.inputTitle;
          }
          return n;
        });
      }
      return f;
    });
    saveFolders(newState);
  };

  const removeNote = (folderId: string, noteId: string) => {
    const newState = store.folders.map((f) => {
      if (f.id === folderId) {
        f.notes = f.notes.filter((n) => n.id !== noteId);
      }
      return f;
    });
    saveFolders(newState);
  };

  const selectNote = (note: Note) => {
    setStore("selectedNote", note);
  };

  const updateNoteContent = (content: string) => {
    const newState = store.folders.map((f) => {
      if (f.id === store.activeFolderId) {
        f.notes = f.notes.map((n) => {
          if (n.id === store.selectedNote?.id) {
            n.content = content;
          }
          return n;
        });
      }
      return f;
    });
    saveFolders(newState);
  };

  return (
    <Container>
      <SidePanel>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Notes
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => openModal("addFolder")} sx={{ mb: 2 }}>
          Add Folder
        </Button>
        <For each={store.folders}>
          {(folder) => (
            <FolderAccordion>
              <Accordion title={folder.title}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => openModal("addNote", folder.id)}
                  sx={{ mb: 1 }}
                >
                  Add Note
                </Button>
                <For each={folder.notes}>
                  {(note) => (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        onClick={() => selectNote(note)}
                        sx={{ cursor: "pointer", flexGrow: 1 }}
                      >
                        {note.title}
                      </Typography>
                      <NoteIcons>
                        <IconButton
                          size="small"
                          onClick={() => openModal("editNote", folder.id, note)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeNote(folder.id, note.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </NoteIcons>
                    </Box>
                  )}
                </For>
              </Accordion>
              <FolderIcons>
                <IconButton size="small" onClick={() => openModal("editFolder", folder.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => removeFolder(folder.id)}>
                  <DeleteIcon />
                </IconButton>
              </FolderIcons>
            </FolderAccordion>
          )}
        </For>
      </SidePanel>
      <MainContent>
        <Show when={store.selectedNote}>
          <TextEditor
            onChange={(value: string) => {
              updateNoteContent(value);
            }}
            value={store.selectedNote?.content || ""}
          />
        </Show>
      </MainContent>
      <Dialog open={store.isModalOpen} onClose={closeModal}>
        <DialogTitle>{store.modalTitle}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={store.inputTitle}
            onChange={(e) => setStore("inputTitle", e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleModalSubmit}>
            {store.modalMode.startsWith("add") ? "Add" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
