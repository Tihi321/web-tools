import { createSignal, createEffect, For, Show, JSX } from "solid-js";
import { Button, TextField, Select, MenuItem, IconButton, Box } from "@suid/material";
import Delete from "@suid/icons-material/Delete";
import Save from "@suid/icons-material/Save";
import ContentCopy from "@suid/icons-material/ContentCopy";
import Add from "@suid/icons-material/Add";

type JsonValue = string | number | boolean | JsonArray | JsonObject;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface JsonItem {
  key: string;
  value: JsonValue;
  type: "string" | "number" | "boolean" | "array" | "object";
}

export const JsonCreator = () => {
  const [jsonItems, setJsonItems] = createSignal<JsonItem[]>([]);
  const [newKey, setNewKey] = createSignal("");
  const [newValue, setNewValue] = createSignal("");
  const [newType, setNewType] = createSignal<JsonItem["type"]>("string");

  createEffect(() => {
    const savedItems = localStorage.getItem("jsonCreatorItems");
    if (savedItems) {
      setJsonItems(JSON.parse(savedItems));
    }
  });

  const addItem = () => {
    if (newKey()) {
      const newItem: JsonItem = {
        key: newKey(),
        value: newType() === "array" ? [] : newType() === "object" ? {} : newValue(),
        type: newType(),
      };
      setJsonItems([...jsonItems(), newItem]);
      setNewKey("");
      setNewValue("");
    }
  };

  const updateItem = (index: number, key: string, value: JsonValue, type: JsonItem["type"]) => {
    const updatedItems = [...jsonItems()];
    updatedItems[index] = { key, value, type };
    setJsonItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = jsonItems().filter((_, i) => i !== index);
    setJsonItems(updatedItems);
  };

  const addArrayItem = (itemIndex: number, arrayIndex?: number) => {
    const updatedItems = [...jsonItems()];
    const newItemType = newType();
    const newItemValue = newItemType === "array" ? [] : newItemType === "object" ? {} : "";

    if (arrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      const targetArray = parentArray[arrayIndex] as JsonArray;
      targetArray.push({ key: "", value: newItemValue, type: newItemType });
      console.log("Updated nested array:", targetArray);
    } else {
      const targetArray = updatedItems[itemIndex].value as JsonArray;
      targetArray.push({ key: "", value: newItemValue, type: newItemType });
      console.log("Updated array:", targetArray);
    }

    setJsonItems(updatedItems);
    console.log("Final updated items:", updatedItems);
  };

  const updateArrayItem = (
    itemIndex: number,
    arrayIndex: number,
    value: JsonValue,
    nestedArrayIndex?: number
  ) => {
    const updatedItems = [...jsonItems()];
    if (nestedArrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      const targetArray = parentArray[arrayIndex] as JsonArray;
      targetArray[nestedArrayIndex] = value;
    } else {
      const targetArray = updatedItems[itemIndex].value as JsonArray;
      targetArray[arrayIndex] = value;
    }
    setJsonItems(updatedItems);
  };

  const removeArrayItem = (itemIndex: number, arrayIndex: number, nestedArrayIndex?: number) => {
    const updatedItems = [...jsonItems()];
    if (nestedArrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      const targetArray = parentArray[arrayIndex] as JsonArray;
      targetArray.splice(nestedArrayIndex, 1);
    } else {
      const targetArray = updatedItems[itemIndex].value as JsonArray;
      targetArray.splice(arrayIndex, 1);
    }
    setJsonItems(updatedItems);
  };

  const addObjectProperty = (itemIndex: number, arrayIndex?: number, nestedArrayIndex?: number) => {
    const updatedItems = [...jsonItems()];
    let target: JsonObject;

    if (nestedArrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      const nestedArray = parentArray[arrayIndex!] as JsonArray;
      target = nestedArray[nestedArrayIndex] as JsonObject;
    } else if (arrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      target = parentArray[arrayIndex] as JsonObject;
    } else {
      target = updatedItems[itemIndex].value as JsonObject;
    }

    const newKey = `key${Object.keys(target).length + 1}`;
    target[newKey] = "";
    setJsonItems(updatedItems);
  };

  const updateObjectProperty = (
    itemIndex: number,
    key: string,
    value: JsonValue,
    arrayIndex?: number,
    nestedArrayIndex?: number
  ) => {
    const updatedItems = [...jsonItems()];
    let target: JsonObject;

    if (nestedArrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      const nestedArray = parentArray[arrayIndex!] as JsonArray;
      target = nestedArray[nestedArrayIndex] as JsonObject;
    } else if (arrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      target = parentArray[arrayIndex] as JsonObject;
    } else {
      target = updatedItems[itemIndex].value as JsonObject;
    }

    target[key] = value;
    setJsonItems(updatedItems);
  };

  const removeObjectProperty = (
    itemIndex: number,
    key: string,
    arrayIndex?: number,
    nestedArrayIndex?: number
  ) => {
    const updatedItems = [...jsonItems()];
    let target: JsonObject;

    if (nestedArrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      const nestedArray = parentArray[arrayIndex!] as JsonArray;
      target = nestedArray[nestedArrayIndex] as JsonObject;
    } else if (arrayIndex !== undefined) {
      const parentArray = updatedItems[itemIndex].value as JsonArray;
      target = parentArray[arrayIndex] as JsonObject;
    } else {
      target = updatedItems[itemIndex].value as JsonObject;
    }

    delete target[key];
    setJsonItems(updatedItems);
  };

  const renderValue = (
    value: JsonValue,
    itemIndex: number,
    arrayIndex?: number,
    nestedArrayIndex?: number
  ): JSX.Element => {
    if (Array.isArray(value)) {
      return (
        <div>
          <For each={value}>
            {(arrayItem, index) => (
              <div style={{ display: "flex", "align-items": "center", "margin-bottom": "8px" }}>
                {renderValue(
                  arrayItem,
                  itemIndex,
                  arrayIndex !== undefined ? arrayIndex : index(),
                  nestedArrayIndex !== undefined ? nestedArrayIndex : undefined
                )}
                <IconButton
                  onClick={() =>
                    removeArrayItem(
                      itemIndex,
                      arrayIndex !== undefined ? arrayIndex : index(),
                      nestedArrayIndex
                    )
                  }
                >
                  <Delete />
                </IconButton>
              </div>
            )}
          </For>
          <div style={{ display: "flex", "align-items": "center" }}>
            <Select
              value={newType()}
              onChange={(e) => setNewType(e.target.value as JsonItem["type"])}
              sx={{ width: "120px", marginRight: "8px" }}
            >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="array">Array</MenuItem>
              <MenuItem value="object">Object</MenuItem>
            </Select>
            <Button onClick={() => addArrayItem(itemIndex, arrayIndex)} startIcon={<Add />}>
              Add Item
            </Button>
          </div>
        </div>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <div>
          <For each={Object.entries(value)}>
            {([key, val]) => (
              <div style={{ display: "flex", "align-items": "center", "margin-bottom": "8px" }}>
                <TextField
                  value={key}
                  onChange={(e) => {
                    const newValue = { ...(value as JsonObject) };
                    delete newValue[key];
                    newValue[e.target.value] = val;
                    updateObjectProperty(
                      itemIndex,
                      e.target.value,
                      val,
                      arrayIndex,
                      nestedArrayIndex
                    );
                  }}
                  sx={{ marginRight: "8px" }}
                />
                {renderValue(val, itemIndex, arrayIndex, nestedArrayIndex)}
                <IconButton
                  onClick={() => removeObjectProperty(itemIndex, key, arrayIndex, nestedArrayIndex)}
                >
                  <Delete />
                </IconButton>
              </div>
            )}
          </For>
          <Button
            onClick={() => addObjectProperty(itemIndex, arrayIndex, nestedArrayIndex)}
            startIcon={<Add />}
          >
            Add Property
          </Button>
        </div>
      );
    } else {
      return (
        <TextField
          value={String(value)}
          onChange={(e) => {
            const newValue = e.target.value;
            if (arrayIndex !== undefined) {
              updateArrayItem(itemIndex, arrayIndex, newValue, nestedArrayIndex);
            } else {
              updateItem(
                itemIndex,
                jsonItems()[itemIndex].key,
                newValue,
                jsonItems()[itemIndex].type
              );
            }
          }}
          sx={{ marginRight: "8px" }}
        />
      );
    }
  };

  const copyToClipboard = (stringify: boolean) => {
    const jsonObject = jsonItems().reduce((acc: Record<string, any>, item: JsonItem) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    const textToCopy = stringify ? JSON.stringify(jsonObject, null, 2) : JSON.stringify(jsonObject);
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Copied to clipboard");
    });
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("jsonCreatorItems", JSON.stringify(jsonItems()));
    alert("Saved to local storage");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <h2>JSON Creator</h2>
      <div style={{ "margin-bottom": "16px" }}>
        <TextField
          label="Key"
          value={newKey()}
          onChange={(e) => setNewKey(e.target.value)}
          sx={{ marginRight: "8px" }}
        />
        <Show when={newType() !== "array" && newType() !== "object"}>
          <TextField
            label="Value"
            value={newValue()}
            onChange={(e) => setNewValue(e.target.value)}
            sx={{ marginRight: "8px" }}
          />
        </Show>
        <Select
          value={newType()}
          onChange={(e) => setNewType(e.target.value as JsonItem["type"])}
          sx={{ width: "120px", marginRight: "8px" }}
        >
          <MenuItem value="string">String</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="boolean">Boolean</MenuItem>
          <MenuItem value="array">Array</MenuItem>
          <MenuItem value="object">Object</MenuItem>
        </Select>
        <Button variant="contained" onClick={addItem}>
          Add
        </Button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <For each={jsonItems()}>
            {(item, index) => (
              <tr>
                <td>
                  <TextField
                    value={item.key}
                    onChange={(e) => updateItem(index(), e.target.value, item.value, item.type)}
                  />
                </td>
                <td>{renderValue(item.value, index())}</td>
                <td>
                  <Select
                    value={item.type}
                    onChange={(e) =>
                      updateItem(index(), item.key, item.value, e.target.value as JsonItem["type"])
                    }
                  >
                    <MenuItem value="string">String</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="array">Array</MenuItem>
                    <MenuItem value="object">Object</MenuItem>
                  </Select>
                </td>
                <td>
                  <Button onClick={() => removeItem(index())} startIcon={<Delete />}>
                    Delete
                  </Button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <div style={{ "margin-top": "16px" }}>
        <Button
          onClick={() => copyToClipboard(false)}
          startIcon={<ContentCopy />}
          sx={{ marginRight: "8px" }}
        >
          Copy
        </Button>
        <Button
          onClick={() => copyToClipboard(true)}
          startIcon={<ContentCopy />}
          sx={{ marginRight: "8px" }}
        >
          Copy (Stringified)
        </Button>
        <Button onClick={saveToLocalStorage} startIcon={<Save />}>
          Save to Local Storage
        </Button>
      </div>
    </Box>
  );
};
