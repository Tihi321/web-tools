import { createSignal, createEffect, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@suid/material";
import AddIcon from "@suid/icons-material/Add";
import CloseIcon from "@suid/icons-material/Close";
import DragIndicatorIcon from "@suid/icons-material/DragIndicator";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import { Accordion } from "../components/layout/Accordion";
import { Snackbar } from "../components/toasts/Snackbar";
import { Highlight } from "../components/code/CodeHightlighter";

interface ParamOption {
  value: string;
}

interface Param {
  type: "text" | "number" | "select" | "array";
  label: string;
  options?: ParamOption[];
}

interface Prompt {
  id: number;
  title: string;
  system: string;
  params: Param[];
  callback: string;
}

export const LLMApiPrompter = () => {
  const [prompts, setPrompts] = createStore<Prompt[]>([]);
  const [activePrompt, setActivePrompt] = createSignal(0);
  const [editingPromptId, setEditingPromptId] = createSignal<number | null>(null);
  const [previewValues, setPreviewValues] = createStore<Record<number, any>>({});
  const [callbackOutput, setCallbackOutput] = createSignal("");
  const [snackbarOpen, setSnackbarOpen] = createSignal(false);
  const [snackbarMessage, setSnackbarMessage] = createSignal("");

  const updatePromptCallback = (id: number, callback: string) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === id);
        if (prompt) prompt.callback = callback;
      })
    );
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setSnackbarMessage("Failed to copy to clipboard");
        setSnackbarOpen(true);
      }
    );
  };

  const getParamInfo = () => {
    return (
      prompts[activePrompt()]?.params.map((param, index) => ({
        name: `param${index + 1}`,
        type: param.type,
        label: param.label,
      })) || []
    );
  };

  const copyParamName = (paramName: string, isSubItem: boolean = false) => {
    const textToCopy = isSubItem ? `${paramName}.subItems` : paramName;
    copyToClipboard(textToCopy, `${textToCopy} copied to clipboard`);
  };

  createEffect(() => {
    const storedPrompts = localStorage.getItem("webtools/llmapiprompts");
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    } else {
      addNewPrompt();
    }
  });

  createEffect(() => {
    localStorage.setItem("webtools/llmapiprompts", JSON.stringify(prompts));
  });

  const addNewPrompt = () => {
    setPrompts(
      produce((prompts) => {
        prompts.push({
          id: Date.now(),
          title: `Prompt ${prompts.length + 1}`,
          system: "",
          params: [],
          callback: "",
        });
      })
    );
    setActivePrompt(prompts.length - 1);
  };

  const removePrompt = (id: number) => {
    const index = prompts.findIndex((prompt) => prompt.id === id);
    setPrompts(
      produce((prompts) => {
        prompts.splice(index, 1);
      })
    );
    if (activePrompt() === index) {
      setActivePrompt(Math.max(0, index - 1));
    } else if (activePrompt() > index) {
      setActivePrompt(activePrompt() - 1);
    }
  };

  const updatePromptSystem = (id: number, system: string) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === id);
        if (prompt) prompt.system = system;
      })
    );
  };

  const addParam = (promptId: number) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === promptId);
        if (prompt) {
          if (!prompt.params) {
            prompt.params = [];
          }
          prompt.params.push({ type: "text", label: `Parameter ${prompt.params.length + 1}` });
        }
      })
    );
  };

  const updateParamType = (
    promptId: number,
    paramIndex: number,
    type: "text" | "number" | "select" | "array"
  ) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === promptId);
        if (prompt) {
          prompt.params[paramIndex].type = type;
          if (type === "select" && !prompt.params[paramIndex].options) {
            prompt.params[paramIndex].options = [];
          }
        }
      })
    );
  };

  const updateParamLabel = (promptId: number, paramIndex: number, label: string) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === promptId);
        if (prompt) {
          prompt.params[paramIndex].label = label;
        }
      })
    );
  };

  const addSelectOption = (promptId: number, paramIndex: number) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === promptId);
        if (prompt && prompt.params[paramIndex].type === "select") {
          prompt.params[paramIndex].options = prompt.params[paramIndex].options || [];
          prompt.params[paramIndex].options!.push({ value: "" });
        }
      })
    );
  };

  const updateSelectOption = (
    promptId: number,
    paramIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === promptId);
        if (prompt && prompt.params[paramIndex].type === "select") {
          prompt.params[paramIndex].options![optionIndex].value = value;
        }
      })
    );
  };

  const removeParam = (promptId: number, paramIndex: number) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === promptId);
        if (prompt) {
          prompt.params.splice(paramIndex, 1);
        }
      })
    );
  };

  const updatePreviewValue = (paramIndex: number, value: any) => {
    setPreviewValues(paramIndex, value);
  };

  const addArrayInput = (paramIndex: number) => {
    setPreviewValues(
      produce((values) => {
        if (!values[paramIndex]) {
          values[paramIndex] = [];
        }
        values[paramIndex].push({ value: "", subInputs: [] });
      })
    );
  };

  const updateArrayInputValue = (paramIndex: number, arrayInputIndex: number, value: string) => {
    setPreviewValues(
      produce((values) => {
        values[paramIndex][arrayInputIndex].value = value;
      })
    );
  };

  const addSubInput = (paramIndex: number, arrayInputIndex: number) => {
    setPreviewValues(
      produce((values) => {
        values[paramIndex][arrayInputIndex].subInputs.push("");
      })
    );
  };

  const updateSubInputValue = (
    paramIndex: number,
    arrayInputIndex: number,
    subInputIndex: number,
    value: string
  ) => {
    setPreviewValues(
      produce((values) => {
        values[paramIndex][arrayInputIndex].subInputs[subInputIndex] = value;
      })
    );
  };

  const startEditingPromptName = (id: number) => {
    setEditingPromptId(id);
  };

  const finishEditingPromptName = (id: number, newTitle: string) => {
    setPrompts(
      produce((prompts) => {
        const prompt = prompts.find((p) => p.id === id);
        if (prompt) prompt.title = newTitle;
      })
    );
    setEditingPromptId(null);
  };

  const onDragStart = (e: DragEvent, index: number) => {
    e.dataTransfer?.setData("text/plain", index.toString());
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent, index: number) => {
    const draggedIndex = parseInt(e.dataTransfer?.getData("text/plain") || "-1");
    if (draggedIndex !== -1 && draggedIndex !== index) {
      setPrompts(
        produce((prompts) => {
          const [removed] = prompts.splice(draggedIndex, 1);
          prompts.splice(index, 0, removed);
        })
      );
      if (activePrompt() === draggedIndex) {
        setActivePrompt(index);
      } else if (activePrompt() > draggedIndex && activePrompt() <= index) {
        setActivePrompt(activePrompt() - 1);
      } else if (activePrompt() < draggedIndex && activePrompt() >= index) {
        setActivePrompt(activePrompt() + 1);
      }
    }
  };

  const executeCallback = () => {
    const activePromptData = prompts[activePrompt()];
    if (!activePromptData) return;

    const paramValues = activePromptData.params.map((_, index) => previewValues[index] || "");

    try {
      const safeFunction = new Function(
        ...activePromptData.params.map((_, i) => `param${i + 1}`),
        activePromptData.callback
      );

      const result = safeFunction(...paramValues);

      setCallbackOutput(result);
    } catch (error) {
      setCallbackOutput(`Error executing callback: ${(error as Error).message}`);
    }
  };

  const getPreviewOutput = () => {
    return callbackOutput();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "auto", p: 2 }}>
      <Accordion title="Prompts">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <For each={prompts}>
            {(prompt, index) => (
              <Button
                variant={activePrompt() === index() ? "contained" : "outlined"}
                onClick={() => setActivePrompt(index())}
                sx={{ textTransform: "none" }}
                draggable={true}
                onDragStart={(e) => onDragStart(e, index())}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index())}
              >
                <DragIndicatorIcon sx={{ mr: 1, cursor: "move" }} />
                {editingPromptId() === prompt.id ? (
                  <TextField
                    value={prompt.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setPrompts(
                        produce((prompts) => {
                          const p = prompts.find((p) => p.id === prompt.id);
                          if (p) p.title = e.target.value;
                        })
                      )
                    }
                    onBlur={() => finishEditingPromptName(prompt.id, prompt.title)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        finishEditingPromptName(prompt.id, prompt.title);
                      }
                    }}
                    size="small"
                    autoFocus
                  />
                ) : (
                  <span onDblClick={() => startEditingPromptName(prompt.id)}>{prompt.title}</span>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePrompt(prompt.id);
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
            onClick={addNewPrompt}
            sx={{ ml: "auto", display: "flex", justifyContent: "center" }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Accordion>
      <Show when={prompts.length > 0}>
        <Accordion title="System Prompt">
          <Paper sx={{ flex: 1, p: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={prompts[activePrompt()]?.system || ""}
              onChange={(e) => updatePromptSystem(prompts[activePrompt()].id, e.target.value)}
              sx={{ mb: 2, maxHeight: 300, overflowY: "auto" }}
            />
          </Paper>
        </Accordion>
        <Accordion title="Parameters">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Paper sx={{ flex: 1, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Parameters
              </Typography>
              <For each={prompts[activePrompt()]?.params}>
                {(param, paramIndex) => (
                  <Box
                    sx={{ display: "flex", gap: 1, mb: 1, alignItems: "flex-start", width: "100%" }}
                  >
                    <FormControl sx={{ minWidth: 120, flex: 1 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={param.type}
                        label="Type"
                        onChange={(e) =>
                          updateParamType(
                            prompts[activePrompt()].id,
                            paramIndex(),
                            e.target.value as any
                          )
                        }
                      >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="number">Number</MenuItem>
                        <MenuItem value="select">Select</MenuItem>
                        <MenuItem value="array">Array</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      sx={{ flex: 1 }}
                      value={param.label}
                      onChange={(e) =>
                        updateParamLabel(prompts[activePrompt()].id, paramIndex(), e.target.value)
                      }
                      label="Label"
                    />
                    <Show when={param.type === "select"}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                        <For each={param.options}>
                          {(option, optionIndex) => (
                            <TextField
                              size="small"
                              value={option.value}
                              onChange={(e) =>
                                updateSelectOption(
                                  prompts[activePrompt()].id,
                                  paramIndex(),
                                  optionIndex(),
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex() + 1}`}
                            />
                          )}
                        </For>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => addSelectOption(prompts[activePrompt()].id, paramIndex())}
                        >
                          Add Option
                        </Button>
                      </Box>
                    </Show>
                    <IconButton
                      size="small"
                      onClick={() => removeParam(prompts[activePrompt()].id, paramIndex())}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </For>
              <Button
                variant="outlined"
                onClick={() => addParam(prompts[activePrompt()].id)}
                startIcon={<AddIcon />}
                sx={{ mt: 1, mb: 2 }}
              >
                Add Parameter
              </Button>
            </Paper>
          </Box>
        </Accordion>
        <Accordion title="Callback" open={true}>
          <Accordion title="Inputs">
            <Paper sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Parameters
              </Typography>
              <For each={prompts[activePrompt()]?.params}>
                {(param, paramIndex) => (
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                      {param.type === "array" && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => addArrayInput(paramIndex())}
                          >
                            Add Item
                          </Button>
                          <For each={previewValues[paramIndex()] || []}>
                            {(arrayInput, arrayInputIndex) => (
                              <Box sx={{ mt: 1, ml: 2 }}>
                                <TextField
                                  fullWidth
                                  defaultValue={arrayInput.value}
                                  onBlur={(event: any) =>
                                    updateArrayInputValue(
                                      paramIndex(),
                                      arrayInputIndex(),
                                      event.target.value
                                    )
                                  }
                                  label={`${param.label} - Item ${arrayInputIndex() + 1}`}
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => addSubInput(paramIndex(), arrayInputIndex())}
                                  sx={{ mt: 1 }}
                                >
                                  Add Sub-Input
                                </Button>
                                <For each={arrayInput.subInputs}>
                                  {(subInput, subInputIndex) => (
                                    <TextField
                                      fullWidth
                                      defaultValue={subInput}
                                      onBlur={(event: any) =>
                                        updateSubInputValue(
                                          paramIndex(),
                                          arrayInputIndex(),
                                          subInputIndex(),
                                          event.target.value
                                        )
                                      }
                                      label={`${param.label} - Sub-Input ${subInputIndex() + 1}`}
                                      sx={{ mt: 1, ml: 2 }}
                                    />
                                  )}
                                </For>
                              </Box>
                            )}
                          </For>
                        </Box>
                      )}
                      {param.type === "select" && (
                        <>
                          <InputLabel>{param.label}</InputLabel>
                          <Select
                            value={previewValues[paramIndex()] || ""}
                            onChange={(e) => updatePreviewValue(paramIndex(), e.target.value)}
                            label={param.label}
                          >
                            <For each={param.options}>
                              {(option) => <MenuItem value={option.value}>{option.value}</MenuItem>}
                            </For>
                          </Select>
                        </>
                      )}
                      {(param.type === "text" || param.type === "number") && (
                        <TextField
                          fullWidth
                          type={param.type}
                          defaultValue={previewValues[paramIndex()] || ""}
                          onBlur={(event: any) =>
                            updatePreviewValue(paramIndex(), event.target.value)
                          }
                          label={param.label}
                        />
                      )}
                    </FormControl>
                  </Box>
                )}
              </For>
            </Paper>
          </Accordion>
          <Paper sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Available Parameters
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <For each={getParamInfo()}>
                {(param) => (
                  <>
                    <Chip
                      label={`${param.name} (${param.type})`}
                      onClick={() => copyParamName(param.name)}
                      deleteIcon={<ContentCopyIcon />}
                      onDelete={() => copyParamName(param.name)}
                    />
                    {param.type === "array" && (
                      <Chip
                        label={`${param.name}.subItems (array)`}
                        onClick={() => copyParamName(param.name, true)}
                        deleteIcon={<ContentCopyIcon />}
                        onDelete={() => copyParamName(param.name, true)}
                      />
                    )}
                  </>
                )}
              </For>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Callback Function
            </Typography>
            <Highlight
              value={prompts[activePrompt()]?.callback || ""}
              onChange={(value: any) => updatePromptCallback(prompts[activePrompt()].id, value)}
            />
            <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 2 }}>
              <Button variant="contained" onClick={executeCallback}>
                Execute Callback
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() =>
                  copyToClipboard(
                    prompts[activePrompt()]?.system || "",
                    "System prompt copied to clipboard"
                  )
                }
              >
                Copy System Prompt
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() =>
                  copyToClipboard(callbackOutput(), "Callback output copied to clipboard")
                }
              >
                Copy Callback Output
              </Button>
            </Box>
          </Paper>
        </Accordion>
        <Accordion title="Output">
          <Paper sx={{ flex: 1, p: 2 }}>
            <TextField
              multiline
              fullWidth
              minRows={2}
              value={getPreviewOutput()}
              InputProps={{ readOnly: true }}
              sx={{ maxHeight: 300, overflowY: "auto" }}
            />
          </Paper>
        </Accordion>
      </Show>
      <Snackbar
        open={snackbarOpen()}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage()}
      />
    </Box>
  );
};
