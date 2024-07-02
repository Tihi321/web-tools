// src/components/QuickListTool.tsx
import { createSignal, createEffect, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Box, TextField, Button, List, ListItem, ListItemText, IconButton } from "@suid/material";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import DeleteIcon from "@suid/icons-material/Delete";

interface ListItem {
  id: number;
  text: string;
}

export const QuickList = () => {
  const [inputValue, setInputValue] = createSignal("");
  const [items, setItems] = createStore<ListItem[]>([]);

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
    setItems(items.filter((item) => item.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          {(item) => (
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
                  <IconButton edge="end" aria-label="delete" onClick={() => removeItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
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
