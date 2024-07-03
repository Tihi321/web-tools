import { createSignal, createEffect, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  Box,
  IconButton,
  TextField,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@suid/material";
import CloseIcon from "@suid/icons-material/Close";
import AddIcon from "@suid/icons-material/Add";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import DragIndicatorIcon from "@suid/icons-material/DragIndicator";

interface TabData {
  id: number;
  title: string;
  content: string;
}

export const QuickTabs = () => {
  const [tabs, setTabs] = createStore<TabData[]>([]);
  const [activeTab, setActiveTab] = createSignal(0);
  const [editingTabId, setEditingTabId] = createSignal<number | null>(null);
  const [notificationMessage, setNotificationMessage] = createSignal("");
  const [draggedTab, setDraggedTab] = createSignal<number | null>(null);
  const [dragOverTab, setDragOverTab] = createSignal<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = createSignal(false);
  const [tabToDelete, setTabToDelete] = createSignal<number | null>(null);

  // Load tabs from local storage on component mount
  createEffect(() => {
    const storedTabs = localStorage.getItem("quickTabs");
    if (storedTabs) {
      setTabs(JSON.parse(storedTabs));
    } else {
      // Initialize with one empty tab if no stored data
      addNewTab();
    }
  });

  // Save tabs to local storage whenever they change
  createEffect(() => {
    localStorage.setItem("quickTabs", JSON.stringify(tabs));
  });

  const addNewTab = () => {
    setTabs(
      produce((tabs) => {
        tabs.push({
          id: Date.now(),
          title: `Tab ${tabs.length + 1}`,
          content: "",
        });
      })
    );
    setActiveTab(tabs.length - 1);
  };

  const openDeleteConfirmation = (id: number) => {
    setTabToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmOpen(false);
    setTabToDelete(null);
  };

  const confirmDelete = () => {
    if (tabToDelete() !== null) {
      removeTab(tabToDelete() || 0);
      closeDeleteConfirmation();
    }
  };

  const removeTab = (id: number) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    setTabs(
      produce((tabs) => {
        tabs.splice(index, 1);
      })
    );
    if (activeTab() === index) {
      setActiveTab(Math.max(0, index - 1));
    } else if (activeTab() > index) {
      setActiveTab(activeTab() - 1);
    }
  };

  const updateTabContent = (id: number, content: string) => {
    setTabs(
      produce((tabs) => {
        const tab = tabs.find((t) => t.id === id);
        if (tab) tab.content = content;
      })
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setNotificationMessage("Content copied to clipboard!");
        setTimeout(() => setNotificationMessage(""), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setNotificationMessage("Failed to copy to clipboard");
        setTimeout(() => setNotificationMessage(""), 3000);
      });
  };

  const startEditingTabName = (id: number) => {
    setEditingTabId(id);
  };

  const finishEditingTabName = (id: number, newTitle: string) => {
    setTabs(
      produce((tabs) => {
        const tab = tabs.find((t) => t.id === id);
        if (tab) tab.title = newTitle;
      })
    );
    setEditingTabId(null);
  };

  const onDragStart = (index: number) => {
    setDraggedTab(index);
  };

  const onDragEnter = (index: number) => {
    setDragOverTab(index);
  };

  const onDragEnd = () => {
    const fromIndex = draggedTab();
    const toIndex = dragOverTab();

    if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
      setTabs(
        produce((tabs) => {
          const [reorderedItem] = tabs.splice(fromIndex, 1);
          tabs.splice(toIndex, 0, reorderedItem);
        })
      );

      if (activeTab() === fromIndex) {
        setActiveTab(toIndex);
      } else if (activeTab() > fromIndex && activeTab() <= toIndex) {
        setActiveTab(activeTab() - 1);
      } else if (activeTab() < fromIndex && activeTab() >= toIndex) {
        setActiveTab(activeTab() + 1);
      }
    }

    setDraggedTab(null);
    setDragOverTab(null);
  };

  const onTouchStart = (e: TouchEvent, index: number) => {
    e.preventDefault();
    onDragStart(index);
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dragOverElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const tabElement = dragOverElement?.closest("[data-index]") as HTMLElement | null;
    if (tabElement) {
      const index = parseInt(tabElement.dataset.index || "0", 10);
      onDragEnter(index);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    onDragEnd();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Paper elevation={3} sx={{ mb: 2, p: 1 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <For each={tabs}>
            {(tab, index) => (
              <Button
                variant={activeTab() === index() ? "contained" : "outlined"}
                onClick={() => setActiveTab(index())}
                onDblClick={() => startEditingTabName(tab.id)}
                sx={{
                  textTransform: "none",
                  cursor: "move",
                  backgroundColor: dragOverTab() === index() ? "rgba(0, 0, 0, 0.1)" : undefined,
                  transition: "background-color 0.2s ease",
                }}
                draggable={true}
                data-index={index()}
                onDragStart={() => onDragStart(index())}
                onDragEnter={() => onDragEnter(index())}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onTouchStart={(e) => onTouchStart(e, index())}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <DragIndicatorIcon sx={{ mr: 1, cursor: "move" }} />
                {editingTabId() === tab.id ? (
                  <TextField
                    value={tab.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setTabs(
                        produce((tabs) => {
                          const t = tabs.find((t) => t.id === tab.id);
                          if (t) t.title = e.target.value;
                        })
                      )
                    }
                    onBlur={() => finishEditingTabName(tab.id, tab.title)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        finishEditingTabName(tab.id, tab.title);
                      }
                    }}
                    size="small"
                    autoFocus
                  />
                ) : (
                  tab.title
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirmation(tab.id);
                  }}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Button>
            )}
          </For>
          <IconButton onClick={addNewTab} sx={{ ml: "auto" }}>
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>
      <For each={tabs}>
        {(tab, index) => (
          <Box sx={{ display: activeTab() === index() ? "block" : "none" }}>
            <TextField
              multiline
              fullWidth
              minRows={10}
              value={tab.content}
              onChange={(e) => updateTabContent(tab.id, e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => copyToClipboard(tab.content)}
              startIcon={<ContentCopyIcon />}
            >
              Copy to Clipboard
            </Button>
          </Box>
        )}
      </For>
      {notificationMessage() && (
        <Typography sx={{ mt: 2, textAlign: "center" }}>{notificationMessage()}</Typography>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen()}
        onClose={closeDeleteConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Tab Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this tab? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation}>Cancel</Button>
          <Button onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
