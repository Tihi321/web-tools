import { createSignal, For, Show, onMount } from "solid-js";
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
import { styled } from "solid-styled-components";
import { filter, find, get, map } from "lodash";

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

export const Kanban = () => {
  const [boards, setBoards] = createSignal<Board[]>([]);
  const [activeBoard, setActiveBoard] = createSignal<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = createSignal("");
  const [newColumnTitle, setNewColumnTitle] = createSignal("");
  const [newTaskTitle, setNewTaskTitle] = createSignal("");
  const [newTaskDescription, setNewTaskDescription] = createSignal("");
  const [editingTask, setEditingTask] = createSignal<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = createSignal(false);
  const [isDeleteBoardDialogOpen, setIsDeleteBoardDialogOpen] = createSignal(false);
  const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] = createSignal(false);
  const [boardToDelete, setBoardToDelete] = createSignal<string | null>(null);
  const [columnToDelete, setColumnToDelete] = createSignal<string | null>(null);
  const [activeColumnId, setActiveColumnId] = createSignal<string | null>(null);

  // Load boards from localStorage on component mount
  onMount(() => {
    const storedBoards = localStorage.getItem("webtools/kanbanboards");
    if (storedBoards) {
      const parsedBoards: Board[] = JSON.parse(storedBoards);
      setBoards(parsedBoards);
      if (parsedBoards.length > 0) {
        setActiveBoard(parsedBoards[0].id);
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
      setBoards([defaultBoard]);
      setActiveBoard(defaultBoard.id);
    }
  });

  const addBoard = () => {
    if (newBoardTitle()) {
      const newState = [
        ...boards(),
        {
          id: Date.now().toString(),
          title: newBoardTitle(),
          columns: [
            { id: "todo", title: "To Do", tasks: [], isDefault: true },
            { id: "inprogress", title: "In Progress", tasks: [], isDefault: true },
            { id: "done", title: "Done", tasks: [], isDefault: true },
          ],
        },
      ];
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
      setNewBoardTitle("");
      if (!activeBoard()) {
        setActiveBoard(get(boards(), [boards().length - 1, "id"]));
      }
    }
  };

  const removeBoard = (boardId: string) => {
    setBoardToDelete(boardId);
    setIsDeleteBoardDialogOpen(true);
  };

  const confirmRemoveBoard = () => {
    if (boardToDelete()) {
      const newState = filter(boards(), (board) => board.id !== boardToDelete());
      if (activeBoard() === boardToDelete()) {
        const newActiveBoard = newState.find((board) => board.id !== boardToDelete());
        setActiveBoard(newActiveBoard?.id || null);
      }
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
      setIsDeleteBoardDialogOpen(false);
      setBoardToDelete(null);
    }
  };

  const addColumn = () => {
    if (newColumnTitle() && activeBoard()) {
      const newState = map(boards(), (board) => {
        if (board.id === activeBoard()) {
          board.columns.push({
            id: Date.now().toString(),
            title: newColumnTitle(),
            tasks: [],
            isDefault: false,
          });
        }
        return board;
      });
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
      setNewColumnTitle("");
    }
  };

  const removeColumn = (columnId: string) => {
    setColumnToDelete(columnId);
    setIsDeleteColumnDialogOpen(true);
  };

  const confirmRemoveColumn = () => {
    if (columnToDelete() && activeBoard()) {
      const newState = map(boards(), (board) => {
        if (board.id === activeBoard()) {
          board.columns = filter(
            get(board, ["columns"]),
            (column) => column.id !== columnToDelete()
          );
        }
        return board;
      });
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
      setIsDeleteColumnDialogOpen(false);
      setColumnToDelete(null);
    }
  };

  const openAddTaskDialog = (columnId: string) => {
    setEditingTask(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setActiveColumnId(columnId);
    setIsTaskDialogOpen(true);
  };

  const handleAddTask = () => {
    if (newTaskTitle() && activeBoard() && activeColumnId()) {
      const newState = map(boards(), (board) => {
        if (board.id === activeBoard()) {
          const column = find(get(board, ["columns"]), (c) => c.id === activeColumnId());
          if (column) {
            column.tasks.push({
              id: Date.now().toString(),
              title: newTaskTitle(),
              description: newTaskDescription(),
            });
          }
        }
        return board;
      });
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsTaskDialogOpen(false);
      setActiveColumnId(null);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = () => {
    if (editingTask() && activeBoard()) {
      const newState = map(boards(), (board) => {
        if (board.id === activeBoard()) {
          for (const column of board.columns) {
            const taskIndex = column.tasks.findIndex((t) => t.id === editingTask()?.id);
            if (taskIndex !== -1) {
              column.tasks[taskIndex] = {
                ...column.tasks[taskIndex],
                title: newTaskTitle(),
                description: newTaskDescription(),
              };
              break;
            }
          }
        }
        return board;
      });
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
      setIsTaskDialogOpen(false);
      setEditingTask(null);
    }
  };

  const removeTask = (columnId: string, taskId: string) => {
    if (activeBoard()) {
      const newState = map(boards(), (board) => {
        if (board.id === activeBoard()) {
          const column = board.columns.find((c) => c.id === columnId);
          if (column) {
            column.tasks = column.tasks.filter((t) => t.id !== taskId);
          }
        }
        return board;
      });
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
    }
  };

  const moveTask = (fromColumnId: string, toColumnId: string, taskId: string) => {
    if (activeBoard()) {
      const newState = map(boards(), (board) => {
        if (board.id === activeBoard()) {
          const fromColumn = board.columns.find((c) => c.id === fromColumnId);
          const toColumn = board.columns.find((c) => c.id === toColumnId);
          if (fromColumn && toColumn) {
            const taskIndex = fromColumn.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
              const [task] = fromColumn.tasks.splice(taskIndex, 1);
              toColumn.tasks.push(task);
            }
          }
        }
        return board;
      });
      setBoards(newState);
      localStorage.setItem("webtools/kanbanboards", JSON.stringify(newState));
    }
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
              value={newBoardTitle()}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={addBoard} startIcon={<AddIcon />}>
              Add Board
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flex: 1, gap: 2, mb: 2 }}>
          <For each={boards()}>
            {(board) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant={activeBoard() === board.id ? "contained" : "outlined"}
                  onClick={() => setActiveBoard(board.id)}
                >
                  {board.title}
                </Button>
                <IconButton size="small" onClick={() => removeBoard(board.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </For>
        </Box>
        <Show when={activeBoard()}>
          <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 2 }}>
            <TextField
              label="New Column Title"
              value={newColumnTitle()}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={addColumn} startIcon={<AddIcon />}>
              Add Column
            </Button>
          </Box>
          <BoardContainer>
            <For each={boards().find((b) => b.id === activeBoard())?.columns}>
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
      <Dialog open={isTaskDialogOpen()} onClose={() => setIsTaskDialogOpen(false)}>
        <DialogTitle>{editingTask() ? "Edit Task" : "New Task"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={newTaskTitle()}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Task Description"
            fullWidth
            multiline
            rows={4}
            value={newTaskDescription()}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={editingTask() ? handleEditTask : handleAddTask}>
            {editingTask() ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteBoardDialogOpen()} onClose={() => setIsDeleteBoardDialogOpen(false)}>
        <DialogTitle>Confirm Delete Board</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this board? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteBoardDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRemoveBoard} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteColumnDialogOpen()} onClose={() => setIsDeleteColumnDialogOpen(false)}>
        <DialogTitle>Confirm Delete Column</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this column? All tasks in this column will be lost. This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteColumnDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRemoveColumn} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
