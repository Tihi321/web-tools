// src/components/QuickTabs.tsx
import { createSignal, createEffect, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Box, IconButton, TextField, Button, Paper, Typography } from "@suid/material";
import CloseIcon from "@suid/icons-material/Close";
import AddIcon from "@suid/icons-material/Add";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";

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

  const onDragStart = (e: DragEvent, index: number) => {
    setDraggedTab(index);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = draggedTab();
    if (dragIndex === null || dragIndex === dropIndex) return;

    setTabs(
      produce((tabs) => {
        const [reorderedItem] = tabs.splice(dragIndex, 1);
        tabs.splice(dropIndex, 0, reorderedItem);
      })
    );

    if (activeTab() === dragIndex) {
      setActiveTab(dropIndex);
    } else if (activeTab() > dragIndex && activeTab() <= dropIndex) {
      setActiveTab(activeTab() - 1);
    } else if (activeTab() < dragIndex && activeTab() >= dropIndex) {
      setActiveTab(activeTab() + 1);
    }

    setDraggedTab(null);
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
                sx={{ textTransform: "none", cursor: "move" }}
                draggable={true}
                onDragStart={(e) => onDragStart(e, index())}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index())}
              >
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
                    removeTab(tab.id);
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
    </Box>
  );
};
