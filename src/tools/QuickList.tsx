// src/components/QuickListTool.tsx
import { createSignal, createEffect, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Box, TextField, Button, List, ListItem, ListItemText, IconButton } from "@suid/material";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import DeleteIcon from "@suid/icons-material/Delete";
import DragIndicatorIcon from "@suid/icons-material/DragIndicator";
import { filter } from "lodash";

interface ListItem {
  id: number;
  text: string;
}

export const QuickList = () => {
  const [inputValue, setInputValue] = createSignal("");
  const [items, setItems] = createStore<ListItem[]>([]);
  const [draggedItem, setDraggedItem] = createSignal<number | null>(null);
  const [dragOverItem, setDragOverItem] = createSignal<number | null>(null);

  // Load items from local storage on component mount
  createEffect(() => {
    const storedItems = localStorage.getItem("quickListItems");
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  });

  // Save items to local storage whenever they change
  createEffect(() => {
    localStorage.setItem("quickListItems", JSON.stringify(items));
  });

  const addItem = () => {
    if (inputValue().trim()) {
      setItems([...items, { id: Date.now(), text: inputValue().trim() }]);
      setInputValue("");
    }
  };

  const removeItem = (id: number) => {
    setItems(filter(items, (item) => item.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const onDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const onDragEnter = (index: number) => {
    setDragOverItem(index);
  };

  const onDragEnd = () => {
    const fromIndex = draggedItem();
    const toIndex = dragOverItem();

    if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
      setItems(
        produce((items) => {
          const [reorderedItem] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, reorderedItem);
        })
      );
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const onTouchStart = (e: TouchEvent, index: number) => {
    e.preventDefault();
    onDragStart(index);
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dragOverElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const listItem = dragOverElement?.closest("[data-index]") as HTMLElement | null;
    if (listItem) {
      const index = parseInt(listItem.dataset.index || "0", 10);
      onDragEnter(index);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    onDragEnd();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500, margin: "auto" }}>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={inputValue()}
          onChange={(event: any) => {
            setInputValue(event.target.value);
          }}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          placeholder="Enter new item"
        />
        <Button variant="contained" onClick={addItem}>
          Add
        </Button>
      </Box>
      <List>
        <For each={items}>
          {(item, index) => (
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="copy"
                    onClick={() => copyToClipboard(item.text)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => {
                      removeItem(item.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              draggable={true}
              data-index={index()}
              onDragStart={() => onDragStart(index())}
              onDragEnter={() => onDragEnter(index())}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onTouchStart={(e) => onTouchStart(e, index())}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              sx={{
                cursor: "move",
                backgroundColor: dragOverItem() === index() ? "rgba(0, 0, 0, 0.1)" : "transparent",
                transition: "background-color 0.2s ease",
              }}
            >
              <DragIndicatorIcon sx={{ mr: 2, cursor: "move" }} />
              <ListItemText
                title={item.text}
                primary={item.text.length > 50 ? `${item.text.substring(0, 50)}...` : item.text}
              />
            </ListItem>
          )}
        </For>
      </List>
    </Box>
  );
};
