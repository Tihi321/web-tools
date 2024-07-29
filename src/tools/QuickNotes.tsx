import { onMount, For, Show, createSignal } from "solid-js";
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
import { filter, get, map } from "lodash";

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
  cursor: move;

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

const NoteItem = styled("div")<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${(props) => (props.selected ? "bold" : "normal")};
  padding: 4px;
  margin-bottom: 4px;
  background-color: ${(props) => (props.selected ? "#e0e0e0" : "transparent")};
`;

const NoteTitle = styled(Box)`
  flex: 1;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

interface Note {
  id: string;
  title: string;
  content: string;
}

interface Folder {
  id: string;
  open: boolean;
  title: string;
  notes: Note[];
}

export const QuickNotes = () => {
  const [folders, setFolders] = createStore<Folder[]>([]);
  const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false);
  const [inputTitle, setInputTitle] = createSignal<string>("");
  const [modalMode, setModalMode] = createSignal<
    "" | "addFolder" | "editFolder" | "addNote" | "editNote"
  >("");
  const [activeFolderId, setActiveFolderId] = createSignal<string | null>(null);
  const [selectedNote, setSelectedNote] = createSignal<Note | null>(null);
  const [draggedFolderId, setDraggedFolderId] = createSignal<string | null>(null);

  const saveFolders = (state: Folder[]) => {
    setFolders(state);
    localStorage.setItem("webtools/quicknotes", JSON.stringify(state));
  };

  onMount(() => {
    const storedData = localStorage.getItem("webtools/quicknotes");
    if (storedData) {
      setFolders(JSON.parse(storedData));
    }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setInputTitle("");
  };

  const handleModalSubmit = () => {
    if (modalMode() === "addFolder") {
      addFolder();
    } else if (modalMode() === "editFolder") {
      editFolder();
    } else if (modalMode() === "addNote") {
      addNote();
    } else if (modalMode() === "editNote") {
      editNote();
    }
    closeModal();
  };

  const addFolder = () => {
    const newFolder = {
      id: Date.now().toString(),
      title: inputTitle(),
      open: true,
      notes: [],
    } as Folder;
    const newState = [...folders, newFolder];
    saveFolders(newState);
  };

  const editFolder = () => {
    const newState = folders.map((state) => {
      if (state.id === activeFolderId()) {
        return {
          ...state,
          title: inputTitle(),
        };
      }
      return state;
    });
    saveFolders(newState);
  };

  const removeFolder = (folderId: string) => {
    const newState = filter(folders, (state) => state.id !== folderId);
    saveFolders(newState);
  };

  const addNote = () => {
    const newState = map(folders, (state) => {
      if (state.id === activeFolderId()) {
        return {
          ...state,
          notes: [
            ...state.notes,
            {
              id: Date.now().toString(),
              title: inputTitle(),
              content: "",
            },
          ],
        };
      }
      return state;
    });
    saveFolders(newState);
  };

  const editNote = () => {
    const newState = map(folders, (state) => {
      if (state.id === activeFolderId()) {
        return {
          ...state,
          notes: map(get(state, ["notes"]), (note) => {
            if (note.id === selectedNote()?.id) {
              return {
                ...note,
                title: inputTitle(),
              };
            }
            return note;
          }),
        };
      }
      return state;
    });
    saveFolders(newState);
  };

  const removeNote = (folderId: string, noteId: string) => {
    const newState = map(folders, (state) => {
      if (state.id === folderId) {
        return {
          ...state,
          notes: filter(get(state, "notes"), (note) => note.id !== noteId),
        };
      }
      return state;
    });
    saveFolders(newState);
  };

  const updateNoteContent = (content: string) => {
    const newState = map(folders, (state) => {
      if (state.id === activeFolderId()) {
        return {
          ...state,
          notes: map(get(state, "notes"), (note) => {
            if (note.id === selectedNote()?.id) {
              return {
                ...note,
                content,
              };
            }
            return note;
          }),
        };
      }
      return state;
    });
    saveFolders(newState);
  };

  const updateFolderOpen = (value: boolean, folderId: string) => {
    const newState = map(folders, (state) => {
      if (state.id === folderId) {
        return {
          ...state,
          open: value,
        };
      }
      return state;
    });
    saveFolders(newState);
  };

  const handleDragStart = (e: DragEvent, folderId: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", folderId);
    }
    setDraggedFolderId(folderId);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const draggedId = draggedFolderId();
    if (!draggedId || draggedId === targetFolderId) return;

    const newOrder = folders.filter((folder) => folder.id !== draggedId);
    const draggedFolder = folders.find((folder) => folder.id === draggedId);
    if (draggedFolder) {
      const targetIndex = newOrder.findIndex((folder) => folder.id === targetFolderId);
      newOrder.splice(targetIndex, 0, draggedFolder);
      saveFolders(newOrder);
    }

    setDraggedFolderId(null);
  };

  return (
    <Container>
      <SidePanel>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Notes
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setModalMode("addFolder");
            setIsModalOpen(true);
          }}
          sx={{ mb: 2 }}
        >
          Add Folder
        </Button>
        <For each={folders}>
          {(folder) => (
            <FolderAccordion
              draggable
              onDragStart={(e) => handleDragStart(e, folder.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder.id)}
            >
              <Accordion
                title={folder.title}
                open={folder.open}
                onOpen={(value) => {
                  updateFolderOpen(value, folder.id);
                }}
              >
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setModalMode("addNote");
                    setIsModalOpen(true);
                  }}
                  sx={{ mb: 1 }}
                >
                  Add Note
                </Button>
                <For each={folder.notes}>
                  {(note) => (
                    <NoteItem selected={note.id === selectedNote()?.id}>
                      <NoteTitle
                        onClick={() => {
                          setActiveFolderId(folder.id);
                          setSelectedNote(note);
                        }}
                      >
                        {note.title}
                      </NoteTitle>
                      <NoteIcons>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedNote(note);
                            setInputTitle(note.title);
                            setActiveFolderId(folder.id);
                            setModalMode("editNote");
                            setIsModalOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeNote(folder.id, note.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </NoteIcons>
                    </NoteItem>
                  )}
                </For>
              </Accordion>
              <FolderIcons>
                <IconButton
                  size="small"
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setInputTitle(folder.title);
                    setModalMode("editFolder");
                    setIsModalOpen(true);
                  }}
                >
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
        <Show when={selectedNote()}>
          <TextEditor
            onChange={(value: string) => {
              updateNoteContent(value);
            }}
            value={selectedNote()?.content || ""}
          />
        </Show>
      </MainContent>
      <Dialog open={isModalOpen()} onClose={closeModal}>
        <DialogTitle>
          {modalMode() === "addFolder" ? "Add Folder" : ""}
          {modalMode() === "editFolder" ? "Edit Folder" : ""}
          {modalMode() === "addNote" ? "Add Note" : ""}
          {modalMode() === "editNote" ? "Edit Note" : ""}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={inputTitle()}
            onChange={(event) => {
              setInputTitle(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleModalSubmit}>
            {modalMode().startsWith("add") ? "Add" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
