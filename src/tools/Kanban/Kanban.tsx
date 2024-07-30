import { For, Show, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@suid/material";
import AddIcon from "@suid/icons-material/Add";
import DeleteIcon from "@suid/icons-material/Delete";
import EditIcon from "@suid/icons-material/Edit";
import DragIndicatorIcon from "@suid/icons-material/DragIndicator";
import { styled } from "solid-styled-components";
import { isEmpty } from "lodash";

interface Task {
  id: string;
  title: string;
  description: string;
}
interface Column {
  id: string;
  title: string;
  tasks: Task[];
  isDefault?: boolean;
}
interface Board {
  id: string;
  title: string;
  columns: Column[];
}

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  background-color: #b2c4cd;
`;

const BoardContainer = styled(Box)`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  justify-content: space-between;
  margin-top: 50px;
`;

const Column = styled(Card)`
  min-width: 300px;
  max-width: 300px;
  min-height: 600px;
  display: flex;
  flex-direction: row;
  background-color: rgba(255, 255, 255, 0.5) !important;
`;

const TaskCard = styled(Card)`
  margin-bottom: 10px;
  cursor: pointer;
`;

const BoardButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-transform: none;
`;

export const Kanban = () => {
  const [store, setStore] = createStore({
    boards: [] as Board[],
    activeBoard: null as string | null,
    newBoardTitle: "",
    newColumnTitle: "",
    newTaskTitle: "",
    newTaskDescription: "",
    editingTask: null as Task | null,
    isTaskDialogOpen: false,
    isDeleteBoardDialogOpen: false,
    isDeleteColumnDialogOpen: false,
    boardToDelete: null as string | null,
    columnToDelete: null as string | null,
    activeColumnId: null as string | null,
    draggedBoardId: null as string | null,
  });

  onMount(() => {
    const storedBoards = localStorage.getItem("webtools/kanbanboards");
    if (storedBoards) {
      const parsedBoards: Board[] = JSON.parse(storedBoards);
      setStore("boards", parsedBoards);
      if (!isEmpty(parsedBoards)) {
        setStore("activeBoard", parsedBoards[0].id);
      }
    } else {
      // Initialize with a default board if none exists
      const defaultBoard: Board = {
        id: Date.now().toString(),
        title: "Default Board",
        columns: [
          { id: "todo", title: "To Do", tasks: [], isDefault: true },
          { id: "inprogress", title: "In Progress", tasks: [], isDefault: true },
          { id: "done", title: "Done", tasks: [], isDefault: true },
        ],
      };
      setStore("boards", [defaultBoard]);
      setStore("activeBoard", defaultBoard.id);
    }
  });

  const saveToLocalStorage = () => {
    localStorage.setItem("webtools/kanbanboards", JSON.stringify(store.boards));
  };

  const addBoard = () => {
    if (store.newBoardTitle) {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: store.newBoardTitle,
        columns: [
          { id: "todo", title: "To Do", tasks: [], isDefault: true },
          { id: "inprogress", title: "In Progress", tasks: [], isDefault: true },
          { id: "done", title: "Done", tasks: [], isDefault: true },
        ],
      };
      setStore("boards", (boards) => [...boards, newBoard]);
      setStore("newBoardTitle", "");
      if (!store.activeBoard) {
        setStore("activeBoard", newBoard.id);
      }
      saveToLocalStorage();
    }
  };

  const removeBoard = (boardId: string) => {
    setStore("boardToDelete", boardId);
    setStore("isDeleteBoardDialogOpen", true);
  };

  const confirmRemoveBoard = () => {
    setStore("boards", (boards) => boards.filter((board) => board.id !== store.boardToDelete));
    if (store.activeBoard === store.boardToDelete) {
      const newActiveBoard = store.boards.find((board) => board.id !== store.boardToDelete);
      setStore("activeBoard", newActiveBoard ? newActiveBoard.id : null);
    }
    setStore("isDeleteBoardDialogOpen", false);
    setStore("boardToDelete", null);
    saveToLocalStorage();
  };

  const addColumn = () => {
    if (store.newColumnTitle && store.activeBoard) {
      setStore("boards", (boards) =>
        boards.map((board) => {
          if (board.id === store.activeBoard) {
            return {
              ...board,
              columns: [
                ...board.columns,
                {
                  id: Date.now().toString(),
                  title: store.newColumnTitle,
                  tasks: [],
                  isDefault: false,
                },
              ],
            };
          }
          return board;
        })
      );
      setStore("newColumnTitle", "");
      saveToLocalStorage();
    }
  };

  const removeColumn = (columnId: string) => {
    setStore("columnToDelete", columnId);
    setStore("isDeleteColumnDialogOpen", true);
  };

  const confirmRemoveColumn = () => {
    if (store.columnToDelete && store.activeBoard) {
      setStore("boards", (boards) =>
        boards.map((board) => {
          if (board.id === store.activeBoard) {
            return {
              ...board,
              columns: board.columns.filter((column) => column.id !== store.columnToDelete),
            };
          }
          return board;
        })
      );
      setStore("isDeleteColumnDialogOpen", false);
      setStore("columnToDelete", null);
      saveToLocalStorage();
    }
  };

  const openAddTaskDialog = (columnId: string) => {
    setStore("editingTask", null);
    setStore("newTaskTitle", "");
    setStore("newTaskDescription", "");
    setStore("activeColumnId", columnId);
    setStore("isTaskDialogOpen", true);
  };

  const handleAddTask = () => {
    if (store.newTaskTitle && store.activeBoard && store.activeColumnId) {
      setStore("boards", (boards) =>
        boards.map((board) => {
          if (board.id === store.activeBoard) {
            return {
              ...board,
              columns: board.columns.map((column) => {
                if (column.id === store.activeColumnId) {
                  return {
                    ...column,
                    tasks: [
                      ...column.tasks,
                      {
                        id: Date.now().toString(),
                        title: store.newTaskTitle,
                        description: store.newTaskDescription,
                      },
                    ],
                  };
                }
                return column;
              }),
            };
          }
          return board;
        })
      );
      setStore("newTaskTitle", "");
      setStore("newTaskDescription", "");
      setStore("isTaskDialogOpen", false);
      setStore("activeColumnId", null);
      saveToLocalStorage();
    }
  };

  const editTask = (task: Task) => {
    setStore("editingTask", task);
    setStore("newTaskTitle", task.title);
    setStore("newTaskDescription", task.description);
    setStore("isTaskDialogOpen", true);
  };

  const handleEditTask = () => {
    if (store.editingTask && store.activeBoard) {
      setStore("boards", (boards) =>
        boards.map((board) => {
          if (board.id === store.activeBoard) {
            return {
              ...board,
              columns: board.columns.map((column) => {
                const taskIndex = column.tasks.findIndex((t) => t.id === store.editingTask?.id);
                if (taskIndex !== -1) {
                  return {
                    ...column,
                    tasks: column.tasks.map((task, index) =>
                      index === taskIndex
                        ? {
                            ...task,
                            title: store.newTaskTitle,
                            description: store.newTaskDescription,
                          }
                        : task
                    ),
                  };
                }
                return column;
              }),
            };
          }
          return board;
        })
      );
      setStore("isTaskDialogOpen", false);
      setStore("editingTask", null);
      saveToLocalStorage();
    }
  };

  const removeTask = (columnId: string, taskId: string) => {
    if (store.activeBoard) {
      setStore("boards", (boards) =>
        boards.map((board) => {
          if (board.id === store.activeBoard) {
            return {
              ...board,
              columns: board.columns.map((column) => {
                if (column.id === columnId) {
                  return {
                    ...column,
                    tasks: column.tasks.filter((t) => t.id !== taskId),
                  };
                }
                return column;
              }),
            };
          }
          return board;
        })
      );
      saveToLocalStorage();
    }
  };

  const moveTask = (fromColumnId: string, toColumnId: string, taskId: string) => {
    if (store.activeBoard) {
      setStore("boards", (boards) =>
        boards.map((board) => {
          if (board.id === store.activeBoard) {
            const fromColumn = board.columns.find((c) => c.id === fromColumnId);
            const toColumn = board.columns.find((c) => c.id === toColumnId);
            if (fromColumn && toColumn) {
              const task = fromColumn.tasks.find((t) => t.id === taskId);
              if (task) {
                return {
                  ...board,
                  columns: board.columns.map((column) => {
                    if (column.id === fromColumnId) {
                      return {
                        ...column,
                        tasks: column.tasks.filter((t) => t.id !== taskId),
                      };
                    }
                    if (column.id === toColumnId) {
                      return {
                        ...column,
                        tasks: [...column.tasks, task],
                      };
                    }
                    return column;
                  }),
                };
              }
            }
          }
          return board;
        })
      );
      saveToLocalStorage();
    }
  };

  const onDragStartBoard = (e: DragEvent, boardId: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", boardId);
    }
    setStore("draggedBoardId", boardId);
  };

  const onDragOverBoard = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDropBoard = (e: DragEvent, targetBoardId: string) => {
    e.preventDefault();
    const draggedBoardId = store.draggedBoardId;
    if (draggedBoardId && draggedBoardId !== targetBoardId) {
      const draggedIndex = store.boards.findIndex((b) => b.id === draggedBoardId);
      const targetIndex = store.boards.findIndex((b) => b.id === targetBoardId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        setStore("boards", (boards) => {
          const newBoards = [...boards];
          const [removed] = newBoards.splice(draggedIndex, 1);
          newBoards.splice(targetIndex, 0, removed);
          return newBoards;
        });
        saveToLocalStorage();
      }
    }
    setStore("draggedBoardId", null);
  };

  return (
    <Container>
      <Box sx={{ maxWidth: "980px", width: "100%", textAlign: "center" }}>
        <Box sx={{ width: "100%", textAlign: "center", margin: "24px 0px" }}>
          <Typography variant="h4" sx={{ mb: 2, width: "100%", textAlign: "center" }}>
            Kanban Boards
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2, width: "100%" }}>
            <TextField
              label="New Board Title"
              value={store.newBoardTitle}
              onChange={(e) => setStore("newBoardTitle", e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={addBoard} startIcon={<AddIcon />}>
              Add Board
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <For each={store.boards}>
            {(board) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "200px",
                }}
                draggable
                onDragStart={(e) => onDragStartBoard(e, board.id)}
                onDragOver={onDragOverBoard}
                onDrop={(e) => onDropBoard(e, board.id)}
              >
                <BoardButton
                  variant={store.activeBoard === board.id ? "contained" : "outlined"}
                  onClick={() => setStore("activeBoard", board.id)}
                  sx={{ width: "100%", justifyContent: "space-between" }}
                >
                  <DragIndicatorIcon sx={{ mr: 1, cursor: "move" }} />
                  {board.title}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBoard(board.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </BoardButton>
              </Box>
            )}
          </For>
        </Box>
        <Show when={store.activeBoard}>
          <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 2 }}>
            <TextField
              label="New Column Title"
              value={store.newColumnTitle}
              onChange={(e) => setStore("newColumnTitle", e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={addColumn} startIcon={<AddIcon />}>
              Add Column
            </Button>
          </Box>
          <BoardContainer>
            <For each={store.boards.find((b) => b.id === store.activeBoard)?.columns}>
              {(column) => (
                <Column>
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer) {
                        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                        moveTask(data.columnId, column.id, data.taskId);
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">{column.title}</Typography>
                      {!column.isDefault && (
                        <IconButton size="small" onClick={() => removeColumn(column.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    <For each={column.tasks}>
                      {(task) => (
                        <TaskCard
                          onDragStart={(e) => {
                            if (e?.dataTransfer) {
                              e.dataTransfer.setData(
                                "text/plain",
                                JSON.stringify({ columnId: column.id, taskId: task.id })
                              );
                            }
                          }}
                          sx={{ cursor: "grab", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                          draggable
                        >
                          <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={{ flex: 1, textAlign: "start" }} variant="subtitle1">
                              {task.title}
                            </Typography>
                            <Box sx={{ display: "flex" }}>
                              <IconButton size="small" onClick={() => editTask(task)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => removeTask(column.id, task.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </TaskCard>
                      )}
                    </For>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => openAddTaskDialog(column.id)}
                      startIcon={<AddIcon />}
                      sx={{ marginTop: "auto" }}
                    >
                      Add Task
                    </Button>
                  </CardContent>
                </Column>
              )}
            </For>
          </BoardContainer>
        </Show>
      </Box>

      {/* Task Dialog */}
      <Dialog open={store.isTaskDialogOpen} onClose={() => setStore("isTaskDialogOpen", false)}>
        <DialogTitle>{store.editingTask ? "Edit Task" : "New Task"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={store.newTaskTitle}
            onChange={(e) => setStore("newTaskTitle", e.target.value)}
          />
          <TextField
            margin="dense"
            label="Task Description"
            fullWidth
            multiline
            rows={4}
            value={store.newTaskDescription}
            onChange={(e) => setStore("newTaskDescription", e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStore("isTaskDialogOpen", false)}>Cancel</Button>
          <Button onClick={store.editingTask ? handleEditTask : handleAddTask}>
            {store.editingTask ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Board Confirmation Dialog */}
      <Dialog
        open={store.isDeleteBoardDialogOpen}
        onClose={() => setStore("isDeleteBoardDialogOpen", false)}
      >
        <DialogTitle>Confirm Delete Board</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this board? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStore("isDeleteBoardDialogOpen", false)}>Cancel</Button>
          <Button onClick={confirmRemoveBoard} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Column Confirmation Dialog */}
      <Dialog
        open={store.isDeleteColumnDialogOpen}
        onClose={() => setStore("isDeleteColumnDialogOpen", false)}
      >
        <DialogTitle>Confirm Delete Column</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this column? All tasks in this column will be lost. This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStore("isDeleteColumnDialogOpen", false)}>Cancel</Button>
          <Button onClick={confirmRemoveColumn} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
