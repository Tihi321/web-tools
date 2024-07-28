import { createSignal, createEffect, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
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

const BoardContainer = styled(Box)`
  display: flex;
  overflow-x: auto;
  padding: 20px;
  gap: 20px;
`;

const Column = styled(Card)`
  min-width: 300px;
  max-width: 300px;
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
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export const Kanban = () => {
  const [boards, setBoards] = createStore<Board[]>([]);
  const [activeBoard, setActiveBoard] = createSignal<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = createSignal("");
  const [newColumnTitle, setNewColumnTitle] = createSignal("");
  const [newTaskTitle, setNewTaskTitle] = createSignal("");
  const [newTaskDescription, setNewTaskDescription] = createSignal("");
  const [editingTask, setEditingTask] = createSignal<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = createSignal(false);

  // Load boards from localStorage on component mount
  createEffect(() => {
    const storedBoards = localStorage.getItem("kanban-boards");
    if (storedBoards) {
      setBoards(JSON.parse(storedBoards));
      if (boards.length > 0) {
        setActiveBoard(boards[0].id);
      }
    } else {
      // Initialize with a default board if none exists
      const defaultBoard: Board = {
        id: Date.now().toString(),
        title: "Default Board",
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "inprogress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
      };
      setBoards([defaultBoard]);
      setActiveBoard(defaultBoard.id);
    }
  });

  // Save boards to localStorage whenever they change
  createEffect(() => {
    localStorage.setItem("kanban-boards", JSON.stringify(boards));
  });

  const addBoard = () => {
    if (newBoardTitle()) {
      setBoards(
        produce((boards) => {
          boards.push({
            id: Date.now().toString(),
            title: newBoardTitle(),
            columns: [
              { id: "todo", title: "To Do", tasks: [] },
              { id: "inprogress", title: "In Progress", tasks: [] },
              { id: "done", title: "Done", tasks: [] },
            ],
          });
        })
      );
      setNewBoardTitle("");
      if (!activeBoard()) {
        setActiveBoard(boards[boards.length - 1].id);
      }
    }
  };

  const addColumn = () => {
    if (newColumnTitle() && activeBoard()) {
      setBoards(
        produce((boards) => {
          const board = boards.find((b) => b.id === activeBoard());
          if (board) {
            board.columns.push({
              id: Date.now().toString(),
              title: newColumnTitle(),
              tasks: [],
            });
          }
        })
      );
      setNewColumnTitle("");
    }
  };

  const addTask = (columnId: string) => {
    setEditingTask(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsTaskDialogOpen(true);

    const handleAddTask = () => {
      if (newTaskTitle() && activeBoard()) {
        setBoards(
          produce((boards) => {
            const board = boards.find((b) => b.id === activeBoard());
            if (board) {
              const column = board.columns.find((c) => c.id === columnId);
              if (column) {
                column.tasks.push({
                  id: Date.now().toString(),
                  title: newTaskTitle(),
                  description: newTaskDescription(),
                });
              }
            }
          })
        );
        setNewTaskTitle("");
        setNewTaskDescription("");
        setIsTaskDialogOpen(false);
      }
    };

    return handleAddTask;
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = () => {
    if (editingTask() && activeBoard()) {
      setBoards(
        produce((boards) => {
          const board = boards.find((b) => b.id === activeBoard());
          if (board) {
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
        })
      );
      setIsTaskDialogOpen(false);
    }
  };

  const removeTask = (columnId: string, taskId: string) => {
    if (activeBoard()) {
      setBoards(
        produce((boards) => {
          const board = boards.find((b) => b.id === activeBoard());
          if (board) {
            const column = board.columns.find((c) => c.id === columnId);
            if (column) {
              column.tasks = column.tasks.filter((t) => t.id !== taskId);
            }
          }
        })
      );
    }
  };

  const moveTask = (fromColumnId: string, toColumnId: string, taskId: string) => {
    if (activeBoard()) {
      setBoards(
        produce((boards) => {
          const board = boards.find((b) => b.id === activeBoard());
          if (board) {
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
        })
      );
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Kanban Boards
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="New Board Title"
          value={newBoardTitle()}
          onChange={(e) => setNewBoardTitle(e.target.value)}
        />
        <Button variant="contained" onClick={addBoard} startIcon={<AddIcon />}>
          Add Board
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <For each={boards}>
          {(board) => (
            <Button
              variant={activeBoard() === board.id ? "contained" : "outlined"}
              onClick={() => setActiveBoard(board.id)}
            >
              {board.title}
            </Button>
          )}
        </For>
      </Box>
      <Show when={activeBoard()}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="New Column Title"
            value={newColumnTitle()}
            onChange={(e) => setNewColumnTitle(e.target.value)}
          />
          <Button variant="contained" onClick={addColumn} startIcon={<AddIcon />}>
            Add Column
          </Button>
        </Box>
        <BoardContainer>
          <For each={boards.find((b) => b.id === activeBoard())?.columns}>
            {(column) => (
              <Column>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {column.title}
                  </Typography>
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
                        draggable
                      >
                        <CardContent>
                          <Typography variant="subtitle1">{task.title}</Typography>
                          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                            <IconButton size="small" onClick={() => editTask(task)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => removeTask(column.id, task.id)}>
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
                    onClick={addTask(column.id)}
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    Add Task
                  </Button>
                </CardContent>
                <Box
                  sx={{ minHeight: 50 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer) {
                      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
                      moveTask(data.columnId, column.id, data.taskId);
                    }
                  }}
                />
              </Column>
            )}
          </For>
        </BoardContainer>
      </Show>
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
          <Button onClick={editingTask() ? handleEditTask : addTask("")}>
            {editingTask() ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
