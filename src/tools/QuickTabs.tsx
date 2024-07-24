import { createSignal, createEffect, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  Box,
  IconButton,
  TextField,
  Button,
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
import get from "lodash/get";
import { Accordion } from "../components/containers/Accordion"; // Import the custom Accordion component

interface TabData {
  id: number;
  title: string;
  content: string;
}

interface ParentTabData {
  id: number;
  title: string;
  children: TabData[];
}

export const QuickTabs = () => {
  const [parentTabs, setParentTabs] = createStore<ParentTabData[]>([]);
  const [activeParentTab, setActiveParentTab] = createSignal(0);
  const [activeChildTab, setActiveChildTab] = createSignal(0);
  const [editingTabId, setEditingTabId] = createSignal<number | null>(null);
  const [notificationMessage, setNotificationMessage] = createSignal("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = createSignal(false);
  const [tabToDelete, setTabToDelete] = createSignal<{
    parentId: number;
    childId: number | null;
  } | null>(null);
  const [draggedParentTab, setDraggedParentTab] = createSignal<number | null>(null);
  const [draggedChildTab, setDraggedChildTab] = createSignal<number | null>(null);

  // Load tabs from local storage on component mount
  createEffect(() => {
    const storedTabs = localStorage.getItem("webtools/quicktabs");
    if (storedTabs) {
      setParentTabs(JSON.parse(storedTabs));
    } else {
      // Initialize with one empty parent tab if no stored data
      addNewParentTab();
    }
  });

  // Save tabs to local storage whenever they change
  createEffect(() => {
    localStorage.setItem("webtools/quicktabs", JSON.stringify(parentTabs));
  });

  const addNewParentTab = () => {
    console.log("Adding new parent tab");
    setParentTabs(
      produce((tabs) => {
        tabs.push({
          id: Date.now(),
          title: `Group ${tabs.length + 1}`,
          children: [
            {
              id: Date.now() + 1,
              title: "Tab 1",
              content: "",
            },
          ],
        });
      })
    );
    setActiveParentTab(parentTabs.length - 1);
    setActiveChildTab(0);
  };

  const addNewChildTab = (parentId: number) => {
    setParentTabs(
      produce((tabs) => {
        const parent = tabs.find((t) => t.id === parentId);
        if (parent) {
          parent.children.push({
            id: Date.now(),
            title: `Tab ${parent.children.length + 1}`,
            content: "",
          });
        }
      })
    );
    setActiveChildTab(get(parentTabs, [activeParentTab(), "children"], []).length - 1);
  };

  const openDeleteConfirmation = (parentId: number, childId: number | null) => {
    setTabToDelete({ parentId, childId });
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmOpen(false);
    setTabToDelete(null);
  };

  const confirmDelete = () => {
    if (tabToDelete()) {
      const { parentId, childId } = tabToDelete()!;
      if (childId === null) {
        removeParentTab(parentId);
      } else {
        removeChildTab(parentId, childId);
      }
      closeDeleteConfirmation();
    }
  };

  const removeParentTab = (id: number) => {
    const index = parentTabs.findIndex((tab) => tab.id === id);
    setParentTabs(
      produce((tabs) => {
        tabs.splice(index, 1);
      })
    );
    if (activeParentTab() === index) {
      setActiveParentTab(Math.max(0, index - 1));
      setActiveChildTab(0);
    } else if (activeParentTab() > index) {
      setActiveParentTab(activeParentTab() - 1);
    }
  };

  const removeChildTab = (parentId: number, childId: number) => {
    setParentTabs(
      produce((tabs) => {
        const parent = tabs.find((t) => t.id === parentId);
        if (parent) {
          const index = parent.children.findIndex((child) => child.id === childId);
          parent.children.splice(index, 1);
          if (activeChildTab() === index) {
            setActiveChildTab(Math.max(0, index - 1));
          } else if (activeChildTab() > index) {
            setActiveChildTab(activeChildTab() - 1);
          }
        }
      })
    );
  };

  const updateTabContent = (parentId: number, childId: number, content: string) => {
    setParentTabs(
      produce((tabs) => {
        const parent = tabs.find((t) => t.id === parentId);
        if (parent) {
          const child = parent.children.find((c) => c.id === childId);
          if (child) child.content = content;
        }
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

  const finishEditingTabName = (parentId: number, childId: number | null, newTitle: string) => {
    setParentTabs(
      produce((tabs) => {
        if (childId === null) {
          const parent = tabs.find((t) => t.id === parentId);
          if (parent) parent.title = newTitle;
        } else {
          const parent = tabs.find((t) => t.id === parentId);
          if (parent) {
            const child = parent.children.find((c) => c.id === childId);
            if (child) child.title = newTitle;
          }
        }
      })
    );
    setEditingTabId(null);
  };

  const onDragStartParent = (_: DragEvent, index: number) => {
    setDraggedParentTab(index);
  };

  const onDragOverParent = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDropParent = (_: DragEvent, index: number) => {
    const draggedIndex = draggedParentTab();
    if (draggedIndex !== null && draggedIndex !== index) {
      setParentTabs(
        produce((tabs) => {
          const [removed] = tabs.splice(draggedIndex, 1);
          tabs.splice(index, 0, removed);
        })
      );
      if (activeParentTab() === draggedIndex) {
        setActiveParentTab(index);
      } else if (activeParentTab() > draggedIndex && activeParentTab() <= index) {
        setActiveParentTab(activeParentTab() - 1);
      } else if (activeParentTab() < draggedIndex && activeParentTab() >= index) {
        setActiveParentTab(activeParentTab() + 1);
      }
    }
    setDraggedParentTab(null);
  };

  const onDragStartChild = (_: DragEvent, index: number) => {
    setDraggedChildTab(index);
  };

  const onDragOverChild = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDropChild = (_: DragEvent, index: number) => {
    const draggedIndex = draggedChildTab();
    if (draggedIndex !== null && draggedIndex !== index) {
      setParentTabs(
        produce((tabs) => {
          const parent = tabs[activeParentTab()];
          const [removed] = parent.children.splice(draggedIndex, 1);
          parent.children.splice(index, 0, removed);
        })
      );
      if (activeChildTab() === draggedIndex) {
        setActiveChildTab(index);
      } else if (activeChildTab() > draggedIndex && activeChildTab() <= index) {
        setActiveChildTab(activeChildTab() - 1);
      } else if (activeChildTab() < draggedIndex && activeChildTab() >= index) {
        setActiveChildTab(activeChildTab() + 1);
      }
    }
    setDraggedChildTab(null);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "auto", p: 2 }}>
      <Accordion title={get(parentTabs, [activeParentTab(), "title"], "")}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <For each={parentTabs}>
            {(parentTab, index) => (
              <Button
                variant={activeParentTab() === index() ? "contained" : "outlined"}
                onClick={() => setActiveParentTab(index())}
                sx={{ textTransform: "none" }}
                draggable={true}
                onDragStart={(e) => onDragStartParent(e, index())}
                onDragOver={onDragOverParent}
                onDrop={(e) => onDropParent(e, index())}
              >
                <DragIndicatorIcon sx={{ mr: 1, cursor: "move" }} />
                {editingTabId() === parentTab.id ? (
                  <TextField
                    value={parentTab.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setParentTabs(
                        produce((tabs) => {
                          const t = tabs.find((t) => t.id === parentTab.id);
                          if (t) t.title = e.target.value;
                        })
                      )
                    }
                    onBlur={() => finishEditingTabName(parentTab.id, null, parentTab.title)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        finishEditingTabName(parentTab.id, null, parentTab.title);
                      }
                    }}
                    size="small"
                    autoFocus
                  />
                ) : (
                  <span onDblClick={() => startEditingTabName(parentTab.id)}>
                    {parentTab.title}
                  </span>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirmation(parentTab.id, null);
                  }}
                  sx={{ ml: 1, color: "inherit" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Button>
            )}
          </For>
          <IconButton
            size="small"
            onClick={addNewParentTab}
            sx={{ ml: "auto", display: "flex", justifyContent: "center" }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Accordion>
      <Show when={parentTabs.length > 0}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <For each={get(parentTabs, [activeParentTab(), "children"], [])}>
            {(childTab, index) => (
              <Button
                variant={activeChildTab() === index() ? "contained" : "outlined"}
                onClick={() => setActiveChildTab(index())}
                sx={{ textTransform: "none" }}
                draggable={true}
                onDragStart={(e) => onDragStartChild(e, index())}
                onDragOver={onDragOverChild}
                onDrop={(e) => onDropChild(e, index())}
              >
                <DragIndicatorIcon sx={{ mr: 1, cursor: "move" }} />
                {editingTabId() === childTab.id ? (
                  <TextField
                    value={childTab.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setParentTabs(
                        produce((tabs) => {
                          const p = tabs[activeParentTab()];
                          const c = p.children.find((c) => c.id === childTab.id);
                          if (c) c.title = e.target.value;
                        })
                      )
                    }
                    onBlur={() =>
                      finishEditingTabName(
                        parentTabs[activeParentTab()].id,
                        childTab.id,
                        childTab.title
                      )
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        finishEditingTabName(
                          parentTabs[activeParentTab()].id,
                          childTab.id,
                          childTab.title
                        );
                      }
                    }}
                    size="small"
                    autoFocus
                  />
                ) : (
                  <span onDblClick={() => startEditingTabName(childTab.id)}>{childTab.title}</span>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirmation(parentTabs[activeParentTab()].id, childTab.id);
                  }}
                  sx={{ ml: 1, color: "inherit" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Button>
            )}
          </For>
          <IconButton
            size="small"
            onClick={() => addNewChildTab(parentTabs[activeParentTab()].id)}
            sx={{ ml: "auto", display: "flex", justifyContent: "center" }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Show when={get(parentTabs, [activeParentTab(), "children"], []).length > 0}>
          <TextField
            multiline
            fullWidth
            minRows={10}
            value={get(parentTabs, [activeParentTab(), "children", activeChildTab(), "content"])}
            onChange={(e) =>
              updateTabContent(
                get(parentTabs, [activeParentTab(), "id"]),
                get(parentTabs, [activeParentTab(), "children", activeChildTab(), "id"]),
                e.target.value
              )
            }
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={() =>
              copyToClipboard(
                get(parentTabs, [activeParentTab(), "children", activeChildTab(), "content"])
              )
            }
            startIcon={<ContentCopyIcon />}
          >
            Copy to Clipboard
          </Button>
        </Show>
      </Show>

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
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this {tabToDelete()?.childId === null ? "group" : "tab"}
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
